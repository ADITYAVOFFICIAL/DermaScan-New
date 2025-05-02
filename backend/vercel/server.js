// Load environment variables
require('dotenv').config();

// Import necessary modules
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path'); // Keep path for extname
// const fs = require('fs'); // No longer needed for uploads directory
const cookieParser = require('cookie-parser');
const { put, del } = require('@vercel/blob'); // Import Vercel Blob functions

// Initialize Express app
const app = express();

// --- Directory Setup ---
// No longer needed for local uploads
// const uploadsDir = path.join(__dirname, 'uploads');
// if (!fs.existsSync(uploadsDir)) {
//     fs.mkdirSync(uploadsDir, { recursive: true });
//     console.log(`Created directory: ${uploadsDir}`);
// }

// --- Middleware Setup ---
app.use(cors({
    origin: process.env.FRONTEND_URL || 'https://derma-scan-new.vercel.app',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
// No longer serving static files from local 'uploads'
// app.use('/uploads', express.static(uploadsDir));

// --- Database Connection ---
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

// --- Mongoose Schemas ---

// User Schema (same as before)
const UserSchema = new mongoose.Schema({
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: '' },
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    dataSharing: { type: Boolean, default: false },
    reminders: { type: Boolean, default: true },
    twoFactorAuth: { type: Boolean, default: false },
    date: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

// Profile Schema (same as before)
const ProfileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dateOfBirth: { type: String, default: '' },
    gender: { type: String, default: 'prefer-not-to-say' },
    address: { type: String, default: '' },
    skinType: { type: String, default: 'normal' },
    allergies: { type: String, default: '' },
    medications: { type: String, default: '' },
    skinConditions: { type: String, default: '' },
    familyHistory: { type: String, default: '' },
    previousTreatments: { type: String, default: '' },
    recentChanges: { type: String, default: '' },
    date: { type: Date, default: Date.now }
});
const Profile = mongoose.model('Profile', ProfileSchema);

// Medical History Schema (same as before)
const MedicalHistorySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    condition: { type: String, required: true },
    notes: { type: String },
    dateRecorded: { type: Date, default: Date.now }
});
const MedicalHistory = mongoose.model('MedicalHistory', MedicalHistorySchema);

// Analysis Result Schema - Updated imagePath description
const AnalysisResultSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Store the public URL returned by Vercel Blob
    imagePath: { type: String, required: true }, // e.g., https://<id>.public.blob.vercel-storage.com/skinImage-....jpg
    results: { type: mongoose.Schema.Types.Mixed, required: true },
    analysisDate: { type: Date, default: Date.now }
});
const AnalysisResult = mongoose.model('AnalysisResult', AnalysisResultSchema);

// --- Authentication Middleware --- (same as before)
const auth = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.cookie('token', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', expires: new Date(0) });
        res.status(401).json({ msg: 'Token is not valid' });
    }
};


// --- Multer Configuration for File Uploads (using Memory Storage) ---
// Store file in memory as a buffer instead of saving to disk
const storage = multer.memoryStorage();

// File filter (same as before)
const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error('Error: File upload only supports jpeg, jpg, png, webp'));
};

// Multer instance with memory storage, limits, and file filter
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: fileFilter
});


// --- API Routes ---

// POST /api/auth/register (same as before)
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
         return res.status(400).json({ errors: [{ msg: 'Please provide name, email, and password' }] });
    }
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
        }
        user = new User({
            firstName: name?.split(' ')[0] || '',
            lastName: name?.split(' ').slice(1).join(' ') || '',
            email,
            password
         });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        const defaultProfile = new Profile({ user: user._id });
        await defaultProfile.save();
        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
            if (err) throw err;
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000
            });
            res.status(201).json({
                _id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                emailNotifications: user.emailNotifications,
                smsNotifications: user.smsNotifications,
                dataSharing: user.dataSharing,
                reminders: user.reminders,
                twoFactorAuth: user.twoFactorAuth,
                dateOfBirth: defaultProfile.dateOfBirth,
                gender: defaultProfile.gender,
                address: defaultProfile.address,
                skinType: defaultProfile.skinType,
                allergies: defaultProfile.allergies,
                medications: defaultProfile.medications,
                skinConditions: defaultProfile.skinConditions,
                familyHistory: defaultProfile.familyHistory,
                previousTreatments: defaultProfile.previousTreatments,
                recentChanges: defaultProfile.recentChanges,
             });
        });
    } catch (err) {
        console.error("Register Error:", err.message);
        res.status(500).send('Server error');
    }
});

