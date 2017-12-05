import express = require('express');
import groupRoutes from './group.routes';
import userRoutes from './user.routes';

const router = express.Router();

router.use('/groups', groupRoutes);
router.use('/users', userRoutes);

export default router;
