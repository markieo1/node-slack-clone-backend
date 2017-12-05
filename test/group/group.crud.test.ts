import * as assert from 'assert';
import 'mocha';
import * as mongoose from 'mongoose';
import * as request from 'supertest';
import { Group } from '../../src/model/group.model';
import { IGroupDocument } from '../../src/model/schemas/group.schema';
import { IUserDocument } from '../../src/model/schemas/user.schema';
import { User } from '../../src/model/user.model';
import { mochaAsync } from '../test.helper';
import { Message } from '../../src/model/message.model';
const app = require('../../src/index').default;

describe('Group', () => {
    describe('Create Read Update Delete', () => {
        const userEmail = 'test@test.nl';
        const userPassword = 'test@123';
        const userNickname = 'test';

        let authToken;
        let group: IGroupDocument;

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

            authToken = token;
        }));

        beforeEach(mochaAsync(async () => {
            group = new Group({
                name: 'Test group'
            } as IGroupDocument);

            await group.save();
        }));

        it('Can get all groups', mochaAsync(async () => {
            const response = await request(app)
                .get('/api/v1/groups')
                .set('Authorization', 'bearer ' + authToken)
                .expect(200);

            const groups = response.body;

            assert(groups != null);
            assert(groups.length > 0);
            assert(groups[0].name === 'Test group');
        }));

        it('Can get a group using id', mochaAsync(async () => {
            const response = await request(app)
                .get(`/api/v1/groups/${group._id}`)
                .set('Authorization', 'bearer ' + authToken)
                .expect(200);

            const receivedGroup = response.body;

            assert(receivedGroup != null);
            assert(receivedGroup.name === 'Test group');
        }));

        it('Can create a group', mochaAsync(async () => {
            const oldCount = await Group.count({});
            await request(app)
                .post('/api/v1/groups')
                .send({
                    name: 'Group test'
                })
                .set('Authorization', 'bearer ' + authToken)
                .expect(201);

            const newCount = await Group.count({});
            assert(oldCount + 1 === newCount);
        }));

        it('Can update a group', mochaAsync(async () => {
            await request(app)
                .put(`/api/v1/groups/${group._id}`)
                .send({
                    name: 'New group name',
                })
                .set('Authorization', 'bearer ' + authToken)
                .expect(202);

            const foundGroup = await Group.findOne({ _id: group._id });
            assert(foundGroup != null);
            assert(foundGroup.name === 'New group name');
        }));

        it('Can delete a group', mochaAsync(async () => {
            await request(app)
                .delete(`/api/v1/groups/${group._id}`)
                .set('Authorization', 'bearer ' + authToken)
                .expect(204);

            const foundGroup = await Group.findOne({ _id: group._id });
            assert(foundGroup == null);
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
