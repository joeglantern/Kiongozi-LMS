# Kiongozi LMS Frontend

A clean, Odin Project-inspired learning management system for green economy and digital skills education.

## Features

- 🌱 **Course Browser** - Browse all available learning paths
- 📚 **Course Details** - View course modules and enroll
- 📖 **Module Viewer** - Read lessons with markdown support
- 📊 **Progress Tracking** - Track your learning journey
- 🎯 **My Learning** - Dashboard for enrolled courses

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: TailwindCSS + shadcn/ui
- **Language**: TypeScript
- **Authentication**: Supabase
- **API**: Kiongozi API (https://kiongozi-api.onrender.com)

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```

   Then edit `.env.local` with your Supabase credentials.

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3001](http://localhost:3001)** in your browser

## Project Structure

```
lms-frontend/
├── app/
│   ├── lms/
│   │   ├── browse/          # Course browser page
│   │   ├── courses/[id]/    # Course detail page
│   │   ├── my-learning/     # User dashboard
│   │   ├── progress/        # Analytics page
│   │   └── layout.tsx       # LMS layout (dark header)
│   ├── utils/
│   │   ├── apiClient.ts     # API client
│   │   └── supabaseClient.ts
│   ├── types/
│   │   └── lms.ts           # TypeScript types
│   └── contexts/
│       └── UserContext.tsx  # Auth context
├── components/
│   └── ui/                  # shadcn/ui components
└── lib/
    └── utils.ts             # Utility functions
```

## Design Philosophy

Inspired by [The Odin Project](https://www.theodinproject.com/):
- Dark header with light content area
- Copper/gold accents (#c9975b) for badges
- Clean, minimal cards
- Typography-focused
- Generous whitespace
- Human-crafted feel

## Available Scripts

- `npm run dev` - Start development server (port 3001)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## API Integration

The app connects to the Kiongozi API at `https://kiongozi-api.onrender.com/api/v1`.

All API calls are routed through `/api-proxy/*` which is rewritten in `next.config.js`.

## License

Private project for Kiongozi platform.
