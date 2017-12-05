import { Document, Schema } from 'mongoose';

export interface IMessageDocument extends Document {
    /**
     * The message that is sent
     */
    message: string;

    /**
     * The sent date
     */
    sentAt: Date;

    /**
     * The last edited date
     */
    lastEdit: Date;

    /**
     * From whoem the message is
     */
    from: {
        /**
         * The nickname of the user
         */
        nickname: string;
        id: Schema.Types.ObjectId;
    };

    /**
     * The group id for this message
     */
    groupId: Schema.Types.ObjectId;
}

const messageSchema = new Schema({
    message: {
        type: String,
        required: true,
        trim: true
    },
    sentAt: {
        type: Date,
        default: Date.now
    },
    lastEdit: {
        type: Date,
        default: Date.now
    },
    from: {
        nickname: {
            type: String,
            required: true,
            trim: true
        },
        id: Schema.Types.ObjectId
    },
    groupId: Schema.Types.ObjectId
});

messageSchema.pre('save', function (next) {
    const message = this;
    if (this.isModified('message') && !this.isNew) {
        message.lastEdit = Date.now();
    }

    return next();
});

messageSchema.index({
    groupId: -1,
    sentAt: -1
});

export const MessageSchema = messageSchema;
