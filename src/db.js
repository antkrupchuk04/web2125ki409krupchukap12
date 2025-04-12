const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/users.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      googleId TEXT UNIQUE,
      phone TEXT UNIQUE,
      name TEXT,
      bio TEXT,
      email TEXT,
      phoneNumber TEXT,
      linkedin TEXT,
      twitter TEXT
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS otps (
      phone TEXT PRIMARY KEY,
      otp TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;