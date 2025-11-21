# Suraksha Backend Deployment Guide

This guide covers multiple deployment options for the Suraksha Backend API.

## Environment Variables

Before deploying, ensure you have all required environment variables:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority&appName=ClusterName
JWT_SECRET=your-secret-key-here
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=SURAKSHA Safety <noreply@yourdomain.com>
ELEVEN_LABS_API_KEY=your-eleven-labs-api-key (optional)
TWILIO_ACCOUNT_SID=your-twilio-sid (optional)
TWILIO_AUTH_TOKEN=your-twilio-token (optional)
TWILIO_PHONE_NUMBER=your-twilio-number (optional)
NODE_ENV=production
PORT=3000
```

## Deployment Options

### 1. Vercel (Recommended for Quick Deploy)

Vercel is the easiest way to deploy the Node.js backend:

1. **Prerequisites:**
   ```bash
   npm install -g vercel
   ```

2. **Using the deployment script:**
   ```bash
   # Set your environment variables first
   export MONGODB_URI="your-mongodb-uri"
   export JWT_SECRET="your-jwt-secret"
   export RESEND_API_KEY="your-resend-key"
   export EMAIL_FROM="your-email"
   export ELEVEN_LABS_API_KEY="your-elevenlabs-key"

   # Run the deployment script
   ./deploy.sh
   ```

3. **Manual Vercel deployment:**
   ```bash
   vercel --prod
   ```

   Then add environment variables in the Vercel dashboard.

4. **Update frontend:**
   After deployment, update the production API URL in your frontend's `src/lib/api.ts`.

### 2. Docker Deployment

For containerized deployment on any cloud provider:

1. **Build and run locally:**
   ```bash
   # Create .env file with your variables
   cp .env.example .env
   # Edit .env with your actual values

   # Build and run
   docker-compose up --build
   ```

2. **Deploy to cloud providers:**
   - **Railway:** Push the Docker config to Railway
   - **Render:** Connect your repo and use Docker deployment
   - **DigitalOcean App Platform:** Use the Docker option
   - **AWS ECS/Fargate:** Use the Dockerfile for container deployment

### 3. Traditional VPS/Server

For VPS deployment (Ubuntu/CentOS):

1. **Install Node.js and PM2:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   npm install -g pm2
   ```

2. **Clone and setup:**
   ```bash
   git clone <your-repo-url>
   cd suraksha-backend
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

4. **Start with PM2:**
   ```bash
   pm2 start src/server.js --name suraksha-backend
   pm2 startup
   pm2 save
   ```

5. **Setup Nginx reverse proxy:**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

### 4. Heroku

For Heroku deployment:

1. **Create Heroku app:**
   ```bash
   heroku create suraksha-backend
   ```

2. **Set environment variables:**
   ```bash
   heroku config:set MONGODB_URI="your-mongodb-uri"
   heroku config:set JWT_SECRET="your-jwt-secret"
   heroku config:set RESEND_API_KEY="your-resend-key"
   heroku config:set EMAIL_FROM="your-email"
   heroku config:set ELEVEN_LABS_API_KEY="your-elevenlabs-key"
   heroku config:set NODE_ENV="production"
   ```

3. **Deploy:**
   ```bash
   git push heroku main
   ```

## Post-Deployment Checklist

1. **Test API endpoints:**
   ```bash
   curl https://your-deployed-url/api/health
   ```

2. **Update frontend API URL:**
   - Edit `src/lib/api.ts` in your frontend project
   - Update the production URL to your deployed backend

3. **Test authentication:**
   - Try registering a new user
   - Test login functionality

4. **Test emergency features:**
   - Verify email notifications work
   - Test emergency alert creation

5. **Monitor logs:**
   - Check deployment logs for any errors
   - Set up monitoring (optional)

## Troubleshooting

### Common Issues:

1. **MongoDB Connection:**
   - Ensure MongoDB URI is correct
   - Check MongoDB Atlas network access settings
   - Verify username/password

2. **CORS Issues:**
   - The backend is configured to allow all origins
   - If you need to restrict origins, update the CORS middleware

3. **Environment Variables:**
   - Ensure all required env vars are set in deployment platform
   - Check for typos in variable names

4. **Port Issues:**
   - Most platforms auto-assign ports
   - Use `process.env.PORT || 3000` (already configured)

### Logs:

Check application logs in your deployment platform:
- Vercel: Check function logs in dashboard
- Docker: `docker logs <container-name>`
- PM2: `pm2 logs suraksha-backend`
- Heroku: `heroku logs --tail`

## Security Considerations

1. **JWT Secret:** Use a strong, unique JWT secret
2. **HTTPS:** Always use HTTPS in production
3. **Rate Limiting:** Consider adding rate limiting middleware
4. **Input Validation:** Already implemented basic validation
5. **Database Security:** Use MongoDB Atlas security features

## Scaling

For high traffic applications:

1. **Horizontal Scaling:**
   - Deploy multiple instances
   - Use a load balancer

2. **Database Optimization:**
   - Add database indexes
   - Use MongoDB Atlas auto-scaling

3. **Caching:**
   - Add Redis for session caching
   - Implement API response caching

4. **CDN:**
   - Use CDN for static assets
   - Consider API caching at CDN level