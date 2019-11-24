import HTTPServer from "./http-server";

export default abstract class AbstractServerStarter
{
	protected static SOCKET : string = process.env.SOCKET || "/opt/common/ipc.socket";

	protected readonly root : string;

	private server? : HTTPServer;

	/*private redisIn? : redis.RedisClient;
	private redisInReady : boolean = false;
	private redisOut? : redis.RedisClient;
	private redisOutReady : boolean = false;*/

	protected constructor(root? : string)
	{
		this.root = root ? root : process.cwd();
		//this.connectToFrontend();
	}

	public getServer() : HTTPServer | null
	{
		return this.server ? this.server : null;
	}

	private connectToFrontend()
	{
		console.log("Connecting to the frontend");

		/*this.redisIn = redis.createClient(ServerStarter.SOCKET);

		this.redisIn.on("ready", () => {
			if (!this.redisIn) return;
			this.redisInReady = true;
			console.log("Subscribing");
			this.redisIn.subscribe("frontend-to-backend:pxserver");
		});
		this.redisIn.on("message", (channel : string, message : string) => {
			console.log("Channel <" + channel + ">: " + message);
			if (this.redisOut && this.redisOutReady)
				this.redisOut.publish("backend-to-frontend:pxserver", "Received your message!");
		});

		this.redisOut = redis.createClient(ServerStarter.SOCKET);
		this.redisOut.on("ready", () => {
			if (!this.redisOut) return;
			this.redisOutReady = true;
			setTimeout(() => {
				if (!this.redisOut) return;
				console.log("Sending a message");
				this.redisOut.publish("backend-to-frontend:pxserver", "Hello from Backend!");
			}, 3000)
		});*/
	}

	protected startHTTPServer() : void
	{
		let port : number = process.env.PORT ? Number.parseInt(process.env.PORT) : 3000;
		this.server = HTTPServer.create(this.root, port);
		this.server.start();

		/*this.server.express.set("port", this.port);

		this.httpServer = http.createServer(this.server.express);
		this.httpServer.on("listening", () => this.onListening(this));
		this.httpServer.on("error", (error) => this.onError(this, error));*/
	}

	protected start() : AbstractServerStarter
	{
		return this;
	}

	public static start(root? : string) : AbstractServerStarter
	{
		throw new Error("Not implemented");

		//return new AbstractServerStarter(root).start();
	}
}