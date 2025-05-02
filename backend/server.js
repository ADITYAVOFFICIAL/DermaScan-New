// Load environment variables
require('dotenv').config();

// Import necessary modules
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');

// Initialize Express app
const app = express();

// --- Directory Setup ---
const uploadsDir = path.join(__dirname, 'uploads');
// Ensure the uploads directory exists
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`Created directory: ${uploadsDir}`);
}

// --- Middleware Setup ---
// Enable CORS with specific origin and credentials support
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8080', // Allow frontend origin
    credentials: true // Allow cookies to be sent
}));
// Parse JSON request bodies
app.use(express.json());
// Parse cookies
app.use(cookieParser());
// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(uploadsDir));

// --- Database Connection ---
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        // Exit process with failure
        process.exit(1);
    }
};
connectDB();

// --- Mongoose Schemas ---

// User Schema
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

// Profile Schema (linked to User)
const ProfileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dateOfBirth: { type: String, default: '' }, // Store as string for flexibility, format on frontend/backend as needed
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

// Medical History Schema (potentially deprecated if profile covers enough, but kept for now)
const MedicalHistorySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    condition: { type: String, required: true },
    notes: { type: String },
    dateRecorded: { type: Date, default: Date.now }
});
const MedicalHistory = mongoose.model('MedicalHistory', MedicalHistorySchema);

// Analysis Result Schema
const AnalysisResultSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    imagePath: { type: String, required: true }, // Path relative to server (e.g., /uploads/image.jpg)
    results: { type: mongoose.Schema.Types.Mixed, required: true }, // Store the actual analysis object from frontend
    analysisDate: { type: Date, default: Date.now }
});
const AnalysisResult = mongoose.model('AnalysisResult', AnalysisResultSchema);

// --- Authentication Middleware ---
const auth = (req, res, next) => {
    const token = req.cookies.token; // Get token from httpOnly cookie

    // Check if no token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user; // Add user payload to request object
        next(); // Proceed to the next middleware/route handler
    } catch (err) {
        // Clear invalid token cookie
        res.cookie('token', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', expires: new Date(0) });
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

// --- Multer Configuration for File Uploads ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir); // Save files to the 'uploads' directory
    },
    filename: function (req, file, cb) {
        // Create a unique filename: skinImage-<userId>-<timestamp>.<originalExtension>
        const uniqueSuffix = req.user.id + '-' + Date.now() + path.extname(file.originalname);
        cb(null, 'skinImage-' + uniqueSuffix);
    }
});

// File filter to accept only specific image types
const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/; // Allowed extensions
    const mimetype = filetypes.test(file.mimetype); // Check MIME type
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase()); // Check file extension

    if (mimetype && extname) {
        return cb(null, true); // Accept the file
    }
    // Reject the file with a specific error message
    cb(new Error('Error: File upload only supports jpeg, jpg, png, webp'));
};

// Multer instance with storage, limits, and file filter
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
    fileFilter: fileFilter
});


// --- API Routes ---

// POST /api/auth/register - Register a new user
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
         return res.status(400).json({ errors: [{ msg: 'Please provide name, email, and password' }] });
    }

    try {
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
        }

        // Create new user instance
        user = new User({
            firstName: name?.split(' ')[0] || '', // Extract first name
            lastName: name?.split(' ').slice(1).join(' ') || '', // Extract last name
            email,
            password // Password will be hashed below
         });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Save user to database
        await user.save();

        // Create a default profile for the new user
        const defaultProfile = new Profile({ user: user._id });
        await defaultProfile.save();

        // Create JWT payload
        const payload = { user: { id: user.id } };

        // Sign JWT token
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }, (err, token) => { // Expires in 1 day
            if (err) throw err;

            // Set httpOnly cookie with the token
            res.cookie('token', token, {
                httpOnly: true, // Prevent client-side script access
                secure: process.env.NODE_ENV === 'production', // Send only over HTTPS in production
                sameSite: 'lax', // CSRF protection
                maxAge: 24 * 60 * 60 * 1000 // 1 day in milliseconds
            });

            // Send back user and profile data (excluding password)
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
                // Include default profile fields in the response
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

// POST /api/auth/login - Authenticate user and get token
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
        return res.status(400).json({ errors: [{ msg: 'Please provide email and password' }] });
    }

    try {
        // Check if user exists
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
        }

        // Compare provided password with hashed password in DB
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
        }

        // Create JWT payload
        const payload = { user: { id: user.id } };

        // Sign JWT token
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
            if (err) throw err;

            // Set httpOnly cookie with the token
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            });

            // Send back basic user info (profile fetched separately)
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

