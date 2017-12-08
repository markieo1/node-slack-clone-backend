import * as assert from 'assert';
import 'mocha';
import * as mongoose from 'mongoose';
import * as request from 'supertest';
import { IUserDocument } from '../../src/model/schemas/user.schema';
import { User } from '../../src/model/user.model';
import { mochaAsync } from '../test.helper';
const app = require('../../src/index').default;

describe('User', () => {
    describe('Read Update Delete', () => {
        const userEmail = 'test@test.nl';
        const userPassword = 'test@123';
        const userNickname = 'test';

        const perTestEmail = 'testeach@test.nl';
        const perTestPassword = 'test@123';
        const perTestNickname = 'Hi i am testing';

        let authToken;

        let authUser: IUserDocument;
        let user: IUserDocument;

        before(mochaAsync(async () => {
            await mongoose.connection.dropDatabase();

            // Create an user and get the token
            authUser = new User({
                email: userEmail,
                password: userPassword,
                nickname: userNickname
            } as IUserDocument);

            await authUser.save();

            const response = await request(app)
                .post('/api/v1/users/login')
                .send({
                    email: userEmail,
                    password: userPassword
                })
                .expect(200);

            const { token } = response.body;

            authToken = token;
        }));

        beforeEach(mochaAsync(async () => {
            user = new User({
                email: perTestEmail,
                password: perTestPassword,
                nickname: perTestNickname
            } as IUserDocument);

            await user.save();
        }));

        it('Can get all users', mochaAsync(async () => {
            const response = await request(app)
                .get('/api/v1/users')
                .set('Authorization', 'bearer ' + authToken)
                .expect(200);

            const users = response.body;

            assert(users != null);
            assert(users.length === 2);
            assert(users[0].nickname === userNickname);
            assert(users[0].email === userEmail);
            assert(users[1].email === perTestEmail);
            console.log(users);

            assert(users[1].nickname === perTestNickname);
        }));

        it('Can get a user using id', mochaAsync(async () => {
            const response = await request(app)
                .get(`/api/v1/users/${user._id}`)
                .set('Authorization', 'bearer ' + authToken)
                .expect(200);

            const receivedUser = response.body;

            assert(receivedUser != null);
            assert(receivedUser.nickname === perTestNickname);
            assert(receivedUser.email === perTestEmail);
        }));

        it('Can update a user', mochaAsync(async () => {
            await request(app)
                .put(`/api/v1/users/${user._id}`)
                .send({
                    nickname: 'New nickname',
                })
                .set('Authorization', 'bearer ' + authToken)
                .expect(202);

            const foundUser = await User.findOne({ _id: user._id });
            assert(foundUser != null);
            assert(foundUser.nickname === 'New nickname');
        }));

        it('Can delete a user', mochaAsync(async () => {
            await request(app)
                .delete(`/api/v1/users/${user._id}`)
                .set('Authorization', 'bearer ' + authToken)
                .expect(204);

            const foundUser = await User.findOne({ _id: user._id });
            assert(foundUser == null);
        }));

        afterEach(mochaAsync(async () => {
            await User.remove({ _id: { $ne: authUser._id } });
        }));

        after(mochaAsync(async () => {
            await User.remove({});
        }));
    });
});
