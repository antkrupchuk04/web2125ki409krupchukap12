require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const authRoutes = require('./routes/auth');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Passport Config
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google/callback',
    },
    (accessToken, refreshToken, profile, done) => {
      const db = require('./db');
      db.get(
        'SELECT * FROM users WHERE googleId = ?',
        [profile.id],
        (err, user) => {
          if (err) return done(err);
          if (user) {
            return done(null, user);
          }
          db.run(
            'INSERT INTO users (googleId, name, email) VALUES (?, ?, ?)',
            [profile.id, profile.displayName, profile.emails[0].value],
            (err) => {
              if (err) return done(err);
              db.get(
                'SELECT * FROM users WHERE googleId = ?',
                [profile.id],
                (err, newUser) => {
                  done(null, newUser);
                }
              );
            }
          );
        }
      );
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const db = require('./db');
  db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => {
    done(err, user);
  });
});

// Routes
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/register.html'));
});

app.get('/dashboard', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});