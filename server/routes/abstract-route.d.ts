import * as express from "express";
import Model from "../model";
export default abstract class IndexRoute {
    private router;
    private model;
    constructor(model: Model);
    protected abstract configureHandlers(model: Model): void;
    protected registerHandler(endpoint: string, handler: (model: Model, request: express.Request, response: express.Response, next: express.NextFunction) => void): void;
    getRouter(): express.Router;
}
