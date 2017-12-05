import express = require('express');
import * as authentication from '../../authentication';
import { Group } from '../../model/group.model';
import { IGroupDocument } from '../../model/schemas/group.schema';
import { expressAsync } from '../../utils/express.async';

const routes = express.Router();

// Add the auth middelware, since all these requests need to be authenticated
routes.use(authentication.middleware);

routes.get('/', expressAsync(async (req, res, next) => {
    const groups = await Group.find({});

    res.send(groups);
}));

routes.get('/:id', expressAsync(async (req, res, next) => {
    const groupId = req.params.id;

    const group = await Group.findOne({ _id: groupId });

    res.json(group);
}));

routes.post('/', expressAsync(async (req, res, next) => {
    const receivedProps = req.body;

    const groupProps = {
        name: receivedProps.name
    } as IGroupDocument;

    const group = await Group.create(groupProps);
    res.status(201).send(group);
}));

routes.put('/:id', expressAsync(async (req, res, next) => {
    const groupId = req.params.id;
    const receivedProps = req.body;

    const groupProps = {
        name: receivedProps.name
    } as IGroupDocument;

    const group = await Group.findByIdAndUpdate({
        _id: groupId
    }, groupProps);

    res.status(202).json(group);
}));

routes.delete('/:id', expressAsync(async (req, res, next) => {
    const groupId = req.params.id;

    await Group.remove({ _id: groupId });

    res.status(204).send();
}));

export default routes;
