import * as fs from "fs";
import * as path from "path";
import * as webpack from "webpack";
import * as util from "util";

const externals = require("webpack-node-externals");

export class WebpackConfiguration
{
	protected readonly libOutputDirectory : string = "lib";
	protected readonly appOutputDirectory : string = "dist";

	protected readonly serverSourceDirectory : string = "server";

	protected application : boolean = true;
	protected library : boolean = false;

	private searchPath : Array<string>;

	public constructor()
	{
		this.searchPath = new Array();
		this.extendSearchPath(__dirname);
	}

	public setLibrary() : WebpackConfiguration
	{
		this.application = false;
		this.library = true;
		return this;
	}

	public isLibrary() : boolean
	{
		return this.library;
	}

	public setApplication() : WebpackConfiguration
	{
		this.application = true;
		this.library = false;
		return this;
	}

	public isApplication() : boolean
	{
		return this.application;
	}

	public setHybrid() : WebpackConfiguration
	{
		this.application = true;
		this.library = true;
		return this;
	}

	public isHybrid() : boolean
	{
		return this.application && this.library;
	}

	public getOutputDirectory() : string
	{
		return path.resolve(".", this.isLibrary() ? this.libOutputDirectory : this.appOutputDirectory);
	}

	public getServerEntry() : webpack.Entry
	{
		let entry : webpack.Entry = {};

		if (this.isApplication())
			entry["main"] = this.getPath("./server/main.ts");

		if (this.isLibrary())
			entry["module"] = this.getPath("./server/module.ts");

		return entry;
	}

	public getClientEntry() : webpack.Entry
	{
		let entry : webpack.Entry = {};

		entry["polyfills"] = this.getPath("./client/polyfills.ts");
		entry["app"] = this.getPath("./client/main.ts");

		return entry;
	}

	protected getServerOutput() : webpack.Output
	{
		let output : webpack.Output = {};

		output.path = this.getOutputDirectory();
		output.filename = "[name].js";
		output.library = "[name]";
		output.libraryTarget = "umd";

		return output;
	}

	protected getClientOutput() : webpack.Output
	{
		let output : webpack.Output = {};

		output.path = path.resolve(".", this.getOutputDirectory(), "public");
		output.filename = "[name].bundle.js";
		output.chunkFilename = "[name].bundle.js";

		return output;
	}

	public getServerConfig() : webpack.Configuration
	{
		return {
			target: "node",
			mode: "development",
			devtool: "inline-source-map",
			entry: this.getServerEntry(),
			module: {
				rules: [
					{
						test: /\.tsx?$/,
						loaders: [
							{
								loader: "ts-loader",
								options: {
									configFile: "tsconfig.server.json",
									compilerOptions: {
										baseUrl: path.resolve("."),
										outDir: this.getOutputDirectory()
									}
								}
							}
						],
						exclude: /node_modules/
					}
				]
			},
			resolve: {
				extensions: [".tsx", ".ts", ".js"],
				alias: {
					"hiredis": path.resolve(__dirname, "server", "helpers", "hiredis.js")
				}
			},
			output: this.getServerOutput(),
			node: {
				// Do not let Webpack change these globals
				__dirname: false,
				__filename: false,
			},
			externals: [externals()]
		};
	}

	public dump() : WebpackConfiguration
	{
		console.log(util.inspect(this.get(), undefined, null, true));
		return this;
	}

	public get() : webpack.Configuration[]
	{
		return [this.getServerConfig()];
	}

	/**
	 * Extends the search path with the specified path. The specified path will be added with the highest
	 * priority, meaning that searches will hit the added path before hitting previously added paths.
	 */
	public extendSearchPath(path : string) : WebpackConfiguration
	{
		this.searchPath.push(path);

		return this;
	}

	/**
	 * Returns the given relative path to an existing file in the application directory,
	 * or falls back to a path in a dependeny directory, according to the search path.
	 */
	protected getPath(relativePath : string) : string
	{
		let resolvedPath;

		if (fs.existsSync(relativePath))
			return relativePath;

		for (let i = this.searchPath.length - 1; i >= 0; --i)
		{
			resolvedPath = path.resolve(this.searchPath[i], relativePath);
			if (fs.existsSync(resolvedPath))
				return resolvedPath;
		}

		return relativePath;
	}
}

export default new WebpackConfiguration().setLibrary().get();