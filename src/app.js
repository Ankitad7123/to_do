const express = require('express');
require('dotenv').config();
const tasksRouter = require('./routes/tasks');
const { job } = require('./cron/checkNewTasks');
const db = require('./db');

const app = express();
app.use(express.json());

app.get('/', (req, res) => res.send('To-Do API is running'));
app.use('/tasks', tasksRouter);

const port = process.env.PORT || 3000;

// Start server
app.listen(port, () => {
console.log(`Server listening on port ${port}`);
// start the cron job
job.start();
});

// Basic health-check route to check DB connection
app.get('/health', async (req, res) => {
try {
const r = await db.query('SELECT 1');
res.json({ ok: true });
} catch (err) {
res.status(500).json({ ok: false, error: err.message });
}
});