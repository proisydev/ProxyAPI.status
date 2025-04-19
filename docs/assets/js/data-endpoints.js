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
    path: "/api/monitor/{page_id}/{monitor_id}",
    method: "GET",
    description:
      "Get more detailed information than official API about a specific service with the Uptime Robots Page API",
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
];

console.log("Data endpoints script loaded successfully.", endpoints);
