const express = require('express');
const { spawn } = require('child_process');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

app.post('/api/query', (req, res) => {
    const { query } = req.body;

    const pythonProcess = spawn('python3', ['app.py', query]);

    let pythonOutput = '';
    let errorOccurred = false;

    pythonProcess.stdout.on('data', (data) => {
        pythonOutput += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
        errorOccurred = true;
    });

    pythonProcess.on('close', (code) => {
        if (errorOccurred || code !== 0) {
            res.status(500).json({ error: 'Error processing query' });
        } else {
            try {
                const jsonResponse = JSON.parse(pythonOutput);
                res.json(jsonResponse);
            } catch (e) {
                console.error('Error parsing Python output:', e);
                res.status(500).json({ error: 'Error parsing Python output' });
            }
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});