const express = require('express');
const cors = require('cors');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const app = express();
const PORT = 4000;
const SECRET = 'votre_secret_super_long_et_unique';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..'))); // Sert les fichiers statiques du dossier racine

const USERS_FILE = 'users.json';

// Utilitaires pour lire/écrire les utilisateurs
function readUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
}
function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Inscription
app.post('/api/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });
  const users = readUsers();
  if (users.find(u => u.email === email)) return res.status(400).json({ error: 'Utilisateur déjà existant' });
  const hashed = bcrypt.hashSync(password, 10);
  users.push({ email, password: hashed });
  writeUsers(users);
  res.json({ success: true });
});

// Connexion
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const users = readUsers();
  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ error: 'Utilisateur inconnu' });
  if (!bcrypt.compareSync(password, user.password)) return res.status(400).json({ error: 'Mot de passe incorrect' });
  const token = jwt.sign({ email }, SECRET, { expiresIn: '2h' });
  res.json({ token, email });
});

// Middleware d'authentification
function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Token manquant' });
  try {
    const decoded = jwt.verify(auth.split(' ')[1], SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Token invalide' });
  }
}

// Exemple de route protégée
app.post('/api/visit', requireAuth, (req, res) => {
  const { info } = req.body;
  const log = { email: req.user.email, info, date: new Date().toISOString() };
  fs.appendFileSync('visits.log', JSON.stringify(log) + '\\n');
  res.json({ status: 'ok' });
});

// Récupérer les visites (protégé)
app.get('/api/visits', requireAuth, (req, res) => {
  if (!fs.existsSync('visits.log')) return res.json([]);
  const lines = fs.readFileSync('visits.log', 'utf-8').split('\\n').filter(Boolean);
  const visits = lines.map(line => JSON.parse(line));
  res.json(visits.filter(v => v.email === req.user.email));
});

// Redirige toutes les routes non-API vers index.html (pour le frontend)
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.listen(PORT, () => console.log('Serveur backend sur http://localhost:' + PORT));