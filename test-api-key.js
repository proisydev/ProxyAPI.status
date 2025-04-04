import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

// Remplacez par votre clé API
const API_KEY = process.env.UPTIME_ROBOT_API_KEY;

async function testApiKey() {
  console.log("Testing UptimeRobot API key...");

  if (!API_KEY) {
    console.error("API key is not defined in environment variables");
    return;
  }

  console.log(`API key length: ${API_KEY.length}`);
  console.log(`First 4 chars: ${API_KEY.substring(0, 4)}...`);

  try {
    // Test avec format u (utilisé dans certaines versions de l'API)
    const response1 = await fetch(
      "https://api.uptimerobot.com/v2/getMonitors",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: API_KEY,
          format: "json",
        }),
      }
    );

    const data1 = await response1.json();
    console.log("Response with standard format:");
    console.log(data1);

    // Test avec format différent (au cas où)
    const response2 = await fetch(
      "https://api.uptimerobot.com/v2/getMonitors",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: `${API_KEY}`, // Certaines API UptimeRobot nécessitent un préfixe 'u'
          format: "json",
        }),
      }
    );

    const data2 = await response2.json();
    console.log('Response with "u" prefix:');
    console.log(data2);
  } catch (error) {
    console.error("Error testing API key:", error);
  }
}

testApiKey();
