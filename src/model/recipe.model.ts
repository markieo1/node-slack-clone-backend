import { Document, Model, model, Schema } from 'mongoose';
import { IRecipeDocument, RecipeSchema} from './schemas/recipe.schema';

export interface IRecipeModel extends Model<IRecipeDocument> { }

export const Recipe: IRecipeModel = model<IRecipeDocument, IRecipeModel>('Recipe', RecipeSchema);

export default Recipe;