// POST /api/auth/login (same as before)
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ errors: [{ msg: 'Please provide email and password' }] });
    }
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
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
            if (err) throw err;
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000
            });
            res.json({
                _id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
             });
        });
    } catch (err) {
        console.error("Login Error:", err.message);
        res.status(500).send('Server error');
    }
});

// POST /api/auth/logout (same as before)
app.post('/api/auth/logout', auth, (req, res) => {
    try {
        res.cookie('token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            expires: new Date(0)
        });
        res.status(200).json({ msg: 'Logged out successfully' });
    } catch (err) {
         console.error("Logout Error:", err.message);
         res.status(500).send('Server error during logout');
    }
});

// GET /api/auth/me (same as before)
app.get('/api/auth/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error("GET /api/auth/me Error:", err.message);
        res.status(500).send('Server Error');
    }
});

// GET /api/profile/me (same as before)
app.get('/api/profile/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
            return res.status(404).json({ msg: 'User not found' });
        }
        let profile = await Profile.findOne({ user: req.user.id });
        if (!profile) {
            console.log(`No profile found for user ${req.user.id}, creating default.`);
            profile = new Profile({ user: req.user.id });
            await profile.save();
        }
        const fullProfile = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            emailNotifications: user.emailNotifications,
            smsNotifications: user.smsNotifications,
            dataSharing: user.dataSharing,
            reminders: user.reminders,
            twoFactorAuth: user.twoFactorAuth,
            dateOfBirth: profile.dateOfBirth,
            gender: profile.gender,
            address: profile.address,
            skinType: profile.skinType,
            allergies: profile.allergies,
            medications: profile.medications,
            skinConditions: profile.skinConditions,
            familyHistory: profile.familyHistory,
            previousTreatments: profile.previousTreatments,
            recentChanges: profile.recentChanges,
        };
        res.json(fullProfile);
    } catch (err) {
        console.error("GET /api/profile/me Error:", err.message);
        res.status(500).send('Server Error');
    }
});

// POST /api/profile/me (same as before)
app.post('/api/profile/me', auth, async (req, res) => {
    const {
        firstName, lastName, email, phone, dateOfBirth, gender, address,
        skinType, allergies, medications, skinConditions, familyHistory, previousTreatments, recentChanges
    } = req.body;
    const userFieldsToUpdate = {};
    if (firstName !== undefined) userFieldsToUpdate.firstName = firstName;
    if (lastName !== undefined) userFieldsToUpdate.lastName = lastName;
    if (email !== undefined) userFieldsToUpdate.email = email;
    if (phone !== undefined) userFieldsToUpdate.phone = phone;
    const profileFieldsToUpdate = { user: req.user.id };
    if (dateOfBirth !== undefined) profileFieldsToUpdate.dateOfBirth = dateOfBirth;
    if (gender !== undefined) profileFieldsToUpdate.gender = gender;
    if (address !== undefined) profileFieldsToUpdate.address = address;
    if (skinType !== undefined) profileFieldsToUpdate.skinType = skinType;
    if (allergies !== undefined) profileFieldsToUpdate.allergies = allergies;
    if (medications !== undefined) profileFieldsToUpdate.medications = medications;
    if (skinConditions !== undefined) profileFieldsToUpdate.skinConditions = skinConditions;
    if (familyHistory !== undefined) profileFieldsToUpdate.familyHistory = familyHistory;
    if (previousTreatments !== undefined) profileFieldsToUpdate.previousTreatments = previousTreatments;
    if (recentChanges !== undefined) profileFieldsToUpdate.recentChanges = recentChanges;
    try {
        let updatedUser = null;
        if (Object.keys(userFieldsToUpdate).length > 0) {
             updatedUser = await User.findByIdAndUpdate(
                req.user.id, { $set: userFieldsToUpdate }, { new: true }
            ).select('-password');
            if (!updatedUser) return res.status(404).json({ msg: 'User not found during update' });
        } else {
             updatedUser = await User.findById(req.user.id).select('-password');
             if (!updatedUser) return res.status(404).json({ msg: 'User not found' });
        }
        const updatedProfile = await Profile.findOneAndUpdate(
            { user: req.user.id },
            { $set: profileFieldsToUpdate },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
         const fullProfileResponse = {
            _id: updatedUser._id, firstName: updatedUser.firstName, lastName: updatedUser.lastName,
            email: updatedUser.email, phone: updatedUser.phone, emailNotifications: updatedUser.emailNotifications,
            smsNotifications: updatedUser.smsNotifications, dataSharing: updatedUser.dataSharing,
            reminders: updatedUser.reminders, twoFactorAuth: updatedUser.twoFactorAuth,
            dateOfBirth: updatedProfile.dateOfBirth, gender: updatedProfile.gender, address: updatedProfile.address,
            skinType: updatedProfile.skinType, allergies: updatedProfile.allergies, medications: updatedProfile.medications,
            skinConditions: updatedProfile.skinConditions, familyHistory: updatedProfile.familyHistory,
            previousTreatments: updatedProfile.previousTreatments, recentChanges: updatedProfile.recentChanges,
        };
        res.json(fullProfileResponse);
    } catch (err) {
        console.error("POST /api/profile/me Error:", err.message);
        if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
            return res.status(400).json({ msg: 'Email already in use.' });
        }
        res.status(500).send('Server Error');
    }
});

