import express = require('express');
import * as lodash from 'lodash';
import * as authentication from '../../authentication';
import { Message } from '../../model/message.model';
import { IUserDocument } from '../../model/schemas/user.schema';
import { User } from '../../model/user.model';
import { expressAsync } from '../../utils/express.async';
import { ApiError } from '../errors/api.error';

const routes = express.Router();

routes.use(/\/((?!(login|register)).)*/, authentication.middleware);

routes.get('/', expressAsync(async (req, res, next) => {
    const users = await User.find({}, { password: false });
    res.send(users);
}));

routes.get('/:id', expressAsync(async (req, res, next) => {
    const userId = req.params.id;

    const user = await User.findOne({ _id: userId });

    if (!user) {
        throw new ApiError(404, 'User not found!');
    }

    res.json(user);
}));

routes.post('/login', expressAsync(async (req, res, next) => {
    const userProps: IUserDocument = req.body;

    const token = await authentication.login(userProps);
    res.send({ token });
}));

routes.post('/register', expressAsync(async (req, res, next) => {
    const userProps: IUserDocument = req.body;

    const registeredUser = await authentication.register(userProps);

    const token = authentication.generateJwt(registeredUser);

    res.send({
        email: registeredUser.email,
        nickname: registeredUser.nickname,
        id: registeredUser.id,
        token
    });
}));

routes.put('/:id', expressAsync(async (req, res, next) => {
    const userId = req.params.id;
    const receivedProps = req.body;

    const foundUser = await User.findOne({ _id: userId }, { password: false });

    if (!foundUser) {
        throw new ApiError(404, 'User not found!');
    }

    lodash.merge(foundUser, {
        email: receivedProps.email,
        nickname: receivedProps.nickname,
        password: receivedProps.password
    });

    const isNicknameModified = foundUser.isModified('nickname');

    await foundUser.save();

    if (isNicknameModified) {
        await Message.update({ 'from.id': userId }, { 'from.nickname': foundUser.nickname });
    }

    res.status(202).json(foundUser);
}));

routes.delete('/:id', expressAsync(async (req, res, next) => {
    const userId = req.params.id;

    await User.remove({ _id: userId });

    res.status(204).send();
}));

export default routes;
