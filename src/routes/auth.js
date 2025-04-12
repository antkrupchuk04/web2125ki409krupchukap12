const express = require('express');
const passport = require('passport');
const axios = require('axios');
const db = require('../db');
const router = express.Router();

// Google Auth
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/dashboard');
  }
);

router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) console.error(err);
    res.redirect('/');
  });
});

// WhatsApp Registration
router.post('/whatsapp/send-otp', (req, res) => {
  const { phone } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Simulate WhatsApp API call (replace with actual API)
  console.log(`Sending OTP ${otp} to ${phone}`);
  // Example WhatsApp Business API call (pseudo-code):
  /*
  axios.post('https://api.whatsapp.com/v1/messages', {
    to: phone,
    type: 'text',
    text: { body: `Your OTP is ${otp}` }
  }, {
    headers: { Authorization: 'Bearer YOUR_TOKEN' }
  });
  */

  db.run(
    'INSERT OR REPLACE INTO otps (phone, otp) VALUES (?, ?)',
    [phone, otp],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to store OTP' });
      }
      res.json({ message: 'OTP sent' });
    }
  );
});

router.post('/whatsapp/verify-otp', (req, res) => {
  const { phone, otp } = req.body;
  db.get('SELECT otp FROM otps WHERE phone = ?', [phone], (err, row) => {
    if (err || !row || row.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }
    db.run(
      'INSERT OR IGNORE INTO users (phone) VALUES (?)',
      [phone],
      (err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to register' });
        }
        db.run('DELETE FROM otps WHERE phone = ?', [phone]);
        req.login({ id: phone, phone }, (err) => {
          if (err) {
            return res.status(500).json({ error: 'Login failed' });
          }
          res.json({ message: 'Registration successful' });
        });
      }
    );
  });
});

// Update Card
router.post('/update-card', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const { name, bio, email, phone, linkedin, twitter } = req.body;
  db.run(
    'UPDATE users SET name = ?, bio = ?, email = ?, phone = ?, linkedin = ?, twitter = ? WHERE id = ?',
    [name, bio, email, phone, linkedin, twitter, req.user.id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to update card' });
      }
      res.json({ message: 'Card updated' });
    }
  );
});

// Get User Data
router.get('/user', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(req.user);
});

module.exports = router;