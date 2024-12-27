# Art Platform Project

A web platform for art competitions and exhibitions.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Project Structure

- `backend/`: Backend server
- `frontend/`: React frontend
- `database/`: Database import

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/art-platform.git
cd art-platform
```

### 2. Backend Setup

Navigate to backend directory:
```bash
cd backend
```

Install dependencies:
```bash
npm install
```

Create `.env` file:
```env
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://localhost:27017/art_platform
JWT_SECRET=dangth
JWT_EXPIRE=30d
```

### 3. Frontend Setup

Navigate to frontend directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Create `.env` file:
```env
REACT_APP_API_URL=http://localhost:3000/api
```

### 4. Database Setup

#### Import Database
Using `database` folder to import database.

#### Setup Images
Images are in `uploads/images` folder.

### 5. Running the Application

#### Start Backend Server
```bash
cd backend
npm start
```
Backend will run on http://localhost:3000

#### Start Frontend Development Server
```bash
cd frontend
npm start
```
Frontend will run on http://localhost:3001

## Default Accounts

Admin:
- Email: admin@mail.com
- Password: 1

Student:
- Email: student@mail.com
- Password: 1

## Features

- User authentication (Login/Register)
- Art competition management
- Submission handling
- Image upload and management
- Scoring system
- Admin dashboard
- Responsive design

## Tech Stack

- **Frontend**: React, Bootstrap
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT
- **File Upload**: Multer

## Common Issues & Solutions

1. **Image Upload Issues**
   - Ensure the `uploads/images` directory exists
   - Check file permissions

2. **Database Connection Issues**
   - Verify MongoDB is running
   - Check connection string in `.env`

3. **CORS Issues**
   - Verify API URL in frontend `.env`
   - Check CORS settings in backend

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.