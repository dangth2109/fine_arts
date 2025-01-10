const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const readline = require('readline');
const { runCronManually } = require('./utils/cronJobs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, './.env') });

// Import configurations and utilities
const connectDB = require('./config/db');
const seedData = require('./utils/seedData');


// Import route handlers
const userRoutes = require('./routes/userRoutes');
const competitionRoutes = require('./routes/competitionRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const exhibitionRoutes = require('./routes/exhibitionRoutes');

// Initialize Express app
const app = express();

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to ask about seeding data
const askForSeeding = () => {
  return new Promise((resolve) => {
    rl.question('Do you want to seed the database? (Y/N): ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
};

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('MongoDB Connected...');

    // Ask about seeding only in development
    const shouldSeed = await askForSeeding();
    // const shouldSeed = false;
    if (shouldSeed) {
      console.log('Seeding database...');
      await seedData();
      console.log('Database seeded successfully!');
      await runCronManually();
    } else {
      console.log('Skipping database seed...');
    }


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

  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

// Run the server
startServer();