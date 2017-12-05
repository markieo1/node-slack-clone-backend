import { IUserDocument } from "../model/schemas/user.schema";

declare global {
    namespace Express {
        interface Request {
            /**
             * The currently authenticated user, will be null if not authenticated
             */
            authenticatedUser?: IUserDocument;
        }
    }
}
