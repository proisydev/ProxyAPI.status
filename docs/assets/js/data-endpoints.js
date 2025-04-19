const endpoints = [
  {
    name: "Get Health",
    path: "/ws/health",
    method: "GET",
    description: "Retrieve the current health of the API",
  },
  {
    name: "Get Metrics",
    path: "/ws/metrics",
    method: "GET",
    description: "Retrieve the current metrics of the API",
  },
  {
    name: "Get All Monitors",
    path: "/api/monitors",
    method: "GET",
    description: "Retrieve the current status of all monitored services",
  },
  {
    name: "Get Monitor Details",
    path: "/api/monitor/{monitorId}",
    method: "GET",
    description: "Retrieve detailed information about a specific monitor",
  },
  {
    name: "Get Monitor Details (Public Page)",
    path: "/api/monitor/{pageId}/{monitorId}",
    method: "GET",
    description: "Retrieve monitor details using public page data",
  },
  {
    name: "Get Public Pages",
    path: "/api/public-pages",
    method: "GET",
    description: "Retrieve all public pages data from the UptimeRobot API",
  },
  {
    name: "Get Account Details",
    path: "/api/account-details",
    method: "GET",
    description:
      "Retrieve account details, optionally with privacy settings applied",
  },
  {
    name: "Clear Cache",
    path: "/api/clear-cache",
    method: "POST",
    description: "Clear all cached data manually",
  },
  {
    name: "404 Handler",
    path: "/*",
    method: "ALL",
    description: "Catch-all endpoint for undefined routes",
  },
];

console.log("Data endpoints script loaded successfully.", endpoints);
