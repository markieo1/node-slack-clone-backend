export class ApiError extends Error {
    /**
     * The status code that should be returned to the user
     */
    public statusCode: number;

    /**
     * Initializes the ApiError instance
     * @param statusCode The status code to return
     * @param message The message of the error
     */
    constructor(statusCode: number, message?: string) {
        super(message);
        this.statusCode = statusCode;
    }
}
