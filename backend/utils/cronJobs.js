const cron = require('node-cron');
const Competition = require('../models/Competition');
const Submission = require('../models/Submission');

/**
 * Daily job to process competition winners
 * Runs at 00:01 every day
 */
cron.schedule('1 0 * * *', async () => {
  try {
    const competitions = await Competition.find({
      end: { $lte: new Date() },
      isProcessed: false
    });

    for (const competition of competitions) {
      const highestScore = await Submission.findOne({ competitionId: competition._id })
        .sort({ score: -1 })
        .select('score')
        .lean();

      if (highestScore && highestScore.score > 0) {
        const winners = await Submission.find({
          competitionId: competition._id,
          score: highestScore.score
        })
        .select('author score image _id')
        .lean();

        await Competition.findByIdAndUpdate(competition._id, {
          winners: winners.map(w => ({
            email: w.author,
            score: w.score,
            submissionId: w._id,
            image: w.image
          })),
          isProcessed: true
        });
      } else {
        await Competition.findByIdAndUpdate(competition._id, {
          isProcessed: true
        });
      }
    }
  } catch (error) {
    console.error('Error processing competition winners:', error);
  }
});