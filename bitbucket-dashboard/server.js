const express = require('express');
const axios = require('axios');
require('dotenv').config();
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Bitbucket API Base URL
const BITBUCKET_API_URL = 'https://api.bitbucket.org/2.0';

// Fetch Commits
app.get('/api/commits', async (req, res) => {
    const { workspace, repoSlug } = req.query;

    if (!workspace || !repoSlug) {
        return res.status(400).json({ error: "Workspace and repoSlug are required." });
    }

    try {
        const response = await axios.get(
            `${BITBUCKET_API_URL}/repositories/${workspace}/${repoSlug}/commits`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.BITBUCKET_TOKEN}`,
                },
            }
        );

        const commits = response.data.values.map(commit => ({
            hash: commit.hash,
            message: commit.message,
            author: commit.author.raw,
            date: commit.date,
        }));

        res.json({ commits });
    } catch (error) {
        console.error('Error fetching commits:', error.response?.data || error.message);
        res.status(500).json({ error: "Failed to fetch commits. Check your workspace, repoSlug, or token." });
    }
});

// Health Check Endpoint
app.get('/', (req, res) => {
    res.send('Bitbucket Dashboard Backend is running.');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
