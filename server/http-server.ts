"use strict";

import * as fs from "fs";
import * as path from "path";
import * as http from "http";
import express from "express";

import Model from "./model";
import IndexRoute from "./routes/index-route";

export default class HTTPServer
{
	protected static SERVER_SIDE_VIEWS : boolean = false;

	private express : express.Application;
	private httpServer : http.Server;
	public model : Model;

	protected readonly root : string;
	protected readonly port : number;

	private constructor(root : string, port : number)
	{
		console.log("Initializing server");
		this.express = express.application;
		this.httpServer = http.createServer(this.express);
		this.model = new Model();
		this.root = root;
		this.port = port;
		this.configure();
	}

	private configure() : void
	{
		if (HTTPServer.SERVER_SIDE_VIEWS)
		{
			console.log("Setting up view engine for directory: " + path.join(this.root, "views"));
			this.express.set("views", path.join(this.root, "views"));
			this.express.set("view engine", "hbs");

			console.log("Setting up routes");
			this.express.use("/", new IndexRoute(this.model).getRouter());
			this.express.use(express.static(path.join(this.root, "public")));
			this.express.use(this.fallbackHandler);
		}
		else
		{
			console.log("Setting up routes");
			this.express.use(express.static(path.join(this.root, "public")));
			this.express.use(this.fallbackHandler);
		}

		this.express.set("port", this.port);

		this.httpServer = http.createServer(this.express);
		this.httpServer.on("listening", this.onListening);
		this.httpServer.on("error", this.onError);

		console.log("Server directory: " + this.root);
		fs.readdirSync(this.root).forEach(file => console.log("- " + file));
	}

	private fallbackHandler(request : express.Request, response : express.Response, next : express.NextFunction) : void
	{
		console.log("[HTTP 404] " + request.url);

		response.statusCode = 404;
		response.send("<!DOCTYPE html><html><body>404 - Not found</body></html>");
	}

	private onListening() : void
	{
		console.log("Listening on http://localhost:" + this.port);
	}

	private onError(error : Error) : void
	{
		throw error;
	}

	public start() : HTTPServer
	{
		this.httpServer.listen(this.port);
		return this;
	}

	public static create(root : string, port : number) : HTTPServer
	{
		return new HTTPServer(root, port);
	}
}