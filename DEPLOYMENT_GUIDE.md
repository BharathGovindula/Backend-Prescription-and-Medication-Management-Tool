# Deployment Guide: Netlify (Frontend) and Render (Backend)

This guide provides step-by-step instructions for deploying the Prescription and Medication Management Tool using Netlify for the frontend and Render for the backend.

## Prerequisites

- GitHub account
- Netlify account
- Render account
- MongoDB Atlas account (for production database)
- Upstash or Redis Cloud account (for production Redis)
- Cloudinary account (for image storage)

## Frontend Deployment (Netlify)

### 1. Prepare Your Frontend for Production

1. Update the environment variables in `medication-frontend/.env.production`:

```
VITE_API_URL=https://your-render-backend-url.onrender.com/api
```

2. Commit your changes to your GitHub repository.

### 2. Deploy to Netlify

#### Option 1: Deploy via Netlify UI

1. Log in to your Netlify account.
2. Click "New site from Git".
3. Connect to your GitHub repository.
4. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add the environment variables under "Advanced build settings":
   - `VITE_API_URL`: Your Render backend URL
6. Click "Deploy site".

#### Option 2: Deploy via Netlify CLI

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Log in to Netlify:
   ```bash
   netlify login
   ```

3. Initialize your site:
   ```bash
   cd medication-frontend
   netlify init
   ```

4. Deploy your site:
   ```bash
   netlify deploy --prod
   ```

### 3. Configure Netlify Settings

1. Set up redirects for SPA routing:
   - The `netlify.toml` file already includes the necessary redirect rule.

2. Enable HTTPS.

3. Set up a custom domain (optional):
   - Go to "Domain settings" in your Netlify dashboard.
   - Click "Add custom domain".
   - Follow the instructions to configure your domain.

## Backend Deployment (Render)

### 1. Prepare Your Backend for Production

1. Make sure your backend code is ready for production:
   - Proper error handling
   - Security measures
   - Performance optimizations

2. Commit your changes to your GitHub repository.

### 2. Set Up Production Databases

#### MongoDB Atlas

1. Create a new cluster in MongoDB Atlas.
2. Set up a database user with appropriate permissions.
3. Whitelist all IP addresses (0.0.0.0/0) or specific IPs.
4. Get your MongoDB connection string.

#### Redis Cloud or Upstash

1. Create a new Redis database.
2. Get your Redis connection string.

### 3. Deploy to Render

#### Option 1: Deploy via Render Dashboard

1. Log in to your Render account.
2. Click "New" and select "Web Service".
3. Connect to your GitHub repository.
4. Configure the service:
   - Name: `medication-backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add the environment variables:
   - `PORT`: 10000 (Render assigns its own PORT, but your app should use process.env.PORT)
   - `NODE_ENV`: production
   - `JWT_SECRET`: Your secure JWT secret
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `REDIS_URL`: Your Redis Cloud/Upstash connection string
   - `EMAIL_USER`: Your email service username
   - `EMAIL_PASS`: Your email service password
   - `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
   - `CLOUDINARY_API_KEY`: Your Cloudinary API key
   - `CLOUDINARY_API_SECRET`: Your Cloudinary API secret
   - `FRONTEND_URL`: Your Netlify frontend URL
6. Click "Create Web Service".

#### Option 2: Deploy via render.yaml

1. The `render.yaml` file is already created in your repository.
2. Log in to your Render dashboard.
3. Click "Blueprint" and connect to your GitHub repository.
4. Render will automatically detect the `render.yaml` file and create the services.
5. You'll need to manually set the secret environment variables marked with `sync: false`.

## Connecting Frontend and Backend

1. After deploying the backend to Render, get the deployed URL (e.g., `https://medication-backend.onrender.com`).
2. Update the frontend environment variable `VITE_API_URL` in Netlify to point to your Render backend URL.
3. Redeploy the frontend if necessary.

## Post-Deployment Tasks

### 1. Test the Deployed Application

1. Test user registration and login.
2. Test medication management features.
3. Test reminder functionality.
4. Test analytics and reporting.

### 2. Set Up Monitoring

1. Configure Render's built-in monitoring.
2. Set up uptime monitoring using a service like UptimeRobot or Pingdom.

### 3. Set Up Backup Strategy

1. Configure MongoDB Atlas backups.
2. Set up a regular backup schedule.

## Troubleshooting

### Common Issues with Netlify

1. **Build Failures**:
   - Check the build logs for errors.
   - Ensure all dependencies are correctly installed.
   - Verify that the build command and publish directory are correct.

2. **Routing Issues**:
   - Ensure the redirect rule in `netlify.toml` is correct.
   - Check for any path-related issues in your React Router configuration.

### Common Issues with Render

1. **Connection Issues**:
   - Verify that your MongoDB and Redis connection strings are correct.
   - Check that your environment variables are properly set.

2. **Performance Issues**:
   - Consider upgrading from the free tier if you experience performance limitations.
   - Optimize your database queries and implement proper caching.

## Maintenance and Updates

### Updating Your Application

1. Make changes to your codebase locally.
2. Test thoroughly.
3. Commit and push to GitHub.
4. Netlify and Render will automatically rebuild and deploy your application if you've set up continuous deployment.

### Scaling Considerations

1. Monitor your application's performance and resource usage.
2. Upgrade your Render plan as needed.
3. Consider implementing additional caching strategies.
4. Optimize database queries and indexes.

## Security Considerations

1. Regularly update dependencies to patch security vulnerabilities.
2. Implement rate limiting to prevent abuse.
3. Use HTTPS for all communications.
4. Securely manage environment variables and secrets.
5. Implement proper authentication and authorization.

---

For additional support, refer to the official documentation:
- [Netlify Documentation](https://docs.netlify.com/)
- [Render Documentation](https://render.com/docs/)