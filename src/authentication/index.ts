import * as express from 'express';
import jwt = require('jsonwebtoken');
import passport = require('passport');
import { ExtractJwt, Strategy as JwtStrategy, StrategyOptions } from 'passport-jwt';
import { AuthenticationError } from '../api/errors/authentication.error';
import { IConfig } from '../config/config.interface';
import { IUserDocument } from '../model/schemas/user.schema';
import { User } from '../model/user.model';

const config: IConfig = require('../../config/config');
const secret = process.env.secret || config.secret;
const expiry = process.env.jwtExpires || config.jwtExpires;

function setup(app: express.Express) {
    app.use(passport.initialize());

    const opts: StrategyOptions = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: secret
    };

    passport.use(new JwtStrategy(opts, (payload, done) => {
        User.findOne({
            _id: payload.id
        }, { password: false }, (err, user) => {
            if (err) {
                return done(err, false);
            }

            if (user) {
                return done(null, user);
            } else {
                return done(new Error('User not found!'), false);
            }
        });
    }));
}

function generateJwt(user: IUserDocument): string {
    const payload = {
        email: user.email,
        id: user._id,
        nickname: user.nickname
    };

    const token = jwt.sign(payload, secret, {
        expiresIn: expiry
    });

    return token;
}

/**
 * Logs the user in and returns a token
 * @param userDocument The user document
 */
async function login(userDocument: IUserDocument): Promise<string> {
    if (!userDocument) {
        throw new AuthenticationError(400, 'No data supplied!');
    }

    if (!userDocument.email || !userDocument.password) {
        throw new AuthenticationError(400, 'Invalid data supplied!');
    }

    const user = await User.findOne({
        email: userDocument.email
    });

    if (!user) {
        throw new AuthenticationError(401, 'Authentication failed!');
    }

    const isMatch = await user.comparePassword(userDocument.password);

    if (isMatch) {
        const token = generateJwt(user);
        return token;
    } else {
        throw new AuthenticationError(401, 'Authentication failed.');
    }
}

/**
 * Registers the user and returns the token that can be used for authentication
 * @param userDocument The user document
 */
async function register(userDocument: IUserDocument): Promise<string> {
    if (!userDocument) {
        throw new AuthenticationError(400, 'No data supplied!');
    }

    if (!userDocument.email || !userDocument.password) {
        throw new AuthenticationError(400, 'Invalid data supplied!');
    }

    const newUser = new User(userDocument);

    await newUser.save();

    const token = generateJwt(newUser);
    return token;
}

const middleware = passport.authenticate('jwt', { session: false, assignProperty: 'authenticatedUser' });

export { setup, middleware, login, register };
