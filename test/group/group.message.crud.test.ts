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

describe('Group', () => {
    describe('Messages', () => {
        const userEmail = 'test@test.nl';
        const userPassword = 'test@123';
        const userNickname = 'test';

        let userId;
        let authToken;
        let group: IGroupDocument;
        let message: IMessageDocument;

        before(mochaAsync(async () => {
            await mongoose.connection.dropDatabase();

            // Create an user and get the token
            const user = new User({
                email: userEmail,
                password: userPassword,
                nickname: userNickname
            } as IUserDocument);

            await user.save();

            const response = await request(app)
                .post('/api/v1/users/login')
                .send({
                    email: userEmail,
                    password: userPassword
                })
                .expect(200);

            const { token } = response.body;

            userId = user.id;
            authToken = token;
        }));

        beforeEach(mochaAsync(async () => {
            group = new Group({
                name: 'Test group',
                messages: []
            } as IGroupDocument);

            await group.save();

            message = new Message({
                groupId: group._id,
                message: 'Hi its me',
                from: {
                    id: userId,
                    nickname: userNickname
                }
            });

            await message.save();

            group.messages.push(message._id);

            await group.save();
        }));

        it('Can get all messages in a group', mochaAsync(async () => {
            const response = await request(app)
                .get(`/api/v1/groups/${group.id}/messages`)
                .set('Authorization', 'bearer ' + authToken)
                .expect(200);

            const { _id, messages } = response.body;

            assert(_id === group.id);
            assert(messages != null);
            assert(messages.length > 0);
            assert(messages[0].message === 'Hi its me');
            assert(messages[0].from.id === userId);
        }));

        it('Can get a single message using id', mochaAsync(async () => {
            const response = await request(app)
                .get(`/api/v1/groups/${group.id}/messages/${group.messages[0]}`)
                .set('Authorization', 'bearer ' + authToken)
                .expect(200);

            const receivedMessage = response.body;

            assert(receivedMessage != null);
            assert(receivedMessage.message === 'Hi its me');
            assert(receivedMessage.from.id === userId);
        }));

        it('Can add a message to a group', mochaAsync(async () => {
            const oldCount = group.messages.length;
            await request(app)
                .post(`/api/v1/groups/${group.id}/messages`)
                .send({
                    message: 'Hi this is a new message :-D'
                })
                .set('Authorization', 'bearer ' + authToken)
                .expect(201);

            const savedGroup = await Group.findOne({ _id: group.id });
            assert(savedGroup != null);

            const newCount = savedGroup.messages.length;
            assert(oldCount + 1 === newCount);
        }));

        it('Can update a message', mochaAsync(async () => {
            await request(app)
                .put(`/api/v1/groups/${group.id}/messages/${group.messages[0]}`)
                .send({
                    message: 'Hi the new text should be this',
                })
                .set('Authorization', 'bearer ' + authToken)
                .expect(202);

            const foundGroup = await Group.findOne({ _id: group._id });
            assert(foundGroup != null);

            const foundMessage = await Message.findOne({ groupId: group._id, _id: group.messages[0] });

            assert(foundMessage != null);
            assert(foundMessage.message === 'Hi the new text should be this');
            assert(foundMessage.lastEdit !== message.lastEdit);
        }));

        it('Can delete a message', mochaAsync(async () => {
            await request(app)
                .delete(`/api/v1/groups/${group.id}/messages/${group.messages[0]}`)
                .set('Authorization', 'bearer ' + authToken)
                .expect(204);

            const foundGroup = await Group.findOne({ _id: group._id });

            assert(foundGroup.messages.length !== group.messages.length);

            const foundMessage = await Message.findOne({ groupId: group._id, _id: group.messages[0] });

            assert(foundMessage == null);
        }));

        it('Cannot send invalid data to a group', mochaAsync(async () => {
            const oldCount = group.messages.length;
            await request(app)
                .post(`/api/v1/groups/${group.id}/messages`)
                .send({
                    invalid: 'Something invalid'
                })
                .set('Authorization', 'bearer ' + authToken)
                .expect(400);
        }));

        afterEach(mochaAsync(async () => {
            await Group.remove({});
            await Message.remove({});
        }));

        after(mochaAsync(async () => {
            await User.remove({});
        }));
    });
});
