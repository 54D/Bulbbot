const Hapi = require("@hapi/hapi");
const client = require("prom-client");

module.exports = {
	init: async () => {
		const server = Hapi.server({
			port: global.config.server.prometheusPort,
			host: global.config.server.prometheusHost,
		});

		server.route({
			method: "GET",
			path: "/",
			handler: (request, h) => {
				return "<a href='/metrics'><h1>Metrics tab</h1></a>";
			},
		});

		server.route({
			method: "GET",
			path: "/metrics",
			handler: async (request, h) => {
				return h.response(await client.register.metrics()).type(client.register.contentType);
			},
		});

		await server.start();
		console.log(`[SERVER] Server started on ${server.info.uri}`);

		process.on("unhandledRejection", err => {
			console.log(err);
			process.exit(1);
		});
	},
};
