import * as assert from 'assert';
import 'mocha';
import * as request from 'supertest';
import { Recipe } from '../src/model/recipe.model';
import { IngredientSchema } from '../src/model/schemas/ingredient.schema';
import { IRecipeDocument } from '../src/model/schemas/recipe.schema';
const app = require('../src/index').default;

describe('Recipes routes', () => {
    let recipe: IRecipeDocument;

    beforeEach((done) => {
        recipe = new Recipe({
            name: 'Taart',
            time: '5 hours',
            ingredients: [
                {
                    name: 'Apple',
                    amount: 10
                }
            ]
        } as IRecipeDocument);

        recipe.save().then(() => done());
    });

    it('Gets to /api/v1/recipes get all recipes', (done) => {
        request(app)
            .get('/api/v1/recipes')
            .expect(200)
            .then((response) => {
                const responseBody = response.body;

                assert(responseBody != null);
                assert(responseBody.length > 0);
                assert(responseBody[0].name === 'Taart');
                done();
            });
    });

    it('Gets to /api/v1/recipes/:id gets a single recipe', (done) => {
        request(app)
            .get(`/api/v1/recipes/${recipe._id}`)
            .expect(200)
            .then((response) => {
                const responseBody = response.body;

                assert(responseBody != null);
                assert(responseBody.name === 'Taart');
                assert(responseBody.time === '5 hours');
                done();
            });
    });

    it('Gets to /api/v1/recipes/:id gets a single recipe with ingredients', (done) => {
        request(app)
            .get(`/api/v1/recipes/${recipe._id}`)
            .expect(200)
            .then((response) => {
                const responseBody = response.body;

                assert(responseBody != null);
                assert(responseBody.name === 'Taart');
                assert(responseBody.time === '5 hours');
                assert(responseBody.ingredients != null);
                assert(responseBody.ingredients.length > 0);
                assert(responseBody.ingredients[0].name === 'Apple');
                done();
            });
    });

    it('Post to /api/v1/recipes creates a new recipe', (done) => {
        Recipe.count({}).then((count) => {
            request(app)
                .post('/api/v1/recipes')
                .send({
                    name: 'Test recipe',
                    time: '5 minutes',
                    ingredients: []
                })
                .expect(201)
                .then(() => {
                    Recipe.count({}).then((newCount) => {
                        assert(count + 1 === newCount);
                        done();
                    });
                });
        });
    });

    it('Post to /api/v1/recipes creates a new recipe with ingredients', (done) => {
        request(app)
            .post('/api/v1/recipes')
            .send({
                name: 'Test recipe',
                time: '5 minutes',
                ingredients: [
                    {
                        name: 'Apple',
                        amount: 10
                    }
                ]
            } as IRecipeDocument)
            .expect(201)
            .then(() => {
                Recipe.findOne({ name: 'Test recipe' })
                    .then((foundRecipe) => {
                        assert(foundRecipe.ingredients != null);
                        assert(foundRecipe.ingredients.length > 0);
                        assert(foundRecipe.ingredients[0].name === 'Apple');
                        done();
                    });
            });
    });

    it('Put to /api/v1/recipes/id updates a recipe', (done) => {
        request(app)
            .put(`/api/v1/recipes/${recipe._id}`)
            .send({
                name: 'Test recipe',
            } as IRecipeDocument)
            .expect(202)
            .then(() => {
                Recipe.findOne({ _id: recipe._id })
                    .then((foundRecipe) => {
                        assert(foundRecipe != null);
                        assert(foundRecipe.name === 'Test recipe');
                        assert(foundRecipe.time === '5 hours');
                        done();
                    });
            });
    });

    it('Put to /api/v1/recipes/id updates a recipe ingredients', (done) => {
        request(app)
            .put(`/api/v1/recipes/${recipe._id}`)
            .send({
                ingredients: [
                    {
                        name: 'Banana',
                        amount: 50
                    }
                ]
            } as IRecipeDocument)
            .expect(202)
            .then(() => {
                Recipe.findOne({ _id: recipe._id })
                    .then((foundRecipe) => {
                        assert(foundRecipe != null);
                        assert(foundRecipe.name === 'Taart');
                        assert(foundRecipe.time === '5 hours');
                        assert(foundRecipe.ingredients != null);
                        assert(foundRecipe.ingredients.length === 1);
                        assert(foundRecipe.ingredients[0].name === 'Banana');
                        assert(foundRecipe.ingredients[0].amount === 50);
                        done();
                    });
            });
    });

    it('Delete to /api/v1/recipes/:id deletes a recipe', (done) => {
        request(app)
            .delete(`/api/v1/recipes/${recipe._id}`)
            .expect(204)
            .then(() => {
                Recipe.findOne({ _id: recipe._id })
                    .then((foundRecipe) => {
                        assert(foundRecipe === null);
                        done();
                    });
            });
    });
});
