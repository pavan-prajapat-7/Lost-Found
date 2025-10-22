/*
  Production-ready backend for Surana Lost & Found
  - Environment-driven config (PORT, MONGODB_URI, JWT_SECRET, SMTP_*, FRONTEND_ORIGIN, BACKEND_ORIGIN)
  - Security middleware: Helmet, CORS (allowlist), rate limiting
  - Auth: Register (email verification), Verify, Login (JWT)
  - Items: CRUD with ownership checks
  - Claims: Create, list, update (approve/deny) with basic authorization
*/
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const morgan = require('morgan');



// Load env vars (optional - only if a .env is present)
try { require('dotenv').config(); } catch {}

const app = express();

// --- Config ---
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lostfound';
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_dev_secret_now';
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5500';
const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN || `http://localhost:${PORT}`;

// --- DB ---
mongoose.set('strictQuery', true);
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));


// --- Schemas ---
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  verifyToken: { type: String, default: null }
}, { timestamps: true });

const itemSchema = new mongoose.Schema({
  type: { type: String, enum: ['lost', 'found'], required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String },
  location: { type: String },
  date: { type: Date },
  time: { type: String },
  contact: { type: String }, // for lost
  finderName: { type: String }, // for found
  finderContact: { type: String }, // for found
  finderEmail: { type: String }, // for found
  condition: { type: String }, // for found
  additionalInfo: { type: String },
  photo: { type: String }, // URL or base64 (not ideal for prod)
  status: { type: String, default: 'available' }, // available | claimRequested
  userEmail: { type: String }, // reporter email
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const claimSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  itemType: { type: String, enum: ['lost', 'found'], required: true },
  claimantName: { type: String, required: true },
  claimantContact: { type: String, required: true },
  claimantEmail: { type: String },
  proofOfOwnership: { type: String, required: true },
  additionalProof: { type: String },
  meetingPreference: { type: String },
  meetingDetails: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'denied', 'moreProofRequested'], default: 'pending' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Item = mongoose.model('Item', itemSchema);
const Claim = mongoose.model('Claim', claimSchema);

// --- Middleware ---
app.use(morgan('combined'));
app.use(helmet());
app.use(express.json({ limit: '10mb' }));

// CORS allowlist
app.use(cors({
  origin: (origin, callback) => {
    // Allow no origin (e.g., curl) or matching frontend origin
    if (!origin || origin === FRONTEND_ORIGIN) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Basic rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
});
app.use(limiter);

// --- Mailer ---
let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
} else if (process.env.SMTP_SERVICE && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    service: process.env.SMTP_SERVICE,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
} else {
  console.warn('SMTP not configured. Verification emails will be logged to console.');
}

// --- Helpers ---
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Missing token' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// --- Auth ---
app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const verifyToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '24h' });
    const user = new User({ email, password: hash, verifyToken, isVerified: false });
    await user.save();

    const verifyUrl = `${BACKEND_ORIGIN}/verify/${verifyToken}`;

    if (transporter) {
      await transporter.sendMail({
        to: email,
        subject: 'Verify your email - Surana Lost & Found',
        html: `<p>Click <a href="${verifyUrl}">here</a> to verify your account. This link expires in 24 hours.</p>`
      });
    } else {
      console.log('Verification URL (SMTP not configured):', verifyUrl);
    }

    res.status(201).json({ message: 'Registration successful! Please check your email to verify your account.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/verify/:token', async (req, res) => {
  try {
    const { email } = jwt.verify(req.params.token, JWT_SECRET);
    const user = await User.findOne({ email, verifyToken: req.params.token });
    if (!user) return res.redirect(`${FRONTEND_ORIGIN}/index.html?error=invalid_token`);
    user.isVerified = true;
    user.verifyToken = null;
    await user.save();
    return res.redirect(`${FRONTEND_ORIGIN}/index.html?verified=true`);
  } catch (err) {
    return res.redirect(`${FRONTEND_ORIGIN}/index.html?error=invalid_token`);
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    if (!user.isVerified) return res.status(403).json({ message: 'Please verify your email before logging in.' });

    const token = signToken({ id: String(user._id), email: user.email });
    res.json({ message: 'Login successful!', token, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// --- Items ---
app.get('/items', async (req, res) => {
  try {
    const type = req.query.type;
    const query = type ? { type } : {};
    const items = await Item.find(query).sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/items', authMiddleware, async (req, res) => {
  try {
    const data = req.body;
    if (!data || !data.type || !data.name || !data.description) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const item = new Item({ ...data, userEmail: req.user.email, reporterId: req.user.id });
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/items/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.userEmail !== req.user.email) return res.status(403).json({ message: 'Forbidden' });

    Object.assign(item, req.body);
    await item.save();
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/items/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.userEmail !== req.user.email) return res.status(403).json({ message: 'Forbidden' });

    await item.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// --- Claims ---
app.get('/claims', async (req, res) => {
  try {
    const claims = await Claim.find({}).sort({ createdAt: -1 }).lean();
    res.json(claims);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/claims', async (req, res) => {
  try {
    const data = req.body;
    if (!data || !data.itemId || !data.itemType || !data.claimantName || !data.claimantContact || !data.proofOfOwnership) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const item = await Item.findById(data.itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const claim = new Claim({ ...data });
    await claim.save();

    // Mark item as claimRequested
    item.status = 'claimRequested';
    await item.save();

    res.status(201).json(claim);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/claims/:id', authMiddleware, async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) return res.status(404).json({ message: 'Claim not found' });

    const item = await Item.findById(claim.itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.userEmail !== req.user.email) return res.status(403).json({ message: 'Forbidden' });

    const { status } = req.body;
    if (!['approved', 'denied', 'moreProofRequested', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    claim.status = status;
    await claim.save();

    if (status === 'approved') {
      // Optionally delete item or mark as resolved
      await item.deleteOne();
    } else if (status === 'denied') {
      item.status = 'available';
      await item.save();
    }

    res.json(claim);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Health
app.get('/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`Server running on ${BACKEND_ORIGIN}`));
