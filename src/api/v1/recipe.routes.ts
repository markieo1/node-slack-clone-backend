import express = require('express');
import { Recipe } from '../../model/recipe.model';

const routes = express.Router();

routes.get('/', (req, res, next) => {
    Recipe.find({})
        .then((recipes) => {
            res.status(200).json(recipes);
        })
        .catch(next);
});

routes.get('/:id', (req, res, next) => {
    const recipeId = req.params.id;

    Recipe.findOne({ _id: recipeId })
        .then((recipe) => {
            res.status(200).json(recipe);
        })
        .catch(next);
});

routes.post('/', (req, res, next) => {
    const recipeProps = req.body;

    if (recipeProps._id != null) {
        delete recipeProps._id;
    }

    Recipe.create(recipeProps)
        .then((recipe) => {
            res.status(201).json(recipe);
        })
        .catch(next);
});

routes.put('/:id', (req, res, next) => {
    const recipeId = req.params.id;
    const recipeProps = req.body;

    Recipe.findByIdAndUpdate({
        _id: recipeId
    }, recipeProps)
        .then(() => Recipe.findById({ _id: recipeId }))
        .then((recipe) => res.status(202).json(recipe))
        .catch(next);
});

routes.delete('/:id', (req, res, next) => {
    const recipeId = req.params.id;

    Recipe.remove({ _id: recipeId })
        .then(() => {
            res.status(204).send();
        })
        .catch(next);
});

export default routes;
