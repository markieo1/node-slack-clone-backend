import express = require('express');
import { Shoppinglist } from '../../model/shoppinglist.model';

const routes = express.Router();

routes.get('/', (req, res, next) => {
    Shoppinglist.find({})
        .then((shoppinglist) => {
            res.status(200).json(shoppinglist);
        })
        .catch(next);
});

routes.get('/:id', (req, res, next) => {
    const shoppinglistId = req.params.id;

    Shoppinglist.findOne({ _id: shoppinglistId })
        .then((shoppinglist) => {
            res.status(200).json(shoppinglist);
        })
        .catch(next);
});

routes.post('/', (req, res, next) => {
    const shoppinglistProps = req.body;

    Shoppinglist.create(shoppinglistProps)
        .then((shoppinglist) => {
            res.status(201).json(shoppinglist);
        })
        .catch(next);
});

routes.put('/:id', (req, res, next) => {
    const shoppinglistId = req.params.id;
    const shoppinglistProps = req.body;

    Shoppinglist.findByIdAndUpdate({
        _id: shoppinglistId
    }, shoppinglistProps)
        .then(() => Shoppinglist.findById({ _id: shoppinglistId }))
        .then((shoppinglist) => res.status(202).json(shoppinglist))
        .catch(next);
});

routes.delete('/:id', (req, res, next) => {
    const shoppinglistId = req.params.id;

    Shoppinglist.remove({ _id: shoppinglistId })
        .then(() => {
            res.status(204).send();
        })
        .catch(next);
});

export default routes;