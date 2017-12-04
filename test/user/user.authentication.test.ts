import * as assert from 'assert';
import 'mocha';
import * as mongoose from 'mongoose';
import * as request from 'supertest';
import { IUserDocument } from '../../src/model/schemas/user.schema';
import { User } from '../../src/model/user.model';
import { mochaAsync } from '../test.helper';
const app = require('../../src/index').default;

describe('User', () => {
    before(mochaAsync(async () => {
        await mongoose.connection.dropDatabase();
    }));

    describe('Authentication', () => {
        const userEmail = 'test@test.nl';
        const userPassword = 'test@123';

        before(mochaAsync(async () => {
            const user = new User({
                email: userEmail,
                password: userPassword
            } as IUserDocument);

            await user.save();
        }));

        describe('Login', () => {
            it('Can login with valid credentials and gets a token', mochaAsync(async () => {
                const response = await request(app)
                    .post('/api/v1/user/login')
                    .send({
                        email: userEmail,
                        password: userPassword
                    })
                    .expect(200);

                const body = response.body;
                assert(body.token);
            }));

            it('Cannot login with invalid credentials', mochaAsync(async () => {
                const response = await request(app)
                    .post('/api/v1/user/login')
                    .send({
                        email: 'something@test.nl',
                        password: 'anotherPassword'
                    })
                    .expect(401);
            }));

            it('Cannot login with missing email', mochaAsync(async () => {
                const response = await request(app)
                    .post('/api/v1/user/login')
                    .send({
                        password: 'test@123',
                    })
                    .expect(400);
            }));

            it('Cannot login with missing password', mochaAsync(async () => {
                const response = await request(app)
                    .post('/api/v1/user/login')
                    .send({
                        email: 'something@test.nl',
                    })
                    .expect(400);
            }));

            it('Can access the api with a valid token', mochaAsync(async () => {
                const loginResponse = await request(app)
                    .post('/api/v1/user/login')
                    .send({
                        email: userEmail,
                        password: userPassword
                    })
                    .expect(200);

                const loginBody = loginResponse.body;
                const token = loginBody.token;
                assert(token);

                // Make a request to an authenticated call
                const authResponse = await request(app)
                    .get('/api/v1/user/')
                    .set('Authorization', 'bearer ' + token)
                    .expect(200);

                const message = authResponse.body.message;
                assert(message === 'You are now logged in!');
            }));

            it('Cannot access the api without a valid token', mochaAsync(async () => {
                const token = 'SOMEINVALIDTOKEN';
                // Make a request to an authenticated call
                await request(app)
                    .get('/api/v1/user/')
                    .set('Authorization', 'bearer ' + token)
                    .expect(401);
            }));
        });

        describe('Registration', () => {
            it('Can register using a valid email', mochaAsync(async () => {
                const response = await request(app)
                    .post('/api/v1/user/register')
                    .send({
                        email: 'test@abc.nl',
                        password: 'abc@123'
                    })
                    .expect(200);

                const { token, success } = response.body;

                assert(success === true);
                assert(token);
            }));

            it('Cannot register without email', mochaAsync(async () => {
                const response = await request(app)
                    .post('/api/v1/user/register')
                    .send({
                        password: 'abc@123'
                    })
                    .expect(400);
            }));

            it('Cannot register without password', mochaAsync(async () => {
                const response = await request(app)
                    .post('/api/v1/user/register')
                    .send({
                        email: 'test@abc.nl'
                    })
                    .expect(400);
            }));

            it('Cannot register without a valid email', mochaAsync(async () => {
                const response = await request(app)
                    .post('/api/v1/user/register')
                    .send({
                        email: '(d@a).nl',
                        password: 'abc@123'
                    })
                    .expect(400);

                const { error } = response.body;

                assert(error === 'Please fill in a valid email address');
            }));

        });
    });
});
