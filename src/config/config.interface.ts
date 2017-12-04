export interface IConfig {
    /**
     * The default port the server listens on
     */
    port: number;

    /**
     * The default connection to mongodb if none other was specified
     */
    mongoDbUri: string;

    /**
     * The origin that is allowed access to the api
     */
    allowOrigin: string;
}
