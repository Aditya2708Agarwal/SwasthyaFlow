"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = requireRole;
function requireRole(role) {
    return (req, res, next) => {
        const auth = req.auth;
        if (!auth || !auth.userMetadata || auth.userMetadata.role !== role) {
            return res.status(403).json({ error: 'Access denied. Incorrect role.' });
        }
        next();
    };
}
