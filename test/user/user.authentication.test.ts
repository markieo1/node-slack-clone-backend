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
        describe('Login', () => {
            const userEmail = 'test@test.nl';
            const userPassword = 'test@123';
            const userNickname = 'test';

            beforeEach(mochaAsync(async () => {
                const user = new User({
                    email: userEmail,
                    password: userPassword,
                    nickname: userNickname
                } as IUserDocument);

                await user.save();
            }));

            it('Can login with valid credentials and gets a token', mochaAsync(async () => {
                const response = await request(app)
                    .post('/api/v1/users/login')
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
                    .post('/api/v1/users/login')
                    .send({
                        email: 'something@test.nl',
                        password: 'anotherPassword'
                    })
                    .expect(401);
            }));

            it('Cannot login with missing email', mochaAsync(async () => {
                const response = await request(app)
                    .post('/api/v1/users/login')
                    .send({
                        password: 'test@123',
                    })
                    .expect(400);
            }));

            it('Cannot login with missing password', mochaAsync(async () => {
                const response = await request(app)
                    .post('/api/v1/users/login')
                    .send({
                        email: 'something@test.nl',
                    })
                    .expect(400);
            }));

            it('Can access the api with a valid token', mochaAsync(async () => {
                const loginResponse = await request(app)
                    .post('/api/v1/users/login')
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
                    .get('/api/v1/users/')
                    .set('Authorization', 'bearer ' + token)
                    .expect(200);

                const message = authResponse.body.message;
                assert(message === 'You are now logged in!');
            }));

            it('Cannot access the api without a valid token', mochaAsync(async () => {
                const token = 'SOMEINVALIDTOKEN';
                // Make a request to an authenticated call
                await request(app)
                    .get('/api/v1/users/')
                    .set('Authorization', 'bearer ' + token)
                    .expect(401);
            }));
        });

        describe('Registration', () => {
            const userEmail = 'test@test.nl';
            const userPassword = 'test@123';
            const userNickname = 'test';

            beforeEach(mochaAsync(async () => {
                const user = new User({
                    email: userEmail,
                    password: userPassword,
                    nickname: userNickname
                } as IUserDocument);

                await user.save();
            }));

            it('Can register using a valid email', mochaAsync(async () => {
                const response = await request(app)
                    .post('/api/v1/users/register')
                    .send({
                        email: 'test@abc.nl',
                        password: 'abc@123',
                        nickname: 'test'
                    })
                    .expect(200);

                const { token, success } = response.body;

                assert(success === true);
                assert(token);
            }));

            it('Cannot register without email', mochaAsync(async () => {
                const response = await request(app)
                    .post('/api/v1/users/register')
                    .send({
                        password: 'abc@123'
                    })
                    .expect(400);
            }));

            it('Cannot register without password', mochaAsync(async () => {
                const response = await request(app)
                    .post('/api/v1/users/register')
                    .send({
                        email: 'test@abc.nl'
                    })
                    .expect(400);
            }));

            it('Cannot register without a valid email', mochaAsync(async () => {
                const response = await request(app)
                    .post('/api/v1/users/register')
                    .send({
                        email: '(d@a).nl',
                        password: 'abc@123',
                        nickname: 'test'
                    })
                    .expect(400);

                const { error } = response.body;

                assert(error === 'Please fill in a valid email address');
            }));

            it('Cannot register with an used email', mochaAsync(async () => {
                const response = await request(app)
                    .post('/api/v1/users/register')
                    .send({
                        email: userEmail,
                        password: 'abc@123',
                        nickname: 'test'
                    })
                    .expect(400);
            }));

        });

        afterEach(mochaAsync(async () => {
            await User.remove({});
        }));
    });
});
