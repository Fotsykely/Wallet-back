const express = require('express');
const router = express.Router();
const db = require('../database/database');

// GET all notifications
router.get('/', (req, res) => {
  db.all('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    // Convert SQLite 0/1 to boolean
    const result = rows.map(r => ({ ...r, read: r.read === 1 }));
    res.json(result);
  });
});

// POST create notification
router.post('/', (req, res) => {
  const { type, title, message } = req.body;
  const sql = `INSERT INTO notifications (type, title, message, read, created_at) VALUES (?, ?, ?, 0, datetime('now'))`;
  db.run(sql, [type, title || 'Notification', message], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, type, title, message, read: false, created_at: new Date().toISOString() });
  });
});

// PUT mark as read (single or all)
router.put('/read', (req, res) => {
  const { id } = req.body; // if id is present only mark one, else mark all
  if (id) {
    db.run('UPDATE notifications SET read = 1 WHERE id = ?', [id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  } else {
    db.run('UPDATE notifications SET read = 1', [], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  }
});

// DELETE remove ALL notifications
router.delete('/all', (req, res) => {
    db.run('DELETE FROM notifications', [], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// DELETE remove ONE notification
router.delete('/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM notifications WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

module.exports = router;