"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../auth");
const clerk_sdk_node_1 = require("@clerk/clerk-sdk-node");
const router = (0, express_1.Router)();
// List all patients for doctors
router.get('/patients', async (req, res) => {
    try {
        // Get doctor's ID
        const doctorId = (0, auth_1.getUserId)(req);
        if (!doctorId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        // Get all users with patient role
        const patients = await clerk_sdk_node_1.clerkClient.users.getUserList({
            orderBy: '-created_at',
        });
        // Filter and map patients with necessary info
        const patientsList = patients
            .filter((user) => user.publicMetadata?.role === 'patient' &&
            user.id !== doctorId)
            .map((user) => ({
            _id: user.id,
            name: `${user.firstName} ${user.lastName}`.trim(),
            email: user.emailAddresses[0]?.emailAddress,
            role: user.publicMetadata?.role
        }));
        res.json({ items: patientsList });
    }
    catch (err) {
        console.error('Failed to fetch patients:', err);
        res.status(500).json({ error: 'Failed to fetch patients' });
    }
});
// Get current user's role and info
router.get('/me', async (req, res) => {
    try {
        const userId = (0, auth_1.getUserId)(req);
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const user = await clerk_sdk_node_1.clerkClient.users.getUser(userId);
        const role = user.publicMetadata?.role;
        res.json({
            _id: user.id,
            name: `${user.firstName} ${user.lastName}`.trim(),
            email: user.emailAddresses[0]?.emailAddress,
            role: role || null
        });
    }
    catch (err) {
        console.error('Error getting user:', err);
        res.status(500).json({ error: 'Failed to get user info' });
    }
});
// Set user role
router.post('/role', async (req, res) => {
    try {
        const userId = (0, auth_1.getUserId)(req);
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { role } = req.body;
        if (!role || !['patient', 'doctor'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }
        const user = await clerk_sdk_node_1.clerkClient.users.updateUser(userId, {
            publicMetadata: { role }
        });
        res.json({
            _id: user.id,
            role: user.publicMetadata?.role || null,
            name: `${user.firstName} ${user.lastName}`.trim(),
            email: user.emailAddresses[0]?.emailAddress
        });
    }
    catch (err) {
        console.error('Failed to update role:', err);
        res.status(500).json({ error: 'Failed to update role' });
    }
});
exports.default = router;
