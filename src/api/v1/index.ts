import express = require('express');
import recipeRoutes from './recipe.routes';
import shoppinglistRoutes from './shoppinglist.routes';

const router = express.Router();

router.use('/recipes', recipeRoutes);
router.use('/shoppinglist', shoppinglistRoutes);

export default router;