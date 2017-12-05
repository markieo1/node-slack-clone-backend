import { model, Model, Schema } from 'mongoose';
import { IMessageDocument, MessageSchema } from './schemas/message.schema';

export interface IMessageModel extends Model<IMessageDocument> { }

export const Message: IMessageModel = model<IMessageDocument, IMessageModel>('Message', MessageSchema);

export default Message;
