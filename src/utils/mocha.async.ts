const mochaAsync = (fn) => {
    return (done) => {
        Promise.resolve(fn())
            .then(() => done())
            .catch(done);
    };
};

export default mochaAsync;
