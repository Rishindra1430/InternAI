# InternAI Backend - Deployment Guide

## Overview
The InternAI backend is a Node.js + Express + TypeScript server that provides:
- User authentication (JWT-based with refresh tokens)
- Job aggregation from Greenhouse, Lever, and Ashby
- Resume uploads to Cloudinary
- AI analysis via Gemini API
- Real-time notifications via Socket.io
- Application tracking and status management

## Prerequisites
- Node.js 20+
- MongoDB Atlas cluster
- Cloudinary account
- Google Gemini API key
- SMTP email credentials (for password reset, email verification)

## Environment Variables

Copy `.env.example` to `.env` and fill in the following:

```bash
# Server
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/internai

# JWT
JWT_ACCESS_SECRET=your_secret_key_here_min_16_chars
JWT_REFRESH_SECRET=your_secret_key_here_min_16_chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Gemini AI
GEMINI_API_KEY=your_gemini_key
GEMINI_MODEL=gemini-1.5-flash

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Client
CLIENT_URL=https://your-frontend-domain.com

# Job Aggregator
RUN_AGGREGATOR_ON_STARTUP=false
```

## Local Development

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Build TypeScript
npm run build

# Run tests
npm test

# Watch tests
npm test:watch

# Verify Cloudinary integration
npm run verify:cloudinary
```

## Deployment to Render

1. Push your code to GitHub
2. Create a new Web Service on [Render](https://render.com)
3. Connect your GitHub repository
4. Set Root Directory to `server`
5. Build Command: `npm run build`
6. Start Command: `npm start`
7. Add all environment variables in Render dashboard (see Environment Variables above)
8. Deploy

The `render.yaml` file is already configured with the correct settings.

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password
- `GET /api/auth/verify-email/:token` - Verify email
- `GET /api/auth/me` - Get current user profile

### Jobs
- `GET /api/jobs` - Search and filter jobs
- `GET /api/jobs/:id` - Get job details
- `GET /api/jobs/saved` - Get saved jobs
- `POST /api/jobs/save/:id` - Save a job
- `DELETE /api/jobs/save/:id` - Unsave a job

### Applications
- `GET /api/applications` - Get user applications
- `POST /api/applications` - Create application
- `PUT /api/applications/:id/status` - Update application status
- `PUT /api/applications/:id/notes` - Update application notes
- `PUT /api/applications/:id/interview-date` - Set interview date
- `DELETE /api/applications/:id` - Delete application

### Resumes
- `GET /api/resumes` - Get user resumes
- `POST /api/resumes/upload` - Upload resume
- `DELETE /api/resumes/:id` - Delete resume

### AI
- `POST /api/ai/analyze-resume` - Analyze resume vs job description
- `POST /api/ai/extract-skills` - Extract skills from resume
- `POST /api/ai/skill-gap` - Analyze skill gaps
- `POST /api/ai/interview-prep` - Generate interview questions

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `DELETE /api/admin/users/:id` - Delete user (admin only)
- `GET /api/admin/jobs` - Get all jobs (admin only)
- `DELETE /api/admin/jobs/:id` - Delete job (admin only)
- `GET /api/admin/analytics` - Get analytics (admin only)
- `POST /api/admin/trigger-job-fetch` - Trigger job aggregation (admin only)

## Health Check

```bash
curl http://localhost:5000/api/health
```

Response:
```json
{
  "success": true,
  "data": null,
  "message": "InternAI API is running"
}
```

## Socket.io Events

### Client → Server
- Connect with JWT token in handshake auth

### Server → Client
- `notification` - Real-time notification event

Example client connection:
```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-access-token'
  }
});

socket.on('notification', (notification) => {
  console.log('New notification:', notification);
});
```

## Monitoring & Logs

Logs are written to console and managed by Winston logger in `src/config/logger.ts`.

For production, consider:
- Setting up Sentry for error tracking
- Using a centralized logging service
- Setting up uptime monitoring (UptimeRobot, etc.)
- Configuring alerts for critical errors

## Database Indexes

The following indexes are automatically created:
- User: `email` (unique)
- Job: `applyUrl` (unique), `externalId + source` (unique), `title + company` (text), `skills`
- Application: `userId`, `jobId`, `userId + jobId` (unique)
- SavedJob: `userId + jobId` (unique)
- Notification: `userId`, `createdAt`

## Performance Tips

1. **Job Aggregation**: The cron job runs every 6 hours. For faster updates, set `RUN_AGGREGATOR_ON_STARTUP=true` in development.
2. **Database**: Ensure MongoDB indexes are created (done automatically by Mongoose).
3. **Rate Limiting**: Global rate limit is 100 requests per 15 minutes per IP.
4. **Caching**: Consider implementing Redis for session/cache management in future.

## Troubleshooting

### Cloudinary upload fails
- Verify `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- Run `npm run verify:cloudinary` to test the connection

### JWT errors
- Ensure `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are at least 16 characters
- Check that refresh token is stored in httpOnly cookies (browser only)

### Job aggregation not running
- Check that provider APIs are accessible (Greenhouse, Lever, Ashby)
- View logs for specific provider errors
- Manually trigger with admin endpoint: `POST /api/admin/trigger-job-fetch`

### Email verification/reset not working
- Verify SMTP credentials (`EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`)
- Check that `CLIENT_URL` is correct (used in email links)
- Gmail requires app-specific passwords, not regular account passwords

## Support

For issues, check:
1. Environment variables are set correctly
2. MongoDB connection is active
3. All API keys are valid
4. Network connectivity to external services
