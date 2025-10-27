const cron = require('node-cron');
const db = require('../db');
const nodemailer = require('nodemailer');
require('dotenv').config();

// create transporter using env settings (Mailtrap or SMTP)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

async function checkNewTasksAndNotify() {
    try {
    // find tasks created in the last 5 minutes
    const result = await db.query(`SELECT * FROM tasks WHERE created_at >= now() - interval '5 minutes' ORDER BY created_at DESC`);
        if (result.rows.length === 0) {
        console.log('[cron] No new tasks in the last 5 minutes');
        return;
    }

    const tasks = result.rows;
    const subject = `You have ${tasks.length} new task(s)`;
    const text = tasks.map(t => `- ${t.title} (id: ${t.id}) (desc ${t.description})`).join('\n');

    // send email
    const mailOptions = {
        from: process.env.FROM_EMAIL,
        to: process.env.TO_EMAIL,
        subject,
        text,
    };

    // If email fails, we still log the event
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
        console.error('[cron] Error sending mail:', err);
        } else {
        console.log('[cron] Notification sent:', info && info.response ? info.response : info);
        }
    });

        console.log(`[cron] Found ${tasks.length} new task(s)`);
    } catch (err) {
        console.error('[cron] Error checking new tasks:', err);
    }
}

// Schedule: every 5 minutes
const job = cron.schedule('*/5 * * * *', () => {
    console.log('[cron] Running check for new tasks...');
    checkNewTasksAndNotify();
});

module.exports = { job, checkNewTasksAndNotify };