import bcrypt = require('bcrypt');
import { Document, Schema } from 'mongoose';
import uniqueValidator = require('mongoose-unique-validator');
import { User } from '../user.model';

export interface IUserDocument extends Document {
    email: string;
    password: string;
    nickname: string;
    comparePassword: (password: string) => Promise<boolean>;
}

const userSchema: Schema = new Schema({
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: true,
        trim: true,
        /* tslint:disable */
        match: [/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please fill in a valid email address'],
        /* tslint:enable */
        uniqueCaseInsensitive: true
    },
    password: {
        type: String,
        required: true
    },
    nickname: {
        type: String,
        required: true
    }
});

userSchema.pre('save', async function (next) {
    const user = this;
    try {
        if (this.isModified('password') || this.isNew) {
            const hash = await bcrypt.hash(user.password, await bcrypt.genSalt(10));
            user.password = hash;
        }
    } catch (e) {
        return next(e);
    }

    return next();
});

userSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.password);
};

userSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret, options) => {
        delete ret.password;
        return ret;
    }
});

userSchema.plugin(uniqueValidator);

export const UserSchema = userSchema;
