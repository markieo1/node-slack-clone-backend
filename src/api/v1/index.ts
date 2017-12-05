import express = require('express');
import userRoutes from './user.routes';
import groupRoutes from './group.routes';

const router = express.Router();

router.use('/user', userRoutes);
router.use('/group', groupRoutes);

export default router;
