import * as express from 'express';
import jwt = require('jsonwebtoken');
import passport = require('passport');
import { ExtractJwt, Strategy as JwtStrategy, StrategyOptions } from 'passport-jwt';
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
        }, (err, user) => {
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
        id: user._id
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
function login(userDocument: IUserDocument): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        if (!userDocument) {
            return reject(new Error('No data supplied!'));
        }

        if (!userDocument.email || !userDocument.password) {
            return reject(new Error('Invalid data supplied!'));
        }

        User.findOne({
            email: userDocument.email
        }, (error, user) => {
            if (error) {
                return reject(error);
            }

            if (!user) {
                return reject('User not found!');
            }

            user.comparePassword(userDocument.password, (err, isMatch) => {
                if (isMatch && !err) {
                    const token = generateJwt(user);

                    resolve(token);
                } else {
                    return reject(new Error('Authentication failed.'));
                }
            });
        });
    });
}

/**
 * Registers the user and returns the token that can be used for authentication
 * @param userDocument The user document
 */
function register(userDocument: IUserDocument): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        if (!userDocument) {
            return reject('No data supplied!');
        }

        if (!userDocument.email || !userDocument.password) {
            return reject('Please enter email and password');
        }

        const newUser = new User(userDocument);

        newUser.save((error) => {
            if (error) {
                return reject(error);
            }

            const token = generateJwt(newUser);
            resolve(token);
        });
    });
}

const middleware = passport.authenticate('jwt', { session: false });

export { setup, middleware, login, register };
