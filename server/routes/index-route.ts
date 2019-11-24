import * as express from "express";
import Model from "../model";
import AbstractRoute from "./abstract-route";

export default class IndexRoute extends AbstractRoute
{
	protected configureHandlers(model : Model) : void
	{
		this.registerHandler("/test-message", this.testMessage);
		this.registerHandler("/", this.handler);
	}

	private handler(model : Model, request : express.Request, response : express.Response, next : express.NextFunction) : void
	{
		console.log("Handling Index route request");
		response.render("index", {title: "Express+"});
	}

	private testMessage(model : Model, request : express.Request, response : express.Response, next : express.NextFunction) : void
	{
		response.setHeader("Access-Control-Allow-Origin", "*");
		response.setHeader("content-type", "text/plain");
		response.setHeader("Cache-Control", "no-store");
		response.send("Hello world!");
	}
}