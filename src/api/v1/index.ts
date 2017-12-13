import express = require('express');
import { middleware as authMiddleware } from '../../authentication';
import groupRoutes from './group.routes';
import tagRoutes from './tag.routes';
import userRoutes from './user.routes';

const router = express.Router();

// Add the auth middelware, since all these requests need to be authenticated
router.use('/groups', authMiddleware, groupRoutes);
router.use('/users', userRoutes);
router.use('/tags', authMiddleware, tagRoutes);

export default router;
