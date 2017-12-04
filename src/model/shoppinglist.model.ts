import { Document, Model, model, Schema } from 'mongoose';
import { IngredientSchema, IIngredientDocument } from './schemas/ingredient.schema';

export interface IShoppinglistModel extends Model<IIngredientDocument> { }

export const Shoppinglist: IShoppinglistModel = model<IIngredientDocument, IShoppinglistModel>('Shoppinglist', IngredientSchema);

export default Shoppinglist;