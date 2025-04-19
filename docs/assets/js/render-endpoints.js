// Render endpoints
function renderEndpoints() {
  const endpointsList = document.getElementById("endpoints-list");
  endpointsList.innerHTML = ""; // Vider la liste avant de la remplir

  endpoints.forEach((endpoint) => {
    const endpointElement = document.createElement("div");
    endpointElement.className = "bg-dark-card rounded-lg p-6 mb-6";

    // Add a number of endpoint in the id count-endpoints
    const endpointCount =
      document.querySelectorAll("#endpoints-list > div").length + 1;
    document.getElementById("count-endpoints").innerText = endpoints.length;

    // Create a safe ID from the path
    const safeId = endpoint.path.replace(/[/{}}]/g, "-");

    endpointElement.innerHTML = `
              <h3 class="text-xl font-semibold mb-2 text-white">${
                endpoint.name
              }</h3>
              <div class="bg-dark px-3 py-1 rounded inline-block mb-2">
                  <span class="text-purple font-semibold">${
                    endpoint.method
                  }</span> <span class="text-gray-300">${endpoint.path}</span>
              </div>
              <p class="text-gray-400">${endpoint.description}</p>

              <div class="bg-dark-card rounded-lg p-2 mb-2">
                  <pre><code class="language-javascript">fetch('https://demo-api.watchstat.us${endpoint.path
                    .replace("{page_id}", "x5tkeYyJ3g")
                    .replace("{monitor_id}", "799396413")}')
                  .then(response => response.json())
                  .then(data => console.log(data));
                  </code></pre>
              </div>

              <button
                  onclick="testEndpoint('${endpoint.path}')"
                  class="bg-purple hover:bg-purple-700 text-white rounded-md px-4 py-2 text-sm flex items-center"
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
                  <h4 class="text-sm font-semibold mb-2 text-gray-300">Response:</h4>
                  <pre class="bg-dark rounded-lg p-4 overflow-auto max-h-60"><code class="language-json"></code></pre>
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
      .replace("{pageId}", "x5tkeYyJ3g")
      .replace("{monitorId}", "799396413");

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

console.log("Render endpoints script loaded successfully.");
