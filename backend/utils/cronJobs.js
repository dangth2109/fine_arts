const cron = require('node-cron');
const Competition = require('../models/Competition');
const Submission = require('../models/Submission');

/**
 * Process competition winners and update their status
 */
const processCompetitions = async () => {
    try {
        const currentDate = new Date();
        
        // Find competitions that have ended but not processed
        const competitions = await Competition.find({
            end: { $lte: currentDate },
            isProcessed: false
        });

        console.log(`Found ${competitions.length} competitions to process at ${currentDate.toISOString()}`);

        for (const competition of competitions) {
            // Double check if competition has actually ended
            if (new Date(competition.end) <= currentDate) {
                console.log(`Processing competition: ${competition.name} (ended at ${competition.end})`);
                
                const highestScore = await Submission.findOne({ 
                    competitionId: competition._id,
                    score: { $exists: true, $ne: null }
                })
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
                        $set: {
                            winners: winners.map(w => ({
                                email: w.author,
                                score: w.score,
                                submissionId: w._id,
                                image: w.image
                            })),
                            isProcessed: true,
                            status: 'ended'
                        }
                    });

                    console.log(`Updated winners for competition: ${competition.name} - Winners count: ${winners.length}`);
                } else {
                    await Competition.findByIdAndUpdate(competition._id, {
                        $set: {
                            isProcessed: true,
                            status: 'ended',
                            winners: [] // Set empty winners array if no valid submissions
                        }
                    });
                    console.log(`No valid submissions for competition: ${competition.name}`);
                }
            } else {
                console.log(`Competition ${competition.name} has not ended yet. Current: ${currentDate.toISOString()}, End: ${competition.end}`);
            }
        }

        // Update status for ongoing and upcoming competitions
        await Competition.updateMany(
            {
                start: { $lte: currentDate },
                end: { $gt: currentDate },
                status: { $ne: 'in_progress' }
            },
            {
                $set: { status: 'in_progress' }
            }
        );

        await Competition.updateMany(
            {
                start: { $gt: currentDate },
                status: { $ne: 'upcoming' }
            },
            {
                $set: { status: 'upcoming' }
            }
        );

        return competitions.length;
    } catch (error) {
        console.error('Error processing competitions:', error);
        throw error;
    }
};

// Schedule cron job to run at 00:01 every day
cron.schedule('1 0 * * *', async () => {
    console.log('Running scheduled competition processing...');
    try {
        const processedCount = await processCompetitions();
        console.log(`Scheduled job completed. Processed ${processedCount} competitions.`);
    } catch (error) {
        console.error('Error in scheduled job:', error);
    }
});

// Function to run cron job manually
const runCronManually = async () => {
    console.log('Running manual competition processing...');
    try {
        const processedCount = await processCompetitions();
        console.log(`Manual processing completed. Processed ${processedCount} competitions.`);
    } catch (error) {
        console.error('Error in manual processing:', error);
        throw error;
    }
};

module.exports = {
    runCronManually
};