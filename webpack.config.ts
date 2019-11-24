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

	public setLibrary() : WebpackConfiguration
	{
		this.application = false;
		return this;
	}

	public isLibrary() : boolean
	{
		return !this.application;
	}

	public setApplication() : WebpackConfiguration
	{
		this.application = true;
		return this;
	}

	public isApplication() : boolean
	{
		return this.application;
	}

	public getOutputDirectory() : string
	{
		return path.resolve(".", this.application ? this.appOutputDirectory : this.libOutputDirectory);
	}

	public getServerEntry() : webpack.Entry
	{
		let entry : webpack.Entry = {};

		if (this.isApplication())
			entry["Server"] = this.getPath("./server/main.ts");
		else
			entry["Server"] = this.getPath("./server/module.ts");

		return entry;
	}

	protected getServerOutput() : webpack.Output
	{
		let output : webpack.Output = {};

		output.path = this.getOutputDirectory();

		if (this.isApplication())
		{
			output.filename = "main.js";
			output.library = "main";
			output.libraryTarget = "umd";
		}
		else
		{
			output.filename = "module.js";
			output.library = "module";
			output.libraryTarget = "umd";
		}

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
									//context: __dirname,
									configFile: this.getBasePath("tsconfig.server.json"),
									compilerOptions: {
										baseUrl: path.resolve("."),
										//include: [
										//	path.join(this.serverSourceDirectory , "**/*.ts")
										//],
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

let config : webpack.Configuration = new WebpackConfiguration().setLibrary().get()[0];

console.log(util.inspect(config, undefined, 16, true));

export default new WebpackConfiguration().setLibrary().get();