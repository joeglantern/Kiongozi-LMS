#!/bin/bash

# Kiongozi Moderator Dashboard Deployment Script
# Deploys Moderator Dashboard to VPS at /moderator path

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Configuration
REPO_URL="https://github.com/joeglantern/Kiongozi-LMS.git"
DEPLOY_DIR="/root/Kiongozi-LMS"
MODERATOR_DIR="$DEPLOY_DIR/moderator-dashboard"
SUPABASE_URL="https://jdncfyagppohtksogzkx.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkbmNmeWFncHBvaHRrc29nemt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2ODg3NzgsImV4cCI6MjA3MDI2NDc3OH0.mQwRTAu2UYwsF_cmlIQLVVVuCTDMHjsBrxWdWPMQMFQ"
API_URL="https://kiongozi-api.onrender.com/api/v1"

echo ""
log_info "========================================="
log_info "  Kiongozi Moderator Dashboard Deployment"
log_info "========================================="
echo ""

# Step 1: Clone or Update Repository
log_info "Step 1: Cloning/Updating repository..."
if [ -d "$DEPLOY_DIR" ]; then
    log_info "Repository exists, pulling latest changes..."
    cd "$DEPLOY_DIR"
    git fetch origin
    git reset --hard origin/main
    git pull origin main
    log_success "Repository updated"
else
    log_info "Cloning repository..."
    cd /root
    git clone "$REPO_URL"
    cd "$DEPLOY_DIR"
    log_success "Repository cloned"
fi

# Step 2: Create Environment File
log_info "Step 2: Creating environment file for moderator dashboard..."

create_env_file() {
    local target_dir=$1
    local env_file="$target_dir/.env"

    log_info "Creating $env_file..."

    # Remove existing file
    rm -f "$env_file"

    # Create new file line by line (avoids heredoc issues)
    printf "NEXT_PUBLIC_SUPABASE_URL=%s\n" "$SUPABASE_URL" > "$env_file"
    printf "NEXT_PUBLIC_SUPABASE_ANON_KEY=%s\n" "$SUPABASE_ANON_KEY" >> "$env_file"
    printf "NEXT_PUBLIC_API_URL=%s\n" "$API_URL" >> "$env_file"

    # Verify the file was created correctly
    if [ ! -f "$env_file" ]; then
        log_error "Failed to create $env_file"
        exit 1
    fi

    # Check line count (should be exactly 3)
    local line_count=$(wc -l < "$env_file")
    if [ "$line_count" -ne 3 ]; then
        log_error "$env_file has incorrect line count: $line_count (expected 3)"
        cat "$env_file"
        exit 1
    fi

    log_success "Created $env_file (3 lines)"
}

# Create .env for moderator dashboard
create_env_file "$MODERATOR_DIR"

# Step 3: Install Dependencies and Build
log_info "Step 3: Installing dependencies and building moderator dashboard..."
cd "$MODERATOR_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    log_info "Installing dependencies..."
    npm install --production=false
else
    log_info "Dependencies already installed, updating..."
    npm install --production=false
fi

log_info "Building moderator dashboard..."
npm run build
log_success "Moderator dashboard built successfully"

# Step 4: Configure PM2
log_info "Step 4: Configuring PM2..."

# Stop and delete existing moderator dashboard process
log_info "Stopping existing moderator dashboard process..."
pm2 stop moderator-dashboard 2>/dev/null || true
pm2 delete moderator-dashboard 2>/dev/null || true

# Start moderator dashboard using ecosystem file
log_info "Starting moderator dashboard with PM2..."
cd "$DEPLOY_DIR"
pm2 start ecosystem.config.js --only moderator-dashboard
pm2 save

log_success "PM2 configured and moderator dashboard started"

# Step 5: Configure Nginx
log_info "Step 5: Configuring Nginx..."

# Update Nginx config to include moderator dashboard
log_info "Updating Nginx config for moderator dashboard at /moderator..."
cat > /etc/nginx/sites-available/lms << 'NGINX_CONFIG_EOF'
server {
    listen 80;
    server_name _;

    # LMS (main app)
    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Moderator Dashboard
    location /moderator {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
NGINX_CONFIG_EOF

# Enable site
log_info "Enabling Nginx site..."
ln -sf /etc/nginx/sites-available/lms /etc/nginx/sites-enabled/lms

# Test Nginx configuration
log_info "Testing Nginx configuration..."
if nginx -t; then
    log_success "Nginx configuration is valid"
    systemctl reload nginx
    log_success "Nginx reloaded"
else
    log_error "Nginx configuration test failed"
    exit 1
fi

# Step 6: Verify Deployment
log_info "Step 6: Verifying deployment..."
sleep 3  # Give apps time to start

# Check PM2 status
log_info "PM2 Status:"
pm2 status

# Check if apps are responding
log_info "Checking LMS (localhost:3002)..."
if curl -f -s http://localhost:3002 > /dev/null; then
    log_success "LMS is responding"
else
    log_warning "LMS may not be ready yet, check logs: pm2 logs kiongozi-lms"
fi

log_info "Checking Moderator Dashboard (localhost:3001)..."
if curl -f -s http://localhost:3001/moderator > /dev/null; then
    log_success "Moderator Dashboard is responding"
else
    log_warning "Moderator Dashboard may not be ready yet, check logs: pm2 logs moderator-dashboard"
fi

# Final Summary
echo ""
log_success "========================================="
log_success "  Deployment Completed Successfully!"
log_success "========================================="
echo ""
echo "📱 Access your applications:"
echo "   LMS:                http://156.67.25.84"
echo "   Moderator Dashboard: http://156.67.25.84/moderator"
echo ""
echo "📊 Useful commands:"
echo "   View logs:           pm2 logs moderator-dashboard"
echo "   Restart dashboard:   pm2 restart moderator-dashboard"
echo "   Stop dashboard:      pm2 stop moderator-dashboard"
echo "   PM2 status:          pm2 status"
echo ""
log_info "Environment file created at:"
echo "   - $MODERATOR_DIR/.env"
echo ""
log_warning "Note: If login fails, verify .env file has correct keys on single lines"
echo ""
