import bcrypt = require('bcrypt');
import { Document, Schema } from 'mongoose';
import { User } from '../user.model';

export interface IUserDocument extends Document {
    email: string;
    password: string;
    comparePassword: (password: string, callback: (error: Error, isMatch: boolean) => void) => void;
}

const userSchema: Schema = new Schema({
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: true,
        validate: {
            isAsync: true,
            validator: (value, cb) => {
                User.find({
                    email: value
                }).limit(1)
                    .then((users) => {
                        cb(users.length === 0);
                    });
            },
            msg: 'Email already in use!'
        },
        /* tslint:disable */
        match: [/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please fill in a valid email address']
        /* tslint:enable */
    },
    password: {
        type: String,
        required: true
    }
});

userSchema.pre('save', function (next) {
    const user = this;
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10)
            .then((salt) => bcrypt.hash(user.password, salt))
            .then((hash) => {
                user.password = hash;
                next();
            }).catch(next);
    } else {
        return next();
    }
});

userSchema.methods.comparePassword = function (password, callback) {
    bcrypt.compare(password, this.password)
    .then((isMatch) => callback(null, isMatch))
    .catch(callback);
};

export const UserSchema = userSchema;
