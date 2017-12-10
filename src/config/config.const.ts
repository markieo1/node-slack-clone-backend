import { IConfig } from './config.interface';

const config: IConfig = require('../../config/config');

export const Config: IConfig = {
    port: (process.env.PORT || config.port) as number,
    mongoDbUri: process.env.MONGODB_URI || config.mongoDbUri,
    allowOrigin: process.env.ALLOW_ORIGIN || config.allowOrigin,
    secret: process.env.SECRET || config.secret,
    jwtExpires: process.env.JWT_EXPIRES || config.jwtExpires
};
