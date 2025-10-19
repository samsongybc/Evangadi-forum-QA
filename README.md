# Evangadi Forum - Q&A Application

A full-stack Q&A forum application built with React and Node.js.

## Features

- User Registration and Authentication
- Question Posting and Display
- Edit/Delete Questions
- JWT-based Authentication
- Password Validation
- Responsive Design

## Tech Stack

**Frontend:**
- React
- Vite
- Axios
- CSS3

**Backend:**
- Node.js
- Express.js
- MySQL2
- JWT Authentication
- bcrypt for password hashing

## Deployment Guide

### 1. Database Setup (Choose one)

#### Option A: Railway Database (Recommended)
1. Go to [Railway.app](https://railway.app)
2. Sign up/login
3. Create a new project
4. Add MySQL database
5. Copy the connection details

#### Option B: PlanetScale
1. Go to [PlanetScale.com](https://planetscale.com)
2. Create a free account
3. Create a new database
4. Get connection string

### 2. Backend Deployment (Railway)

1. Go to [Railway.app](https://railway.app)
2. Create new project from GitHub
3. Connect your repository
4. Set environment variables:
   - `DB_HOST`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
   - `JWT_SECRET`
   - `CLIENT_URL`
5. Deploy

### 3. Frontend Deployment (Netlify)

1. Go to [Netlify.com](https://netlify.com)
2. Connect GitHub repository
3. Set build settings:
   - Build command: `npm run build`
   - Publish directory: `Client/dist`
4. Set environment variable:
   - `VITE_API_URL` = your Railway backend URL
5. Deploy

### 4. Environment Variables

#### Frontend (.env)
```
VITE_API_URL=https://your-backend-url.railway.app/api
```

#### Backend (.env)
```
DB_HOST=your-database-host
DB_USER=your-database-username
DB_PASSWORD=your-database-password
DB_NAME=your-database-name
JWT_SECRET=your-jwt-secret
CLIENT_URL=https://your-frontend-url.netlify.app
PORT=5001
```

## Local Development

### Backend
```bash
cd Server
npm install
npm run dev
```

### Frontend
```bash
cd Client
npm install
npm run dev
```

## Database Schema

Make sure to create the following tables in your database:

```sql
-- Users table
CREATE TABLE users (
  userid INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  user_password VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Questions table
CREATE TABLE questions (
  questionid VARCHAR(36) PRIMARY KEY,
  userid INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  tag VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  is_deleted TINYINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userid) REFERENCES users(userid)
);

-- Answers table
CREATE TABLE answers (
  answerid VARCHAR(36) PRIMARY KEY,
  questionid VARCHAR(36) NOT NULL,
  userid INT NOT NULL,
  answer TEXT NOT NULL,
  is_deleted TINYINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (questionid) REFERENCES questions(questionid),
  FOREIGN KEY (userid) REFERENCES users(userid)
);
```
