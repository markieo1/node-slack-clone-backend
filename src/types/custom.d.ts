import { IUserDocument } from "../model/schemas/user.schema";
import neo4j from 'neo4j-driver';

declare global {
    namespace Express {
        interface Request {
            /**
             * The currently authenticated user, will be null if not authenticated
             */
            authenticatedUser?: IUserDocument;

            /**
             * The current page, will be null if not specified in query
             */
            lastDisplayedDate?: Date;

            /**
             * The current pageSize, will be null if not specified in query
             */
            pageSize?: number;

            /*
             * The connection to the driver of neo4j
             */
            neo4j?: neo4j.Driver;
        }
    }
}
