import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as http from 'http';
import mongoose = require('mongoose');
import * as logger from 'morgan';
import * as apiRoutes from './api';
import { IConfig } from './config/config.interface';

const config: IConfig = require('../config/config');
const port = process.env.PORT || config.port;

const app = express();

mongoose.Promise = global.Promise;

// Connect to MongoDB.
if (process.env.NODE_ENV !== 'test') {
    mongoose.connect(process.env.MONGODB_URI || config.mongoDbUri);
    mongoose.connection.on('error', (error) => {
        console.error('MongoDB connection error. Please make sure MongoDB is running.', error);
        process.exit(1);
    });
}

app.use(bodyParser.json());

app.use(logger('dev'));

// CORS headers
app.use((req, res, next) => {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', process.env.ALLOW_ORIGIN || config.allowOrigin);
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    next();
});

// Add the routes
app.use('/api', apiRoutes);

app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not found.',
    });
});

app.use((err, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('An error has occured!', err);
    res.status(500).json({
        error: 'An error has occurred!'
    });
});

app.listen(port, () => {
    console.log(`Started listening on port ${port}`);
});

export default app;
