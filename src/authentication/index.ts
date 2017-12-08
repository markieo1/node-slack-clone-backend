import * as express from 'express';
import jwt = require('jsonwebtoken');
import passport = require('passport');
import { ExtractJwt, Strategy as JwtStrategy, StrategyOptions } from 'passport-jwt';
import { AuthenticationError } from '../api/errors/authentication.error';
import { Config } from '../config/config.const';
import { IUserDocument } from '../model/schemas/user.schema';
import { User } from '../model/user.model';

function setup(app: express.Express) {
    app.use(passport.initialize());

    const opts: StrategyOptions = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: Config.secret
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

    const token = jwt.sign(payload, Config.secret, {
        expiresIn: Config.jwtExpires
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
async function register(userDocument: IUserDocument): Promise<IUserDocument> {
    if (!userDocument) {
        throw new AuthenticationError(400, 'No data supplied!');
    }

    if (!userDocument.email || !userDocument.password) {
        throw new AuthenticationError(400, 'Invalid data supplied!');
    }

    const newUser = new User(userDocument);

    await newUser.save();

    return newUser;
}

const middleware = passport.authenticate('jwt', { session: false, assignProperty: 'authenticatedUser' });

export { setup, middleware, generateJwt, login, register };
