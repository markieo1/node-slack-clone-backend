import express = require('express');
import * as lodash from 'lodash';
import * as mongoose from 'mongoose';
import * as authentication from '../../authentication';
import { Group } from '../../model/group.model';
import { Message } from '../../model/message.model';
import { IGroupDocument } from '../../model/schemas/group.schema';
import { IMessageDocument } from '../../model/schemas/message.schema';
import { expressAsync } from '../../utils/express.async';
import { paginateMiddleware } from '../../utils/paginate.middleware';
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

    const isValidId = mongoose.Types.ObjectId.isValid(groupId);
    if (!isValidId) {
        throw new ApiError(400, 'Invalid id supplied!');
    }

    const group = await Group.findOne({ _id: groupId });
    if (!group) {
        throw new ApiError(404, 'Group not found!');
    }

    res.json(group);
}));

routes.post('/', expressAsync(async (req, res, next) => {
    const receivedProps = req.body;

    const groupProps = {
        name: receivedProps.name,
        tags: receivedProps.tags
    } as IGroupDocument;

    const group = await Group.create(groupProps);

    if (req.neo4j) {
        const neoSession = req.neo4j.session();

        const statement = `MERGE (group:Group { mId: $mId, name: $groupName })
                            WITH group
                            UNWIND $tags as tags
                            MERGE (tag:Tag { value: tags })
                            MERGE (group)-[:IS_ABOUT]->(tag)`;

        await neoSession.run(statement, { mId: group.id, groupName: group.name, tags: group.tags });

        neoSession.close();
    }

    res.status(201).send(group);
}));

routes.put('/:id', expressAsync(async (req, res, next) => {
    const groupId = req.params.id;
    const receivedProps = req.body;

    const isValidId = mongoose.Types.ObjectId.isValid(groupId);
    if (!isValidId) {
        throw new ApiError(400, 'Invalid id supplied!');
    }

    const foundGroup = await Group.findOne({ _id: groupId });

    if (!foundGroup) {
        throw new ApiError(404, 'Group not found!');
    }

    lodash.merge(foundGroup, {
        name: receivedProps.name
    });

    if (receivedProps.tags) {
        foundGroup.tags = receivedProps.tags;
    } else {
        // Tags deleted
        foundGroup.tags.remove();
    }

    foundGroup.markModified('tags');

    await foundGroup.save();

    if (req.neo4j) {
        const neoSession = req.neo4j.session();

        const statement = `MATCH (group:Group)
        WHERE group.mId = $mId
        SET group.name = $groupName
        WITH group

        OPTIONAL MATCH (group)-[r:IS_ABOUT]->(t:Tag)
        WHERE NOT t.value IN $tags
        DELETE r

        WITH group
        OPTIONAL MATCH (t:Tag)
        WHERE NOT t.value in $tags AND size((t)<--())=0
        DELETE t

        WITH DISTINCT group
        UNWIND $tags as tags
        MERGE (tag:Tag { value: tags })
        MERGE (group)-[:IS_ABOUT]->(tag)`;

        await neoSession.run(statement, { mId: foundGroup.id, groupName: foundGroup.name, tags: foundGroup.tags });

        neoSession.close();
    }

    res.status(202).json(foundGroup);
}));

routes.delete('/:id', expressAsync(async (req, res, next) => {
    const groupId = req.params.id;

    const isValidId = mongoose.Types.ObjectId.isValid(groupId);
    if (!isValidId) {
        throw new ApiError(400, 'Invalid id supplied!');
    }

    await Group.remove({ _id: groupId });

    if (req.neo4j) {
        const neoSession = req.neo4j.session();

        const statement = `MATCH (group:Group { mId: $mId })
                            DETACH DELETE group`;

        await neoSession.run(statement, { mId: groupId });

        neoSession.close();
    }

    res.status(204).send();
}));

/**
 * Handles getting all messages
 */
routes.get('/:groupId/messages', paginateMiddleware, expressAsync(async (req, res, next) => {
    const groupId = req.params.groupId;

    const isValidId = mongoose.Types.ObjectId.isValid(groupId);
    if (!isValidId) {
        throw new ApiError(400, 'Invalid id supplied!');
    }

    // TODO: Only load the latest messages, since this can be a lot very quickly
    const group = await Group.findOne({ _id: groupId });

    if (!group) {
        throw new ApiError(404, 'Group not found!');
    }

    const messages = await Message.find({ groupId });

    res.json(messages);
}));

/**
 * Handles getting one messages
 */