// POST /api/auth/logout - Log user out
app.post('/api/auth/logout', auth, (req, res) => { // Requires auth to ensure user is logged in
    try {
        // Clear the token cookie by setting an expired date
        res.cookie('token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            expires: new Date(0) // Set expiry date to the past
        });
        res.status(200).json({ msg: 'Logged out successfully' });
    } catch (err) {
         console.error("Logout Error:", err.message);
         res.status(500).send('Server error during logout');
    }
});

// GET /api/auth/me - Get logged in user's basic details
app.get('/api/auth/me', auth, async (req, res) => {
    try {
        // Fetch user data by ID from token, exclude password
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            // If user not found (e.g., deleted after token issued), clear cookie and return 404
            res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user); // Send user data
    } catch (err) {
        console.error("GET /api/auth/me Error:", err.message);
        res.status(500).send('Server Error');
    }
});

// GET /api/profile/me - Get logged in user's full profile (user + profile data)
app.get('/api/profile/me', auth, async (req, res) => {
    try {
        // Fetch user data (excluding password)
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
            return res.status(404).json({ msg: 'User not found' });
        }

        // Find the profile associated with the user
        let profile = await Profile.findOne({ user: req.user.id });

        // If no profile exists (e.g., for older users before auto-creation), create one
        if (!profile) {
            console.log(`No profile found for user ${req.user.id}, creating default.`);
            profile = new Profile({ user: req.user.id });
            await profile.save();
        }

        // Combine user and profile data into a single response object
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
            // Profile specific fields
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

// POST /api/profile/me - Update user's profile (user + profile data)
app.post('/api/profile/me', auth, async (req, res) => {
    // Destructure all possible fields from request body
    const {
        firstName, lastName, email, phone, // User fields
        dateOfBirth, gender, address, // Profile fields
        skinType, allergies, medications, skinConditions, familyHistory, previousTreatments, recentChanges // Medical profile fields
    } = req.body;

    // Prepare fields to update in the User model
    const userFieldsToUpdate = {};
    if (firstName !== undefined) userFieldsToUpdate.firstName = firstName;
    if (lastName !== undefined) userFieldsToUpdate.lastName = lastName;
    if (email !== undefined) userFieldsToUpdate.email = email; // Handle potential email changes carefully
    if (phone !== undefined) userFieldsToUpdate.phone = phone;

    // Prepare fields to update in the Profile model
    const profileFieldsToUpdate = { user: req.user.id }; // Ensure user link is always set
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
        // Update User document if there are fields to update
        let updatedUser = null;
        if (Object.keys(userFieldsToUpdate).length > 0) {
             updatedUser = await User.findByIdAndUpdate(
                req.user.id,
                { $set: userFieldsToUpdate },
                { new: true } // Return the updated document
            ).select('-password'); // Exclude password from the result

            if (!updatedUser) {
                 return res.status(404).json({ msg: 'User not found during update' });
            }
        } else {
             // If no user fields were updated, fetch the current user data
             updatedUser = await User.findById(req.user.id).select('-password');
             if (!updatedUser) { return res.status(404).json({ msg: 'User not found' }); }
        }

        // Update or Create Profile document
        // findOneAndUpdate with upsert:true will create the doc if it doesn't exist
        const updatedProfile = await Profile.findOneAndUpdate(
            { user: req.user.id }, // Find profile by user ID
            { $set: profileFieldsToUpdate }, // Apply updates
            { new: true, upsert: true, setDefaultsOnInsert: true } // Options: return updated, create if not found, apply schema defaults on insert
        );

         // Combine updated user and profile data for the response
         const fullProfileResponse = {
            _id: updatedUser._id,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            phone: updatedUser.phone,
            emailNotifications: updatedUser.emailNotifications,
            smsNotifications: updatedUser.smsNotifications,
            dataSharing: updatedUser.dataSharing,
            reminders: updatedUser.reminders,
            twoFactorAuth: updatedUser.twoFactorAuth,
            // Updated profile fields
            dateOfBirth: updatedProfile.dateOfBirth,
            gender: updatedProfile.gender,
            address: updatedProfile.address,
            skinType: updatedProfile.skinType,
            allergies: updatedProfile.allergies,
            medications: updatedProfile.medications,
            skinConditions: updatedProfile.skinConditions,
            familyHistory: updatedProfile.familyHistory,
            previousTreatments: updatedProfile.previousTreatments,
            recentChanges: updatedProfile.recentChanges,
        };
        res.json(fullProfileResponse); // Send the combined updated profile
    } catch (err) {
        console.error("POST /api/profile/me Error:", err.message);
        // Handle specific errors like duplicate email (error code 11000)
        if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
            return res.status(400).json({ msg: 'Email already in use.' });
        }
        res.status(500).send('Server Error');
    }
});

