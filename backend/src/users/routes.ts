import { Router, Request } from 'express';
import { getUserId } from '../auth';
import { clerkClient, User } from '@clerk/clerk-sdk-node';

const router = Router();

// List all patients for doctors
router.get('/patients', async (req: Request, res) => {
  try {
    // Get doctor's ID
    const doctorId = getUserId(req);
    if (!doctorId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get all users with patient role
    const patients = await clerkClient.users.getUserList({
      orderBy: '-created_at',
    });

    // Filter and map patients with necessary info
    const patientsList = patients
      .filter((user: User) => 
        user.publicMetadata?.role === 'patient' &&
        user.id !== doctorId
      )
      .map((user: User) => ({
        _id: user.id,
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.emailAddresses[0]?.emailAddress,
        role: user.publicMetadata?.role
      }));

    res.json({ items: patientsList });
  } catch (err) {
    console.error('Failed to fetch patients:', err);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// Get current user's role and info
router.get('/me', async (req: Request, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await clerkClient.users.getUser(userId);
    const role = user.publicMetadata?.role as string | undefined;
    
    res.json({ 
      _id: user.id,
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.emailAddresses[0]?.emailAddress,
      role: role || null
    });
  } catch (err) {
    console.error('Error getting user:', err);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

// Set user role
router.post('/role', async (req: Request, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { role } = req.body;
    if (!role || !['patient', 'doctor'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await clerkClient.users.updateUser(userId, {
      publicMetadata: { role }
    });

    res.json({
      _id: user.id,
      role: user.publicMetadata?.role || null,
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.emailAddresses[0]?.emailAddress
    });
  } catch (err) {
    console.error('Failed to update role:', err);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

export default router;