routes.get('/:groupId/messages/:messageId', expressAsync(async (req, res, next) => {
    const groupId = req.params.groupId;
    const messageId = req.params.messageId;

    const isValidGroupId = mongoose.Types.ObjectId.isValid(groupId);
    if (!isValidGroupId) {
        throw new ApiError(400, 'Invalid id supplied!');
    }

    const isValidMessageId = mongoose.Types.ObjectId.isValid(messageId);
    if (!isValidMessageId) {
        throw new ApiError(400, 'Invalid id supplied!');
    }

    const group = await Group.findOne({ _id: groupId }, { messages: true });
    if (!group) {
        throw new ApiError(404, 'Group not found!');
    }

    const message = await Message.findOne({ groupId, _id: messageId });

    if (!message) {
        throw new ApiError(404, 'Message not found!');
    }

    res.status(200).json(message);
}));

/**
 * Handles new messages
 */
routes.post('/:groupId/messages', expressAsync(async (req, res, next) => {
    const groupId = req.params.groupId;
    const receivedMessage = req.body;

    const isValidGroupId = mongoose.Types.ObjectId.isValid(groupId);
    if (!isValidGroupId) {
        throw new ApiError(400, 'Invalid id supplied!');
    }

    const messageProps = {
        message: lodash.trim(receivedMessage.message),
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

    messageProps.groupId = group._id;

    const message = await Message.create(messageProps);

    group.messages.push(message._id);

    await group.save();

    res.status(201).json(message);
}));

/**
 * Handles updating of messages
 */
routes.put('/:groupId/messages/:messageId', expressAsync(async (req, res, next) => {
    const groupId = req.params.groupId;
    const messageId = req.params.messageId;

    const isValidGroupId = mongoose.Types.ObjectId.isValid(groupId);
    if (!isValidGroupId) {
        throw new ApiError(400, 'Invalid id supplied!');
    }

    const isValidMessageId = mongoose.Types.ObjectId.isValid(messageId);
    if (!isValidMessageId) {
        throw new ApiError(400, 'Invalid id supplied!');
    }

    const receivedProps = req.body;

    const group = await Group.findOne({ _id: groupId }, { messages: true });
    if (!group) {
        throw new ApiError(404, 'Group not found!');
    }

    const foundMessage = await Message.findOne({ groupId, _id: messageId });

    if (!foundMessage) {
        throw new ApiError(404, 'Message not found!');
    }

    if (foundMessage.from.id.toString() !== req.authenticatedUser.id) {
        throw new ApiError(401, 'Not allowed to edit other user messages');
    }

    lodash.merge(foundMessage, {
        message: receivedProps.message
    });

    await foundMessage.save();

    res.status(202).json(foundMessage);
}));

/**
 * Handles deleting of messages
 */
routes.delete('/:groupId/messages/:messageId', expressAsync(async (req, res, next) => {
    const groupId = req.params.groupId;
    const messageId = req.params.messageId;

    const isValidGroupId = mongoose.Types.ObjectId.isValid(groupId);
    if (!isValidGroupId) {
        throw new ApiError(400, 'Invalid id supplied!');
    }

    const isValidMessageId = mongoose.Types.ObjectId.isValid(messageId);
    if (!isValidMessageId) {
        throw new ApiError(400, 'Invalid id supplied!');
    }

    const group = await Group.findOne({ _id: groupId });
    if (!group) {
        throw new ApiError(404, 'Group not found!');
    }

    const foundMessage = await Message.findOne({ groupId, _id: messageId });

    if (!foundMessage) {
        throw new ApiError(404, 'Message not found!');
    }

    if (foundMessage.from.id.toString() !== req.authenticatedUser.id) {
        throw new ApiError(401, 'Not allowed to delete other user messages');
    }

    await foundMessage.remove();

    group.messages.splice(group.messages.indexOf(foundMessage._id), 1);

    await group.save();

    res.status(204).send();
}));

/**
 * Handles getting the related groups of the specified group
 */
routes.get('/:id/related', expressAsync(async (req, res, next) => {
    const groupId = req.params.id;

    const isValidId = mongoose.Types.ObjectId.isValid(groupId);
    if (!isValidId) {
        throw new ApiError(400, 'Invalid id supplied!');
    }

    let relatedGroups: IGroupDocument[] = [];
    if (req.neo4j) {
        const neoSession = req.neo4j.session();

        const statement = `MATCH (g:Group {mId: $mId })
                        MATCH (g)-[:IS_ABOUT]->(t:Tag)
                        MATCH (group:Group)-[r:IS_ABOUT]->(t)
                        WHERE g <> group
                        RETURN group.mId as mId`;

        const result = await neoSession.run(statement, { mId: groupId });
        neoSession.close();
        const groupIds: string[] = result.records.map((record) => record.get('mId'));

        if (groupIds && groupIds.length > 0) {
            relatedGroups = await Group.find({ _id: { $in: groupIds } });
        }
    } else {
        throw new ApiError(503, 'Unable to use neo4j!');
    }

    res.json(relatedGroups);
}));

export default routes;
