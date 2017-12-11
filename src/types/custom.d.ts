import { IUserDocument } from "../model/schemas/user.schema";

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
            page?: number;

            /**
             * The current pageSize, will be null if not specified in query
             */
            pageSize?: number;
        }
    }
}
