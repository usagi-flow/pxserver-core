import * as express from "express";
import Model from "../model";

export default abstract class IndexRoute
{
	private router : express.Router;
	private model : Model;

	public constructor(model : Model)
	{
		this.router = express.Router();
		this.model = model;

		this.configureHandlers(model);
	}

	protected abstract configureHandlers(model : Model) : void;

	protected registerHandler(endpoint : string,
		handler : (model : Model, request : express.Request, response : express.Response, next : express.NextFunction) => void) : void
	{
		this.router.get(endpoint,
			(request : express.Request, response : express.Response, next : express.NextFunction) =>
				handler(this.model, request, response, next));
	}

	public getRouter() : express.Router
	{
		return this.router;
	}
}