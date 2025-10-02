# Kiongozi API Server (Reference)

> **⚠️ READ ONLY REFERENCE** - This API is already deployed and running. You don't need to modify or redeploy it.

**Deployed at**: `https://kiongozi-api.onrender.com/api/v1`

## Purpose

This folder contains the complete API server code for **reference only**. Use it to:

- ✅ Understand endpoint implementations
- ✅ See request/response structures
- ✅ Review validation logic
- ✅ Check authentication patterns
- ✅ Understand database queries

## ⚠️ Important Notes

1. **DO NOT modify this code** - The API is already deployed and serving the production system
2. **DO NOT try to run this locally** - Use the deployed API endpoint
3. **DO NOT redeploy** - This is maintained separately

## 📂 Structure

```
api-server/
├── src/
│   ├── routes/          # All API endpoints
│   │   ├── auth.ts      # Authentication
│   │   ├── content.ts   # Courses & Modules
│   │   ├── progress.ts  # User Progress
│   │   ├── admin.ts     # Admin operations
│   │   ├── user.ts      # User data
│   │   └── chat.ts      # Chat/AI features
│   ├── middleware/
│   │   └── auth.ts      # JWT verification & RBAC
│   ├── config/
│   │   └── supabase.ts  # Database client
│   └── index.ts         # Server entry point
├── package.json
└── tsconfig.json
```

## 🔍 Key Files to Review

### Authentication (`src/middleware/auth.ts`)
- JWT token verification
- Role-based access control (RBAC)
- Protected route patterns

### Content Management (`src/routes/content.ts`)
- GET /courses - List all courses
- POST /courses - Create course
- GET /courses/:id - Get course details
- PUT /courses/:id - Update course
- GET /modules - List modules
- POST /modules - Create module
- POST /courses/:courseId/modules/:moduleId - Add module to course

### Progress Tracking (`src/routes/progress.ts`)
- GET /progress - Get user progress
- POST /progress - Update progress
- GET /stats - Learning statistics
- GET /recommendations - Personalized recommendations

### User Management (`src/routes/user.ts`)
- GET /users/stats - User statistics

### Admin Operations (`src/routes/admin.ts`)
- User management
- System analytics
- Content moderation

## 🔐 Authentication Pattern

All protected routes expect:
```
Authorization: Bearer <JWT_TOKEN>
```

Roles: `user`, `admin`, `moderator`, `content_editor`, `org_admin`, `analyst`, `researcher`

## 💡 How to Use This Code

When building the LMS Frontend or Moderator Dashboard:

1. **Check endpoint signatures** - See what data to send/expect
2. **Review validation** - Understand required fields
3. **Copy type definitions** - Use the same data structures
4. **Understand errors** - See what error responses look like
5. **Follow patterns** - Match the API's expectations

## 🚫 What NOT to Do

- ❌ Don't run `npm install` here
- ❌ Don't start the server locally
- ❌ Don't modify any files
- ❌ Don't commit changes to this folder
- ❌ Don't try to deploy this

## ✅ What to Do Instead

Use the deployed API:
```typescript
const API_BASE_URL = 'https://kiongozi-api.onrender.com/api/v1';

// Example: Fetch courses
const response = await fetch(`${API_BASE_URL}/content/courses`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

**Questions?** Refer to the main KIONGOZI_LMS_DEVELOPMENT_GUIDE.md
