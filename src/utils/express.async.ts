import express = require('express');

export const expressAsync = (fn: (req: express.Request, res: express.Response, next: express.NextFunction) => any) =>
    (req, res, next) => {
        Promise.resolve(fn(req, res, next))
            .catch(next);
    };
