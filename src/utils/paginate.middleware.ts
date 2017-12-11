import * as express from 'express';

const paginateMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    let page: number = req.query.page;
    let pageSize: number = req.query.pageSize;

    if (page == null) {
        page = 1;
    }

    if (pageSize == null) {
        pageSize = 10;
    }

    req.page = page;
    req.pageSize = pageSize;

    next();
};

export { paginateMiddleware };
