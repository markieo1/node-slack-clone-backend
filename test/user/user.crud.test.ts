import * as assert from 'assert';
import 'mocha';
import * as mongoose from 'mongoose';
import * as request from 'supertest';
import { Group } from '../../src/model/group.model';
import { Message } from '../../src/model/message.model';
import { IGroupDocument } from '../../src/model/schemas/group.schema';
import { IMessageDocument } from '../../src/model/schemas/message.schema';
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
        let group: IGroupDocument;
        let message: IMessageDocument;

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

            group = new Group({
                name: 'Test group',
                messages: []
            } as IGroupDocument);

            await group.save();

            message = new Message({
                groupId: group._id,
                message: 'Hi its me',
                from: {
                    id: authUser.id,
                    nickname: userNickname
                }
            });

            const anotherMessage = new Message({
                groupId: group._id,
                message: 'Hi its another me',
                from: {
                    id: user.id,
                    nickname: perTestNickname
                }
            });

            await message.save();
            await anotherMessage.save();

            group.messages.push(message._id, anotherMessage._id);

            await group.save();
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

        it('Can update a user\'s nickname and removes the spaces in front and after it', mochaAsync(async () => {
            await request(app)
                .put(`/api/v1/users/${user._id}`)
                .send({
                    nickname: '              New nickname                   ',
                })
                .set('Authorization', 'bearer ' + authToken)
                .expect(202);

            const foundUser = await User.findOne({ _id: user._id });
            assert(foundUser != null);
            assert(foundUser.nickname === 'New nickname');
        }));

        it('Can update a user\'s nickname and updates the messages nicknames', mochaAsync(async () => {
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

            const foundGroup = await Group.findOne({ _id: group._id });
            assert(foundGroup != null);

            const foundMessagesFromUser = await Message.find({ 'groupId': group._id, 'from.id': user._id });

            assert(foundMessagesFromUser != null);
            assert(foundMessagesFromUser.length === 1);
            assert(foundMessagesFromUser[0].from.nickname === 'New nickname');
        }));

        it('Can delete a user', mochaAsync(async () => {
            await request(app)
                .delete(`/api/v1/users/${user._id}`)
                .set('Authorization', 'bearer ' + authToken)
                .expect(204);

            const foundUser = await User.findOne({ _id: user._id });
            assert(foundUser == null);
        }));

        it('Cannot access the api with an GET by id request for login', mochaAsync(async () => {
            await request(app)
            .get(`/api/v1/users/login`)
            .expect(401);
        }));

        afterEach(mochaAsync(async () => {
            await User.remove({ _id: { $ne: authUser._id } });
            await Group.remove({});
            await Message.remove({});
        }));

        after(mochaAsync(async () => {
            await User.remove({});
        }));
    });
});
