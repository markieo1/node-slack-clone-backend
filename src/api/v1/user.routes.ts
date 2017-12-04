import express = require('express');
import * as authentication from '../../authentication';
import { IUserDocument } from '../../model/schemas/user.schema';
import { User } from '../../model/user.model';

const routes = express.Router();

routes.use(/\/((?!(login|register)).)*/, authentication.middleware);

routes.get('/', (req, res, next) => {
    res.send('joo');
});

routes.post('/login', (req, res, next) => {
    const userProps: IUserDocument = req.body;

    authentication.login(userProps).then((token) => {
        res.send({ token });
    }).catch(next);
});

routes.post('/register', (req, res, next) => {
    const userProps: IUserDocument = req.body;

    authentication.register(userProps).then((token) => {
        res.send({
            success: true,
            token
        });
    }).catch(next);
});

export default routes;
