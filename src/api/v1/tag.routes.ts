import express = require('express');
import * as lodash from 'lodash';
import * as authentication from '../../authentication';
import { Group } from '../../model/group.model';
import { expressAsync } from '../../utils/express.async';
import { ApiError } from '../errors/api.error';

const routes = express.Router();

routes.get('/', expressAsync(async (req, res, next) => {
    const tags: string[] = await Group.distinct('tags');

    res.send(tags);
}));

export default routes;
