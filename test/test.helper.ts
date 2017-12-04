import * as mongoose from 'mongoose';
import mochaAsync from '../src/utils/mocha.async';

before(mochaAsync(async () => {
    await mongoose.connect('mongodb://localhost/slack_test', {
        useMongoClient: true
    });
}));

after(mochaAsync(async () => {
    await mongoose.disconnect();
}));

export { mochaAsync };
