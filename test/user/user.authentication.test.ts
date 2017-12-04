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

        it('Access the api with the token', mochaAsync(async () => {
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
});
