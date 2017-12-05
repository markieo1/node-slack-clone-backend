import { Document, Schema } from 'mongoose';
import { Group } from '../group.model';
import { IMessageDocument, MessageSchema } from './message.schema';

export interface IGroupDocument extends Document {
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
    messages: IMessageDocument;
}

export const GroupSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate: {
            isAsync: true,
            validator: (value, cb) => {
                Group.find({
                    name: value
                }).limit(1)
                    .then((groups) => {
                        cb(groups.length === 0);
                    });
            },
            msg: 'Group name already in use!'
        },
    },
    messages: [MessageSchema]
}, { timestamps: true });
