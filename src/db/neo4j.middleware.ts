import * as express from 'express';
import neo4j from 'neo4j-driver';

export function neo4jInRequest(driver: neo4j.Driver) {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
        req.neo4j = driver;
        next();
    };
}
