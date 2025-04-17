// Endpoints data
const endpoints = [
  {
    name: "Get Health",
    path: "/health",
    method: "GET",
    description: "Retrieve the current health of the API",
    example: `fetch('https://demo-api.watchstat.us/health')
.then(response => response.json())
.then(data => console.log(data));`,
  },
  {
    name: "Get Metrics",
    path: "/metrics",
    method: "GET",
    description: "Retrieve the current metrics of the API",
    example: `fetch('https://demo-api.watchstat.us/metrics')
.then(response => response.json())
.then(data => console.log(data));`,
  },
  {
    name: "Get All Monitors",
    path: "/api/monitors",
    method: "GET",
    description: "Retrieve the current status of all monitored services",
    example: `fetch('https://demo-api.watchstat.us/api/monitors')
.then(response => response.json())
.then(data => console.log(data));`,
  },
  {
    name: "Get Monitor Details",
    path: "/api/monitor/{page_id}/{monitor_id}",
    method: "GET",
    description:
      "Get more detailed information than official API about a specific service with the Uptime Robots Page API",
    example: `fetch('https://demo-api.watchstat.us/api/monitor/x5tkeYyJ3g/799396413')
.then(response => response.json())
.then(data => console.log(data));`,
  },
  {
    name: "Get Public Pages",
    path: "/api/public-pages",
    method: "GET",
    description: "Retrieve all public pages data from the UptimeRobot API",
    example: `fetch('https://demo-api.watchstat.us/api/public-pages')
.then(response => response.json())
.then(data => console.log(data));`,
  },
  {
    name: "Get Account Details",
    path: "/api/account-details",
    method: "GET",
    description:
      "Retrieve account details, optionally with privacy settings applied",
    example: `fetch('https://demo-api.watchstat.us/api/account-details')
.then(response => response.json())
.then(data => console.log(data));`,
  },
];

// Render endpoints
function renderEndpoints() {
  const endpointsList = document.getElementById("endpoints-list");
  endpoints.forEach((endpoint) => {
    const endpointElement = document.createElement("div");
    endpointElement.className = "border border-gray-200 rounded-lg p-6 mb-6";

    // Create a safe ID from the path
    const safeId = endpoint.path.replace(/[/{}}]/g, "-");

    endpointElement.innerHTML = `
      <h3 class="text-xl font-semibold mb-2">${endpoint.name}</h3>
      <div class="bg-gray-100 text-sm px-3 py-1 rounded inline-block mb-2">
        <span class="text-purple-600 font-semibold">${endpoint.method}</span> ${endpoint.path}
      </div>
      <p class="text-gray-600 mb-4">${endpoint.description}</p>

      <div class="bg-[#2d2d2d] rounded-lg p-4 mb-4">
        <pre><code class="language-javascript">${endpoint.example}</code></pre>
      </div>

      <button
        onclick="testEndpoint('${endpoint.path}')"
        class="bg-purple-600 hover:bg-purple-700 text-white rounded-md px-4 py-2 text-sm flex items-center"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          class="h-4 w-4 mr-2" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2" 
          stroke-linecap="round" 
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <polygon points="10 8 16 12 10 16 10 8"></polygon>
        </svg>
        Test Endpoint
      </button>
      
      <div id="response-${safeId}" class="mt-4 hidden">
        <h4 class="text-sm font-semibold mb-2 text-gray-700">Response:</h4>
        <pre class="bg-[#2d2d2d] rounded-lg p-4 overflow-auto"><code class="language-json"></code></pre>
      </div>
    `;
    endpointsList.appendChild(endpointElement);
  });

  // Apply Prism highlighting to all code blocks
  if (typeof Prism !== "undefined") {
    Prism.highlightAll();
  } else {
    console.warn(
      "Prism is not defined. Code highlighting will not be applied."
    );
  }
}

// Test endpoint function
async function testEndpoint(path) {
  const safeId = path.replace(/[/{}}]/g, "-");
  const responseId = `response-${safeId}`;
  const responseElement = document.getElementById(responseId);
  const codeElement = responseElement.querySelector("code");

  responseElement.classList.remove("hidden");
  codeElement.textContent = "Loading...";

  try {
    // Replace path parameters with actual values
    const actualPath = path
      .replace("{page_id}", "x5tkeYyJ3g")
      .replace("{monitor_id}", "799396413");

    const response = await fetch(`https://demo-api.watchstat.us${actualPath}`);
    const data = await response.json();
    codeElement.textContent = JSON.stringify(data, null, 2);

    // Apply Prism highlighting to the response
    if (typeof Prism !== "undefined") {
      Prism.highlightElement(codeElement);
    } else {
      console.warn(
        "Prism is not defined. Code highlighting will not be applied."
      );
    }
  } catch (error) {
    codeElement.textContent = `Error fetching data: ${error.message}`;
  }
}

// Initialize the page when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  renderEndpoints();
});
