import * as fs from "fs";
import * as path from "path";

export default class Model
{
	private configuration? : AppConfiguration | null;

	public constructor()
	{
		this.loadConfiguration();
	}

	protected loadConfiguration()
	{
		try
		{
			this.configuration = JSON.parse(fs.readFileSync(path.join(__dirname, "configuration.json"), "utf8"));
		}
		catch (e)
		{
			this.configuration = null;
		}

		if (!this.configuration)
		{
			// Perform fallback handling here
		}

		if (!this.configuration)
			return;

		console.log("- Description: " + this.configuration.fileDescription);
	}
}

class AppConfiguration
{
	public fileDescription? : string;
}