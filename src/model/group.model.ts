import { model, Model, Schema } from 'mongoose';
import { GroupSchema, IGroupDocument } from './schemas/group.schema';

export interface IGroupModel extends Model<IGroupDocument> { }

export const Group: IGroupModel = model<IGroupDocument, IGroupModel>('Group', GroupSchema);

export default Group;
