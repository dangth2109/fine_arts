const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Competition = require('../models/Competition');
const Exhibition = require('../models/Exhibition');
const Submission = require('../models/Submission');

const getRandomSubmissions = (submissions, count) => {
    const shuffled = [...submissions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

const seedData = async () => {
    try {
        // Delete all database
        await User.deleteMany({});
        await Competition.deleteMany({});
        await Exhibition.deleteMany({});
        await Submission.deleteMany({});

        // Create users
        const hashedPassword = await bcrypt.hash('123456', 10);
        const users = await User.insertMany([
            {
                email: 'admin01@mail.com',
                password: hashedPassword,
                role: 'admin',
                avatar: null
            },
            {
                email: 'admin02@mail.com',
                password: hashedPassword,
                role: 'admin',
                avatar: null
            },
            {
                email: 'admin03@mail.com',
                password: hashedPassword,
                role: 'admin',
                avatar: null
            },
            {
                email: 'student01@mail.com',
                password: hashedPassword,
                role: 'student',
                avatar: null
            },
            {
                email: 'student02@mail.com',
                password: hashedPassword,
                role: 'student',
                avatar: null
            },
            {
                email: 'student03@mail.com',
                password: hashedPassword,
                role: 'student',
                avatar: null
            },
            {
                email: 'student04@mail.com',
                password: hashedPassword,
                role: 'student',
                avatar: null
            },
            {
                email: 'student05@mail.com',
                password: hashedPassword,
                role: 'student',
                avatar: null
            },
            {
                email: 'student06@mail.com',
                password: hashedPassword,
                role: 'student',
                avatar: null
            },
            {
                email: 'student07@mail.com',
                password: hashedPassword,
                role: 'student',
                avatar: null
            },
            {
                email: 'student08@mail.com',
                password: hashedPassword,
                role: 'student',
                avatar: null
            },
            {
                email: 'student09@mail.com',
                password: hashedPassword,
                role: 'student',
                avatar: null
            },
            {
                email: 'student10@mail.com',
                password: hashedPassword,
                role: 'student',
                avatar: null
            },
            {
                email: 'staff@mail.com',
                password: hashedPassword,
                role: 'staff',
                avatar: null
            },
            {
                email: 'manager@mail.com',
                password: hashedPassword,
                role: 'manager',
                avatar: null
            }
        ]);

        // Create competitions
        const competitions = await Competition.insertMany([
            {
                name: 'Competition 01',
                description: 'Description for competition 01',
                background: null,
                start: new Date('2024-12-01'),
                end: new Date('2025-05-31'),
                totalSubmissions: 0,
                isHide: false,
                awards: '$500 for 1st'
            },
            {
                name: 'Competition 02',
                description: 'Description for competition 02',
                background: null,
                start: new Date('2024-12-15'),
                end: new Date('2024-12-30'),
                totalSubmissions: 0,
                isHide: false,
                awards: '$500 for 1st, 200$ for 2nd, 100$ for 3rd'
            },
            {
                name: 'Competition 03',
                description: 'Description for competition 03',
                background: null,
                start: new Date('2025-01-01'),
                end: new Date('2025-01-30'),
                totalSubmissions: 0,
                isHide: false,
                awards: '$300 for each winners'
            },
            {
                name: 'Competition 04',
                description: 'Description for competition 04',
                background: null,
                start: new Date('2025-05-01'),
                end: new Date('2025-12-09'),
                totalSubmissions: 0,
                isHide: false,
                awards: '$500 for each winners'
            },
            {
                name: 'Competition 05',
                description: 'Description for competition 05',
                background: null,
                start: new Date('2025-02-10'),
                end: new Date('2025-03-03'),
                totalSubmissions: 0,
                isHide: false,
                awards: '$5000 for each winners'
            }
        ]);

        // Create submissions for competitions
        const submissions = await Submission.insertMany([
            {
                image: null,
                competitionId: competitions[0]._id,
                author: users[3].email,
                score: 8,
                scoredBy: users[0].email,
                scoredAt: new Date()
            },
            {
                image: null,
                competitionId: competitions[1]._id,
                author: users[3].email,
                score: 5,
                scoredBy: users[1].email,
                scoredAt: new Date()
            },
            {
                image: null,
                competitionId: competitions[2]._id,
                author: users[3].email,
                score: 6,
                scoredBy: users[2].email,
                scoredAt: new Date()
            },
            {
                image: null,
                competitionId: competitions[3]._id,
                author: users[3].email,
                score: 7,
                scoredBy: users[0].email,
                scoredAt: new Date()
            },
            {
                image: null,
                competitionId: competitions[4]._id,
                author: users[3].email,
                score: 8,
                scoredBy: users[1].email,
                scoredAt: new Date()
            },

            {
                image: null,
                competitionId: competitions[0]._id,
                author: users[4].email,
                score: 7,
                scoredBy: users[2].email,
                scoredAt: new Date()
            },
            {
                image: null,
                competitionId: competitions[1]._id,
                author: users[4].email,
                score: 8,
                scoredBy: users[0].email,
                scoredAt: new Date()
            },
            {
                image: null,
                competitionId: competitions[2]._id,
                author: users[4].email,
                score: 9,
                scoredBy: users[1].email,
                scoredAt: new Date()
            },
            {
                image: null,
                competitionId: competitions[3]._id,
                author: users[4].email,
                score: 7,
                scoredBy: users[2].email,
                scoredAt: new Date()
            },
            {
                image: null,
                competitionId: competitions[4]._id,
                author: users[4].email,
                score: 6,
                scoredBy: users[1].email,
                scoredAt: new Date()
            },

            {
                image: null,
                competitionId: competitions[0]._id,
                author: users[5].email,
                score: 7,
                scoredBy: users[1].email,
                scoredAt: new Date()
            },
            {
                image: null,
                competitionId: competitions[1]._id,
                author: users[5].email,
                score: 9,
                scoredBy: users[2].email,
                scoredAt: new Date()
            },
            {
                image: null,
                competitionId: competitions[2]._id,
                author: users[5].email,
                score: 6,
                scoredBy: users[0].email,
                scoredAt: new Date()
            },
            {
                image: null,
                competitionId: competitions[3]._id,
                author: users[5].email,
                score: 7,
                scoredBy: users[1].email,
                scoredAt: new Date()
            },
            {
                image: null,
                competitionId: competitions[4]._id,
                author: users[5].email,
                score: 6,
                scoredBy: users[2].email,
                scoredAt: new Date()
            },

            {
                image: null,
                competitionId: competitions[0]._id,
                author: users[6].email,
                score: 7,
                scoredBy: users[0].email,
                scoredAt: new Date()
            },
            {
                image: null,
                competitionId: competitions[1]._id,
                author: users[6].email,
                score: 5,
                scoredBy: users[1].email,
                scoredAt: new Date()
            },
            {
                image: null,
                competitionId: competitions[2]._id,
                author: users[6].email,
                score: 10,
                scoredBy: users[2].email,
                scoredAt: new Date()
            },
            {
                image: null,
                competitionId: competitions[3]._id,
                author: users[6].email,
                score: 8,
                scoredBy: users[2].email,
                scoredAt: new Date()
            },
            {
                image: null,
                competitionId: competitions[4]._id,
                author: users[6].email,
                score: 9,
                scoredBy: users[1].email,
                scoredAt: new Date()
            }
        ]);

        // Update total submissions for competitions
        const submissionCounts = await Submission.aggregate([
            {
                $group: {
                    _id: '$competitionId',
                    total: { $sum: 1 }
                }
            }
        ]);

        for (const count of submissionCounts) {
            await Competition.findByIdAndUpdate(
                count._id,
                { totalSubmissions: count.total }
            );
        }

        // Create exhibitions
        const exhibitions = await Exhibition.insertMany([
            {
                name: 'Exhibition 01',
                description: 'Description for exhibition 01',
                location: 'Vietnam',
                background: null,
                start: new Date('2024-03-15'),
                end: new Date('2024-04-15'),
                totalSubmissions: 0,
                isHide: false,
                artwork: getRandomSubmissions(submissions, 5).map(sub => ({
                    image: sub.image,
                    author: sub.author,
                    _id: sub._id
                }))
            },
            {
                name: 'Exhibition 02',
                description: 'Description for exhibition 02',
                location: 'India',
                background: null,
                start: new Date('2025-03-01'),
                end: new Date('2025-03-30'),
                totalSubmissions: 0,
                isHide: false,
                artwork: getRandomSubmissions(submissions, 3).map(sub => ({
                    image: sub.image,
                    author: sub.author,
                    _id: sub._id
                }))
            },
            {
                name: 'Exhibition 03',
                description: 'Description for exhibition 03',
                location: 'Thailand',
                background: null,
                start: new Date('2025-02-01'),
                end: new Date('2025-03-28'),
                totalSubmissions: 0,
                isHide: false,
                artwork: getRandomSubmissions(submissions, 4).map(sub => ({
                    image: sub.image,
                    author: sub.author,
                    _id: sub._id
                }))
            },
            {
                name: 'Exhibition 04',
                description: 'Description for exhibition 04',
                location: 'United States',
                background: null,
                start: new Date('2024-12-01'),
                end: new Date('2025-01-01'),
                totalSubmissions: 0,
                isHide: false,
                artwork: getRandomSubmissions(submissions, 6).map(sub => ({
                    image: sub.image,
                    author: sub.author,
                    _id: sub._id
                }))
            },
            {
                name: 'Exhibition 05',
                description: 'Description for exhibition 05',
                location: 'France',
                background: null,
                start: new Date('2024-10-08'),
                end: new Date('2025-01-30'),
                totalSubmissions: 0,
                isHide: false,
                artwork: getRandomSubmissions(submissions, 10).map(sub => ({
                    image: sub.image,
                    author: sub.author,
                    _id: sub._id
                }))
            }
        ]);

        console.log('Seed data created successfully');
    } catch (error) {
        console.error('Error seeding data:', error);
    }
};

module.exports = seedData;