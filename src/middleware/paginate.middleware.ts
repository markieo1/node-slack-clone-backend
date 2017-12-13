import * as express from 'express';

const paginateMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const lastDisplayedDate: Date = req.query.lastDisplayedDate ? new Date(req.query.lastDisplayedDate) : new Date();
    const pageSize: number = req.query.pageSize || 10;

    req.lastDisplayedDate = lastDisplayedDate;
    req.pageSize = pageSize;

    next();
};

export { paginateMiddleware };
