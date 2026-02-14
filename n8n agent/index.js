const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const WEBHOOK_URL = 'https://genai-cohort.app.n8n.cloud/webhook-test/58f2045d-f532-4bc5-a72c-761bf4a01b95';

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/submit', async (req, res) => {
    try {
        console.log('Sending data to n8n:', req.body);

        // Send data to n8n webhook
        await axios.post(WEBHOOK_URL, req.body);

        res.render('success', { name: req.body.name });
    } catch (error) {
        console.error('Error sending to n8n:', error.message);
        // Still render success or a custom error page depending on UX preference
        // For now, let's proceed to success but log the error
        res.render('success', { name: req.body.name });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
