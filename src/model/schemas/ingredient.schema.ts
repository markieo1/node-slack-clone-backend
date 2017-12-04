import { Document, Schema } from 'mongoose';

export interface IIngredientDocument extends Document {
    name: string;
    amount: number;
}

export const IngredientSchema: Schema = new Schema({
    name: String,
    amount: Number
});
