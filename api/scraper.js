// api/scraper.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const morgan = require('morgan');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(morgan('combined'));

app.get('/scrape', async (req, res, next) => {
    try {
        const response = await axios.get('https://api.github.com/gists/public', {
            headers: { 'Authorization': `token ${process.env.GITHUB_TOKEN}` }
        });

        const gists = response.data;
        
        let snippets = [];

        for (const gist of gists) {
            for (const file of Object.values(gist.files)) {
                if (file.language && file.language !== 'Text') {
                    const rawFileResponse = await axios.get(file.raw_url);
                    snippets.push(rawFileResponse.data);
                }
            }
        }

        if (snippets.length > 0) {
            res.json(snippets[Math.floor(Math.random() * snippets.length)]);
        } else {
            res.status(404).json({ message: 'No code snippets found' });
        }
 
    } catch (error) {
        next(error);
    }
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));