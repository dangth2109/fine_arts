const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import configurations and utilities
const connectDB = require('./config/db');
require('./utils/cronJobs');

// Import route handlers
const userRoutes = require('./routes/userRoutes');
const competitionRoutes = require('./routes/competitionRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const exhibitionRoutes = require('./routes/exhibitionRoutes');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving
app.use('/images', express.static(path.join(__dirname, '../uploads/images')));

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/competitions', competitionRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/exhibitions', exhibitionRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Error handling for unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});