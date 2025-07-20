# Prescription and Medication Management Tool

A modern, full-stack web application for managing prescriptions, medications, adherence, reminders, analytics, and more. Built for patients, doctors, and admins with advanced features, robust security, and a beautiful UI.

---

## Features

- **User Roles:** Patient, Doctor, Admin with role-based access and UI
- **Authentication:** JWT-based, secure registration/login, password reset
- **Medication Management:** Add, edit, delete, renew, and schedule medications
- **Prescription Upload:** Upload and manage prescription images
- **Adherence Tracking:** Log doses as taken, missed, or skipped; view streaks and badges
- **Reminders:** In-app, push, and email reminders; Google Calendar integration
- **Analytics & AI:** Usage trends, adherence stats, personalized suggestions, predictive reminders, conflict warnings
- **Notifications:** Toasts, push, sound, and offline support
- **Reports:** Export logs as CSV/PDF, AI-powered analysis
- **Accessibility:** ARIA, keyboard navigation, color contrast, dark mode
- **Offline Support:** PWA, offline log sync
- **Admin/Doctor Tools:** Manage users, view renewal requests, analytics
- **Testing:** Unit, integration, and E2E tests

---

## Tech Stack

**Frontend:**
- React (Chakra UI, React Router, Redux Toolkit)
- Axios, jsPDF, react-chartjs-2, Workbox, VitePWA

**Backend:**
- Node.js, Express
- MongoDB (Mongoose), Redis
- JWT, Joi, Winston, Nodemailer, Cron

---

## Folder Structure

```
medication-frontend/
  src/
    components/
    hooks/
    pages/
    services/
    utils/
    ...
medication-backend/
  controllers/
  models/
  routes/
  services/
  middleware/
  validation/
  cron/
  utils/
  config/
  ...
```

---

## Setup & Installation

### Prerequisites
- Node.js (v16+)
- MongoDB
- Redis

### 1. Clone the repository
```bash
git clone <repo-url>
cd Prescription-and-Medication-Management-Tool
```

### 2. Install dependencies
```bash
npm install
cd medication-frontend && npm install
cd ../medication-backend && npm install
```

### 3. Environment Variables
Create `.env` files in both `medication-frontend` and `medication-backend`:

**Frontend (`medication-frontend/.env`):**
```
VITE_API_URL=http://localhost:5000/api
```

**Backend (`medication-backend/.env`):**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/medicationdb
JWT_SECRET=your_jwt_secret
REDIS_URL=redis://localhost:6379
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
CLOUDINARY_URL=your_cloudinary_url
```

### 4. Start the Application
**Backend:**
```bash
cd medication-backend
npm start
```
**Frontend:**
```bash
cd medication-frontend
npm run dev
```

The app will be available at `http://localhost:5173` (or as specified by Vite).

---

## Usage
- Register as a user, doctor, or admin
- Add and manage medications and prescriptions
- Log doses and track adherence
- View analytics, trends, and receive AI-powered suggestions
- Doctors/admins can manage users and renewal requests
- Export reports and integrate with Google Calendar

---

## Deployment

### Quick Deployment
A deployment script is provided to help with the deployment process:
```bash
# On Windows
.\deploy.ps1
```

### Recommended Deployment Stack
- **Frontend**: Netlify
- **Backend**: Render
- **Database**: MongoDB Atlas
- **Redis**: Upstash or Redis Cloud

### Detailed Deployment Guide
A comprehensive deployment guide is available in the `DEPLOYMENT_GUIDE.md` file, which includes:

- Step-by-step instructions for deploying to Netlify and Render
- Setting up production databases
- Environment variable configuration
- Post-deployment tasks
- Troubleshooting common issues
- Maintenance and security considerations

### Configuration Files
- `netlify.toml` - Configuration for Netlify deployment
- `render.yaml` - Configuration for Render deployment
- `.env.production` - Production environment variables for the frontend

---

## Contribution Guidelines
- Fork the repo and create a feature branch
- Write clear, descriptive commit messages
- Add/modify tests for new features
- Ensure code style with ESLint/Prettier
- Open a pull request with a detailed description

---

## License
MIT

---

## Acknowledgements
- Chakra UI, React, Express, MongoDB, Redis, Cloudinary, Nodemailer, Chart.js, jsPDF, and all open-source contributors