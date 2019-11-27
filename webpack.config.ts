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

	protected getServerOutput() : webpack.Output
	{
		let output : webpack.Output = {};

		output.path = this.getOutputDirectory();
		output.filename = "[name].js";
		output.library = "[name]";
		output.libraryTarget = "umd";

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
	 * Returns the given relative path to an existing file in the application directory,
	 * or falls back to a path to the same file in the library.
	 */
	protected getPath(relativePath : string) : string
	{
		if (fs.existsSync(relativePath))
			return relativePath;
		else
			return this.getBasePath(relativePath);
	}

	/**
	 * Returns the absolte path to the file in the core library, specified by the given relative path.
	 */
	protected getBasePath(relativePath : string) : string
	{
		return path.resolve(__dirname, relativePath);
	}
}

export default new WebpackConfiguration().setLibrary().get();