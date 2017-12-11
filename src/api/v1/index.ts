import express = require('express');
import groupRoutes from './group.routes';
import tagRoutes from './tag.routes';
import userRoutes from './user.routes';

const router = express.Router();

router.use('/groups', groupRoutes);
router.use('/users', userRoutes);
router.use('/tags', tagRoutes);

export default router;
