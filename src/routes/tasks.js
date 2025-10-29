const express = require('express');
const db = require('../db');
const router = express.Router();

// Create Task
router.post('/', async (req, res) => {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });
    try {
        const result = await db.query(
        `INSERT INTO tasks (title, description) VALUES ($1, $2) RETURNING *`,
        [title, description || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Read all tasks
router.get('/', async (req, res) => {
try {
    const result = await db.query(`SELECT * FROM tasks ORDER BY id DESC`);
    res.json(result.rows);
} catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
}
});

// Read single task
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query(`SELECT * FROM tasks WHERE id = $1`, [id]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Update task
router.put('/:id', async (req, res) => {
      const { id } = req.params;
      const { title, description, completed } = req.body;
      try {
          const now = new Date();
          const result = await db.query(
          `UPDATE tasks SET title = COALESCE($1, title), description = COALESCE($2, description), completed = COALESCE($3, completed), updated_at = $4 WHERE id = $5 RETURNING *`,
          [title, description, completed, now, id]
          );
          if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
          res.json(result.rows[0]);
      } catch (err) {
          console.error(err);
          res.status(500).json({ error: 'Database error' });
      }
});

// Delete task
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query(`DELETE FROM tasks WHERE id = $1 RETURNING *`, [id]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ success: true, deleted: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;
