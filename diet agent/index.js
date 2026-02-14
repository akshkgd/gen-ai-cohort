require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

app.post('/submit', async (req, res) => {
    const formData = req.body;
    formData.type = 'initial_intake'; // Add type to distinguish in n8n
    const webhookUrl = process.env.N8N_WEBHOOK_PRODUCTION_URL;

    if (!webhookUrl) {
        console.error('N8N_WEBHOOK_URL is not defined in .env');
        return res.status(500).send('Server Error: Webhook URL not configured.');
    }

    try {
        const response = await axios.post(webhookUrl, formData);
        console.log('Successfully sent to n8n:', response.data);
        res.render('success', { message: 'Your plan is being generated.' });
    } catch (error) {
        console.error('Error sending to n8n:', error.message);
        res.status(500).send('Error submitting the form. Please try again later.');
    }
});

app.get('/revision', (req, res) => {
    const notion_page_id = req.query.notion_page_id || '';
    res.render('revision', { notion_page_id });
});

app.post('/revision', async (req, res) => {
    const formData = req.body;
    formData.type = 'revision_request';
    const webhookUrl = process.env.REVISION_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL;

    try {
        await axios.post(webhookUrl, formData);
        res.render('success', { message: 'Your revision request has been submitted.' });
    } catch (error) {
        console.error('Error sending revision to n8n:', error.message);
        res.status(500).send('Error submitting revision request.');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
