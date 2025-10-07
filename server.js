const path = require('path');
const fs = require('fs');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const SESSION_SECRET = process.env.SESSION_SECRET || 'fixmystuff-dev-secret';

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'fixmystuff.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password_hash TEXT,
      name TEXT,
      role TEXT CHECK(role IN ('customer', 'professional')),
      provider TEXT NOT NULL,
      provider_id TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
  db.run(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_provider ON users(provider, provider_id)
  `);
});

function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function runCallback(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await dbGet('SELECT * FROM users WHERE id = ?', [id]);
    if (!user) {
      return done(null, false);
    }
    done(null, sanitizeUser(user));
  } catch (error) {
    done(error);
  }
});

passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
  try {
    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
    if (!user || user.provider !== 'local') {
      return done(null, false, { message: 'Identifiants invalides.' });
    }
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return done(null, false, { message: 'Identifiants invalides.' });
    }
    return done(null, sanitizeUser(user));
  } catch (error) {
    return done(error);
  }
}));

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: new URL('/auth/google/callback', BASE_URL).toString(),
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const existing = await dbGet('SELECT * FROM users WHERE provider = ? AND provider_id = ?', ['google', profile.id]);
      if (existing) {
        return done(null, sanitizeUser(existing));
      }
      const email = profile.emails?.[0]?.value?.toLowerCase() || null;
      const name = profile.displayName || email || 'Utilisateur Google';
      const role = 'customer';
      const result = await dbRun(
        `INSERT INTO users (email, password_hash, name, role, provider, provider_id) VALUES (?, ?, ?, ?, ?, ?)`,
        [email, null, name, role, 'google', profile.id],
      );
      const user = await dbGet('SELECT * FROM users WHERE id = ?', [result.lastID]);
      done(null, sanitizeUser(user));
    } catch (error) {
      done(error);
    }
  }));
} else {
  console.warn('Google OAuth non configuré. Ajoutez GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET pour activer la connexion Google.');
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

app.post('/api/register', async (req, res) => {
  const { email, password, role, name } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ message: 'Email, mot de passe et rôle sont requis.' });
  }
  const normalizedEmail = String(email).toLowerCase();
  if (!['customer', 'professional'].includes(role)) {
    return res.status(400).json({ message: 'Le rôle doit être "customer" ou "professional".' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères.' });
  }
  try {
    const existing = await dbGet('SELECT * FROM users WHERE email = ?', [normalizedEmail]);
    if (existing) {
      return res.status(409).json({ message: 'Un compte existe déjà avec cet email.' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await dbRun(
      `INSERT INTO users (email, password_hash, name, role, provider, provider_id) VALUES (?, ?, ?, ?, ?, ?)`,
      [normalizedEmail, passwordHash, name || normalizedEmail, role, 'local', normalizedEmail],
    );
    const user = await dbGet('SELECT * FROM users WHERE id = ?', [result.lastID]);
    req.login(sanitizeUser(user), (err) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur lors de la création de session.' });
      }
      res.status(201).json({ user: sanitizeUser(user) });
    });
  } catch (error) {
    console.error('Erreur enregistrement', error);
    res.status(500).json({ message: 'Impossible de créer le compte pour le moment.' });
  }
});

app.post('/api/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: info?.message || 'Connexion refusée.' });
    }
    req.login(user, (loginErr) => {
      if (loginErr) {
        return next(loginErr);
      }
      res.json({ user });
    });
  })(req, res, next);
});

app.get('/api/session', (req, res) => {
  if (!req.user) {
    return res.json({ user: null });
  }
  res.json({ user: req.user });
});

app.post('/api/logout', (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });
});

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

  app.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: '/?auth=google-failed',
  }), (req, res) => {
    res.redirect(`${BASE_URL}/?auth=google-success`);
  });
}

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Une erreur serveur est survenue.' });
});

app.listen(PORT, () => {
  console.log(`FixMyStuff server running on port ${PORT}`);
});

function sanitizeUser(user) {
  if (!user) return null;
  const { password_hash, provider_id, ...safe } = user;
  return safe;
}
