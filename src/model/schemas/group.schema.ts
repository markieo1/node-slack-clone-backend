import * as mongoose from 'mongoose';
import uniqueValidator = require('mongoose-unique-validator');
import { Group } from '../group.model';
import { IMessageDocument, MessageSchema } from './message.schema';

export interface IGroupDocument extends mongoose.Document {
    /**
     * The name of the group
     */
    name: string;

    /**
     * The creation date of the group
     */
    createdAt: Date;

    /**
     * The last update date of the group
     */
    updatedAt: Date;

    /**
     * The reference to the messages send in the group
     */
    messages: mongoose.Schema.Types.ObjectId[];

    /**
     * The tags of this group
     */
    tags: mongoose.Types.Array<string>;
}

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    }],
    tags: [String]
}, { timestamps: true });

groupSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
});

groupSchema.plugin(uniqueValidator);

export const GroupSchema = groupSchema;