// PUT /api/settings (same as before)
app.put('/api/settings', auth, async (req, res) => {
    const { emailNotifications, smsNotifications, dataSharing, reminders, twoFactorAuth } = req.body;
    const settingsFieldsToUpdate = {};
    if (emailNotifications !== undefined) settingsFieldsToUpdate.emailNotifications = emailNotifications;
    if (smsNotifications !== undefined) settingsFieldsToUpdate.smsNotifications = smsNotifications;
    if (dataSharing !== undefined) settingsFieldsToUpdate.dataSharing = dataSharing;
    if (reminders !== undefined) settingsFieldsToUpdate.reminders = reminders;
    if (twoFactorAuth !== undefined) settingsFieldsToUpdate.twoFactorAuth = twoFactorAuth;
    if (Object.keys(settingsFieldsToUpdate).length === 0) {
        return res.status(400).json({ msg: 'No settings fields provided for update' });
    }
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $set: settingsFieldsToUpdate },
            { new: true }
        ).select('emailNotifications smsNotifications dataSharing reminders twoFactorAuth');
        if (!updatedUser) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(updatedUser);
    } catch (err) {
        console.error("PUT /api/settings Error:", err.message);
        res.status(500).send('Server Error');
    }
});

// GET /api/history (same as before)
app.get('/api/history', auth, async (req, res) => {
    try {
        const history = await MedicalHistory.find({ user: req.user.id }).sort({ dateRecorded: -1 });
        res.json(history);
    } catch (err) {
        console.error("GET /api/history Error:", err.message);
        res.status(500).send('Server Error');
    }
});

// POST /api/history (same as before)
app.post('/api/history', auth, async (req, res) => {
    const { condition, notes } = req.body;
    if (!condition) {
        return res.status(400).json({ msg: 'Condition is required' });
    }
    try {
        const newRecord = new MedicalHistory({
            user: req.user.id,
            condition,
            notes: notes || ''
        });
        const record = await newRecord.save();
        res.status(201).json(record);
    } catch (err) {
        console.error("POST /api/history Error:", err.message);
        res.status(500).send('Server Error');
    }
});


