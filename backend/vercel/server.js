require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { put } = require('@vercel/blob');
const cookieParser = require('cookie-parser'); // Import cookie-parser

const app = express();

// --- Middleware ---
// Configure CORS to allow credentials
app.use(cors({
    // origin: process.env.FRONTEND_URL || 'http://localhost:8080', // Previous setting
    origin: true, // Reflect the request origin, allowing any origin with credentials
    credentials: true // Allow cookies to be sent
}));
app.use(express.json());
app.use(cookieParser()); // Use cookie-parser middleware

// --- MongoDB Connection ---
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        process.exit(1);
    }
};
connectDB();


// --- Mongoose Models ---
// User Model
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    date: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

// Profile Model
const ProfileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dob: { type: Date },
    // Add other profile fields as needed
    date: { type: Date, default: Date.now }
});
const Profile = mongoose.model('Profile', ProfileSchema);

// Medical History Model
const MedicalHistorySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    condition: { type: String, required: true },
    notes: { type: String },
    dateRecorded: { type: Date, default: Date.now }
});
const MedicalHistory = mongoose.model('MedicalHistory', MedicalHistorySchema);

// Analysis Result Model
const AnalysisResultSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    imagePath: { type: String, required: true }, // Changed to store Vercel Blob URL
    results: { type: mongoose.Schema.Types.Mixed, required: true },
    analysisDate: { type: Date, default: Date.now }
});
const AnalysisResult = mongoose.model('AnalysisResult', AnalysisResultSchema);


// --- Authentication Middleware ---
const auth = (req, res, next) => {
    // Read token from cookie instead of header
    const token = req.cookies.token; // Assuming cookie name is 'token'

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

// --- Multer Setup ---
const storage = multer.memoryStorage(); // Use memory storage
const upload = multer({ storage: storage });


// --- API Routes ---

// @route   POST api/auth/register
// @desc    Register user & set cookie
// @access  Public
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
        }
        user = new User({ name, email, password });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        const payload = { user: { id: user.id } };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }, (err, token) => { // Use appropriate expiration
            if (err) throw err;
            // Set HTTP-only cookie
            res.cookie('token', token, {
                httpOnly: true, // Cannot be accessed by client-side scripts
                secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
                sameSite: 'lax', // Or 'strict' depending on your needs
                maxAge: 24 * 60 * 60 * 1000 // 1 day in milliseconds
            });
            // Send back user info (excluding password) instead of token
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email
             });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/auth/login
// @desc    Authenticate user & set cookie
// @access  Public
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
        }
        const payload = { user: { id: user.id } };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }, (err, token) => { // Use appropriate expiration
            if (err) throw err;
            // Set HTTP-only cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            });
             // Send back user info (excluding password) instead of token
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email
             });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/auth/logout
// @desc    Logout user (clear cookie)
// @access  Private (or Public, depending on if you want to ensure user is logged in to log out)
app.post('/api/auth/logout', (req, res) => {
    // Clear the cookie
    res.cookie('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(0) // Set expiry date to the past
    });
    res.status(200).json({ msg: 'Logged out successfully' });
});


// @route   GET api/auth/me
// @desc    Get current user data (uses auth middleware which reads cookie)
// @access  Private
app.get('/api/auth/me', auth, async (req, res) => {
    try {
        // req.user is populated by the auth middleware
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            // This case might indicate a desync, clear cookie?
            res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        // If error fetching user, maybe token is invalid despite passing verify? Clear cookie.
        res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
        res.status(500).send('Server Error');
    }
});

// --- Other Routes (Profile, History, Analysis, Settings) ---
// These routes use the `auth` middleware, which now reads from cookies,
// so no changes are needed within the route handlers themselves.

// @route   GET api/profile/me
// @desc    Get current user's profile
// @access  Private
app.get('/api/profile/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'email']);
        if (!profile) {
            // If no profile exists yet, return a specific status or empty object
            // depending on how frontend handles it. 404 is reasonable.
            return res.status(404).json({ msg: 'Profile not found for this user' });
        }
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/profile/me
// @desc    Create or update user profile
// @access  Private
app.post('/api/profile/me', auth, async (req, res) => {
    const { dob /* other fields */ } = req.body;
    const profileFields = { user: req.user.id };
    if (dob) profileFields.dob = dob;
    // Add other fields to profileFields

    try {
        let profile = await Profile.findOneAndUpdate(
            { user: req.user.id },
            { $set: profileFields },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        ).populate('user', ['name', 'email']);
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/history
// @desc    Get all medical history for the user
// @access  Private
app.get('/api/history', auth, async (req, res) => {
    try {
        const history = await MedicalHistory.find({ user: req.user.id }).sort({ dateRecorded: -1 });
        res.json(history);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/history
// @desc    Add a medical history record
// @access  Private
app.post('/api/history', auth, async (req, res) => {
    const { condition, notes } = req.body;
    try {
        const newRecord = new MedicalHistory({
            user: req.user.id,
            condition,
            notes
        });
        const record = await newRecord.save();
        res.json(record);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/analysis
// @desc    Upload skin image to Vercel Blob and save analysis result
// @access  Private
app.post('/api/analysis', auth, upload.single('skinImage'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ msg: 'No image file uploaded' });
    }
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
         console.error("Vercel Blob Token not configured.");
         return res.status(500).send('Server configuration error: Blob storage not available.');
    }

    // Generate a unique filename for Vercel Blob
    const filename = `${req.user.id}-${Date.now()}${path.extname(req.file.originalname)}`;

    try {
        // Upload image buffer to Vercel Blob
        const blob = await put(filename, req.file.buffer, {
            access: 'public', // Make the blob publicly accessible
            token: process.env.BLOB_READ_WRITE_TOKEN // Pass the token
        });

        // --- Analysis Simulation ---
        let analysisResults = {};
        if (req.body.analysisData) {
            try {
                analysisResults = JSON.parse(req.body.analysisData);
            } catch (e) {
                console.error("Could not parse analysisData:", e);
                analysisResults = { error: "Could not parse provided analysis data." };
            }
        } else {
            analysisResults = {
                conditionDetected: "Simulated Condition",
                confidence: 0.85,
                recommendation: "Consult a dermatologist (Simulated)."
            };
        }
        // --- End Analysis Simulation ---

        // Save analysis result with the Vercel Blob URL
        const newAnalysis = new AnalysisResult({
            user: req.user.id,
            imagePath: blob.url, // Store the public URL from Vercel Blob
            results: analysisResults
        });

        const analysis = await newAnalysis.save();
        res.json(analysis);

    } catch (err) {
        console.error('Error during analysis or upload:', err.message);
        res.status(500).send('Server Error during analysis or image upload');
    }
});

// @route   GET api/analysis
// @desc    Get all analysis results for the user
// @access  Private
app.get('/api/analysis', auth, async (req, res) => {
    try {
        const results = await AnalysisResult.find({ user: req.user.id }).sort({ analysisDate: -1 });
        res.json(results);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/settings
// @desc    Update user settings (e.g., name)
// @access  Private
app.put('/api/settings', auth, async (req, res) => {
    const { name } = req.body; // Example: only updating name
    const updateFields = {};
    if (name) updateFields.name = name;
    // Add other updatable fields here

    if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ msg: 'No fields to update provided' });
    }

    try {
        // Update fields in the User model directly for this example
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateFields },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// --- Basic Error Handling Middleware ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


// --- Server Start ---
const PORT = process.env.PORT || 5069;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));


// --- Export for Vercel ---
module.exports = app;