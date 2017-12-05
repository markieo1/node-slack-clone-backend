import express = require('express');
import * as authentication from '../../authentication';
import { Group } from '../../model/group.model';
import { IGroupDocument } from '../../model/schemas/group.schema';
import { IMessageDocument } from '../../model/schemas/message.schema';
import { expressAsync } from '../../utils/express.async';
import { ApiError } from '../errors/api.error';

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
    if (!group) {
        throw new ApiError(404, 'Group not found!');
    }

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

routes.get('/:groupId/messages', expressAsync(async (req, res, next) => {
    const groupId = req.params.groupId;

    // TODO: Only load the latest messages, since this can be a lot very quickly
    const group = await Group.findOne({ _id: groupId }, { messages: true })
        .populate('messages');

    if (!group) {
        throw new ApiError(404, 'Group not found!');
    }

    res.json(group);
}));

/**
 * Handles new messages
 */
routes.post('/:groupId/messages', expressAsync(async (req, res, next) => {
    const groupId = req.params.groupId;
    const receivedMessage = req.body;

    const messageProps = {
        message: receivedMessage.message,
        from: {
            nickname: req.authenticatedUser.nickname,
            id: req.authenticatedUser._id
        }
    } as IMessageDocument;

    const group = await Group.findOne({ _id: groupId })
        .populate('messages');

    if (!group) {
        throw new ApiError(404, 'Group not found!');
    }

    const addedMessage = group.messages.addToSet(messageProps);

    await group.save();

    res.status(201).json(addedMessage[0]);
}));

/**
 * Handles updating of messages
 */
routes.put('/:groupId/messages/:messageId', expressAsync(async (req, res, next) => {
    const groupId = req.params.groupId;
    const messageId = req.params.messageId;

    const { message } = req.body;

    const group = await Group.findOne({ _id: groupId }, { messages: true });
    if (!group) {
        throw new ApiError(404, 'Group not found!');
    }

    const messageSubDocument = group.messages.id(messageId);

    if (!messageSubDocument) {
        throw new ApiError(404, 'Message not found!');
    }

    messageSubDocument.message = message;

    await group.save();

    res.status(202).json(messageSubDocument);
}));

/**
 * Handles deleting of messages
 */
routes.delete('/:groupId/messages/:messageId', expressAsync(async (req, res, next) => {
    const groupId = req.params.groupId;
    const messageId = req.params.messageId;

    const group = await Group.findOne({ _id: groupId });
    if (!group) {
        throw new ApiError(404, 'Group not found!');
    }

    const messageSubDocument = group.messages.id(messageId);

    if (!messageSubDocument) {
        throw new ApiError(404, 'Message not found!');
    }

    await messageSubDocument.remove();
    console.log(group);
    await group.save();

    res.status(204).send();
}));

export default routes;