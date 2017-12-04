import { Document, Schema } from 'mongoose';
import { IIngredientDocument, IngredientSchema } from './ingredient.schema';

export interface IRecipeDocument extends Document {
    name: string;
    description: string,
    imagePath: string,
    time: string;
    ingredients: [IIngredientDocument];
}

export const RecipeSchema: Schema = new Schema({
    name: String,
    description: String,
    imagePath: String,
    time: String,
    ingredients: [IngredientSchema]
});
