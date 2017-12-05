import express = require('express');
import * as authentication from '../../authentication';
import { IUserDocument } from '../../model/schemas/user.schema';
import { User } from '../../model/user.model';
import { expressAsync } from '../../utils/express.async';

const routes = express.Router();

routes.use(/\/((?!(login|register)).)*/, authentication.middleware);

routes.get('/', expressAsync(async (req, res, next) => {
    console.log(req.authenticatedUser);

    res.send({
        message: 'You are now logged in!'
    });
}));

routes.post('/login', expressAsync(async (req, res, next) => {
    const userProps: IUserDocument = req.body;

    const token = await authentication.login(userProps);
    res.send({ token });
}));

routes.post('/register', expressAsync(async (req, res, next) => {
    const userProps: IUserDocument = req.body;

    const token = await authentication.register(userProps);

    res.send({
        success: true,
        token
    });
}));

export default routes;
