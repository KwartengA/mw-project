export const SERVICE_ROUTES = [
	{
		prefix: "/api/incident",
		baseUrl: process.env.INCIDENTS_SERVICE_URL ?? "http://localhost:4001",
		stripPrefix: false,
	},
	{
		prefix: "/api/dispatch",
		baseUrl: process.env.DISPATCH_SERVICE_URL ?? "http://localhost:4002",
		stripPrefix: false,
	},
	{
		prefix: "/api/analytics",
		baseUrl: process.env.ANALYTICS_SERVICE_URL ?? "http://localhost:4003",
		stripPrefix: false,
	},
];
