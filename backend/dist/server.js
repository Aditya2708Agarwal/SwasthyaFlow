"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const clerk_sdk_node_1 = require("@clerk/clerk-sdk-node");
const auth_1 = require("./auth");
dotenv_1.default.config();
if (!process.env.CLERK_SECRET_KEY) {
    console.error('Missing CLERK_SECRET_KEY environment variable');
    process.exit(1);
}
const app = (0, express_1.default)();
// Basic security and parsing
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// CORS
const allowedOrigins = [
    process.env.FRONTEND_ORIGIN,
    'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:3000'
].filter((origin) => Boolean(origin));
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        console.log('Request origin:', origin);
        console.log('Allowed origins:', allowedOrigins);
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Import clerk middleware and create auth middleware
const clerkMiddleware = (0, clerk_sdk_node_1.ClerkExpressWithAuth)({});
const auth = (req, res, next) => {
    try {
        clerkMiddleware(req, res, (err) => {
            if (err) {
                console.error('Auth error:', err);
                return res.status(401).json({ error: 'Unauthorized' });
            }
            next();
        });
    }
    catch (err) {
        console.error('Auth error:', err);
        res.status(401).json({ error: 'Unauthorized' });
    }
};
// Health check route (public)
app.get('/health', (_req, res) => {
    res.json({ ok: true, uptime: process.uptime() });
});
// Protected test route
app.get('/api/me', auth, (req, res) => {
    res.json({ userId: (0, auth_1.getUserId)(req) });
});
// Schedule routes
const routes_1 = __importDefault(require("./schedules/routes"));
app.use('/api/schedules', auth, routes_1.default);
// Role check test routes
app.get('/api/test/patient', auth, (req, res) => {
    const authData = req.auth;
    const role = authData?.sessionClaims?.publicMetadata?.role;
    res.json({ ok: true, role, metadata: authData?.sessionClaims?.publicMetadata });
});
// User routes
const routes_2 = __importDefault(require("./users/routes"));
app.use('/api/users', auth, routes_2.default);
// Start
const PORT = Number(process.env.PORT || 4000);
const MONGODB_URI = process.env.MONGODB_URI || '';
async function start() {
    if (!MONGODB_URI) {
        console.error('Missing MONGODB_URI');
        process.exit(1);
    }
    try {
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('Connected to MongoDB');
        app.listen(PORT, () => console.log(`API listening on :${PORT}`));
    }
    catch (err) {
        console.error('Failed to start server', err);
        process.exit(1);
    }
}
start();
