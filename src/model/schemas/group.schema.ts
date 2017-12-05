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
     * The messages send in the group
     */

    messages: mongoose.Types.DocumentArray<IMessageDocument>;
}

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    messages: [MessageSchema]
}, { timestamps: true });

groupSchema.plugin(uniqueValidator);

export const GroupSchema = groupSchema;