// PUT /api/settings - Update user's notification/privacy settings
app.put('/api/settings', auth, async (req, res) => {
    // Destructure settings fields from request body
    const {
        emailNotifications, smsNotifications, dataSharing, reminders, twoFactorAuth
    } = req.body;

    // Prepare fields to update in the User model
    const settingsFieldsToUpdate = {};
    if (emailNotifications !== undefined) settingsFieldsToUpdate.emailNotifications = emailNotifications;
    if (smsNotifications !== undefined) settingsFieldsToUpdate.smsNotifications = smsNotifications;
    if (dataSharing !== undefined) settingsFieldsToUpdate.dataSharing = dataSharing;
    if (reminders !== undefined) settingsFieldsToUpdate.reminders = reminders;
    if (twoFactorAuth !== undefined) settingsFieldsToUpdate.twoFactorAuth = twoFactorAuth;

    // Check if any fields were actually provided for update
    if (Object.keys(settingsFieldsToUpdate).length === 0) {
        return res.status(400).json({ msg: 'No settings fields provided for update' });
    }

    try {
        // Find user by ID and update the specified settings fields
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $set: settingsFieldsToUpdate },
            { new: true } // Return the updated document
        ).select('emailNotifications smsNotifications dataSharing reminders twoFactorAuth'); // Select only the updated fields for the response

        // Check if user was found and updated
        if (!updatedUser) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(updatedUser); // Send back the updated settings fields
    } catch (err) {
        console.error("PUT /api/settings Error:", err.message);
        res.status(500).send('Server Error');
    }
});

// GET /api/history - Get user's medical history records (if using separate schema)
app.get('/api/history', auth, async (req, res) => {
    try {
        // Find all history records for the logged-in user, sort by date descending
        const history = await MedicalHistory.find({ user: req.user.id }).sort({ dateRecorded: -1 });
        res.json(history);
    } catch (err) {
        console.error("GET /api/history Error:", err.message);
        res.status(500).send('Server Error');
    }
});

// POST /api/history - Add a new medical history record (if using separate schema)
app.post('/api/history', auth, async (req, res) => {
    const { condition, notes } = req.body;

    // Basic validation
    if (!condition) {
        return res.status(400).json({ msg: 'Condition is required' });
    }

    try {
        // Create a new medical history record instance
        const newRecord = new MedicalHistory({
            user: req.user.id,
            condition,
            notes: notes || '' // Use provided notes or default to empty string
        });
        // Save the record to the database
        const record = await newRecord.save();
        res.status(201).json(record); // Send back the created record
    } catch (err) {
        console.error("POST /api/history Error:", err.message);
        res.status(500).send('Server Error');
    }
});