// *** UPDATED SECTION for Vercel Blob ***
// POST /api/analysis - Upload skin image to Vercel Blob and save analysis results
app.post('/api/analysis', auth, upload.single('skinImage'), async (req, res) => {
    // Check if a file was uploaded by multer (now in memory)
    if (!req.file) {
        return res.status(400).json({ msg: 'No image file uploaded' });
    }
    // Check for analysis data
    if (!req.body.analysisData) {
        return res.status(400).json({ msg: 'Analysis data is missing' });
    }

    let parsedAnalysisData;
    try {
        parsedAnalysisData = JSON.parse(req.body.analysisData);
        if (typeof parsedAnalysisData !== 'object' || parsedAnalysisData === null) {
            throw new Error("Parsed analysisData is not a valid object.");
        }
    } catch (e) {
        console.error("Could not parse analysisData JSON:", e);
        return res.status(400).json({ msg: 'Invalid analysis data format. Expected JSON.', error: e.message });
    }

    let blob; // Declare blob variable here to access it in catch block if needed

    try {
        // --- Vercel Blob Upload ---
        const fileBuffer = req.file.buffer;
        const originalFilename = req.file.originalname;
        const blobFilename = `skin-analyses/${req.user.id}/${Date.now()}-${originalFilename}`; // Use a path-like structure

        // Upload the file buffer to Vercel Blob [1]
        blob = await put(blobFilename, fileBuffer, {
            access: 'public', // Make the blob publicly accessible via its URL [1]
            contentType: req.file.mimetype, // Set the content type
            // Add cache control headers if desired, e.g.:
            // cacheControlMaxAge: 31536000 // Cache for 1 year (optional)
        });
        // --- End Vercel Blob Upload ---

        // Check if blob upload was successful and returned a URL
        if (!blob || !blob.url) {
             throw new Error('Vercel Blob upload failed, URL not returned.');
        }

        // Create a new analysis result document with the Vercel Blob URL
        const newAnalysis = new AnalysisResult({
            user: req.user.id,
            imagePath: blob.url, // <-- Use the URL from Vercel Blob
            results: parsedAnalysisData,
            analysisDate: new Date()
        });

        // Save the analysis result to the database
        const analysis = await newAnalysis.save();

        // Send back the saved analysis document
        res.status(201).json(analysis);

    } catch (err) {
        console.error('Error during analysis save or blob upload:', err.message);

        // *** Cleanup: Delete the uploaded blob if DB save fails ***
        if (blob && blob.url) {
            try {
                console.log(`Attempting to delete orphaned blob: ${blob.url}`);
                await del(blob.url); // Delete the blob using its URL [1]
                console.log(`Successfully deleted orphaned blob: ${blob.url}`);
            } catch (deleteErr) {
                console.error(`Failed to delete orphaned blob ${blob.url}:`, deleteErr.message);
                // Log this error but don't override the original error response
            }
        }

        res.status(500).send(`Server Error: ${err.message}`);
    }
});
// *** END OF UPDATED SECTION ***


// GET /api/analysis (same as before - retrieves records including the blob URL)
app.get('/api/analysis', auth, async (req, res) => {
    try {
        const results = await AnalysisResult.find({ user: req.user.id }).sort({ analysisDate: -1 });
        res.json(results);
    } catch (err) {
        console.error("GET /api/analysis Error:", err.message);
        res.status(500).send('Server Error');
    }
});

// --- Global Error Handling Middleware --- (Updated slightly for clarity)
app.use((err, req, res, next) => {
    console.error("Global Error Handler Caught:", err.stack); // Log stack trace

    if (err instanceof multer.MulterError) {
        return res.status(400).json({ msg: `File upload error: ${err.message} (Field: ${err.field})` });
    }
    else if (err.message.startsWith('Error: File upload only supports')) {
        return res.status(400).json({ msg: err.message });
    }
    // Handle errors potentially thrown from blob operations or other async issues
    else if (err.status) {
         return res.status(err.status).json({ msg: err.message || 'An error occurred' });
    }

    // Generic fallback
    res.status(500).json({ msg: 'Internal Server Error', error: err.message });
});

// --- Server Start ---
// For Vercel, we need to export the app, not listen directly in this file
// if (process.env.NODE_ENV !== 'production') { // Only listen locally if not in production (Vercel handles listening)
//     const PORT = process.env.PORT || 5069;
//     app.listen(PORT, () => console.log(`Server started locally on port ${PORT}`));
// }

// Export the app for Vercel's Serverless Function environment
module.exports = app;