// POST /api/analysis - Upload skin image and save analysis results
// *** UPDATED SECTION ***
app.post('/api/analysis', auth, upload.single('skinImage'), async (req, res) => {
    // Check if a file was uploaded by multer
    if (!req.file) {
        return res.status(400).json({ msg: 'No image file uploaded' });
    }

    // Check if analysisData was sent in the request body
    if (!req.body.analysisData) {
        // Optionally delete the uploaded file if analysis data is missing
        // fs.unlink(req.file.path, (err) => { if (err) console.error("Error deleting orphaned upload:", err); });
        return res.status(400).json({ msg: 'Analysis data is missing' });
    }

    let parsedAnalysisData;
    try {
        // Parse the analysisData JSON string from the request body
        parsedAnalysisData = JSON.parse(req.body.analysisData);

        // Basic validation: ensure it's an object and potentially check for expected keys
        if (typeof parsedAnalysisData !== 'object' || parsedAnalysisData === null) {
            throw new Error("Parsed analysisData is not a valid object.");
        }
        // Example: Check if the main analysis text is present
        if (typeof parsedAnalysisData.generatedAnalysis !== 'string') {
             console.warn("Parsed analysisData missing 'generatedAnalysis' string field.");
             // Depending on requirements, you might reject here or proceed
        }

    } catch (e) {
        console.error("Could not parse analysisData JSON:", e);
        // Optionally delete the uploaded file on parsing error
        // fs.unlink(req.file.path, (err) => { if (err) console.error("Error deleting orphaned upload:", err); });
        return res.status(400).json({ msg: 'Invalid analysis data format. Expected JSON.', error: e.message });
    }

    try {
        // Construct the URL path for the saved image
        // The path should be relative to the server root if served statically
        const imageUrl = `/uploads/${req.file.filename}`;

        // Create a new analysis result document
        const newAnalysis = new AnalysisResult({
            user: req.user.id, // Link to the logged-in user
            imagePath: imageUrl, // Store the accessible path to the image
            results: parsedAnalysisData, // Store the full parsed analysis object from the frontend
            analysisDate: new Date() // Record the date of analysis
        });

        // Save the analysis result to the database
        const analysis = await newAnalysis.save();

        // Send back the saved analysis document
        res.status(201).json(analysis);

    } catch (err) {
        console.error('Error during analysis save:', err.message);
        // Attempt to delete the uploaded file if DB save fails
        fs.unlink(req.file.path, (unlinkErr) => {
            if (unlinkErr) console.error("Error deleting file after DB save failure:", unlinkErr);
        });
        res.status(500).send('Server Error during analysis saving');
    }
});
// *** END OF UPDATED SECTION ***


// GET /api/analysis - Get all analysis results for the logged-in user
app.get('/api/analysis', auth, async (req, res) => {
    try {
        // Find all analysis results associated with the user, sort by date descending
        const results = await AnalysisResult.find({ user: req.user.id }).sort({ analysisDate: -1 });
        res.json(results);
    } catch (err) {
        console.error("GET /api/analysis Error:", err.message);
        res.status(500).send('Server Error');
    }
});

// --- Global Error Handling Middleware ---
// Catches errors from routes and middleware
app.use((err, req, res, next) => {
    console.error("Global Error Handler Caught:", err);

    // Handle Multer-specific errors
    if (err instanceof multer.MulterError) {
        // e.g., file too large
        return res.status(400).json({ msg: `File upload error: ${err.message}` });
    }
    // Handle custom file filter errors
    else if (err.message.startsWith('Error: File upload only supports')) {
        return res.status(400).json({ msg: err.message });
    }
    // Handle other errors with specific status codes if available
    else if (err.status) {
         return res.status(err.status).json({ msg: err.message || 'An error occurred' });
    }

    // Generic fallback for other errors
    res.status(500).json({ msg: 'Internal Server Error', error: err.message });
});

// --- Server Start ---
const PORT = process.env.PORT || 5069; // Use port from environment or default
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));