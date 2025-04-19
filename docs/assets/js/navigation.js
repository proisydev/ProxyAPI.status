// Function to update active button styles
function updateActiveButton(activeBtn) {
  // Reset all buttons
  [btnEndpoints, btnError, btnLimits, btnInstallation].forEach((btn) => {
    btn.classList.remove("text-purple");
    btn.classList.add("text-gray-400");
    btn.classList.remove("text-purple-light");
  });

  // Set active button
  activeBtn.classList.remove("text-gray-400");
  activeBtn.classList.add("text-purple-light");
}

// Function to show content
function showContent(contentToShow) {
  // Hide all content sections
  [endpointsContent, errorContent, limitsContent, installationContent].forEach(
    (content) => {
      content.classList.add("hidden");
    }
  );

  // Show selected content
  contentToShow.classList.remove("hidden");
  console.log(
    `Showing content "${contentToShow.id}" successfully.`,
    contentToShow
  );
}

// Function to handle hash-based navigation
function handleHashNavigation() {
  const hash = window.location.hash; // Get the hash from the URL
  switch (hash) {
    case "#endpoints":
      updateActiveButton(btnEndpoints);
      showContent(endpointsContent);
      break;
    case "#installation":
      updateActiveButton(btnInstallation);
      showContent(installationContent);
      break;
    case "#error":
      updateActiveButton(btnError);
      showContent(errorContent);
      break;
    case "#limits":
      updateActiveButton(btnLimits);
      showContent(limitsContent);
      break;
    default:
      // go to add #endpoints to url if no hash is found
      window.location.hash = "#endpoints";
      break;
  }
}

// Event listeners for buttons
btnEndpoints.addEventListener("click", () => {
  updateActiveButton(btnEndpoints);
  showContent(endpointsContent);
  window.location.hash = "endpoints"; // Update the URL hash
});

btnInstallation.addEventListener("click", () => {
  updateActiveButton(btnInstallation);
  showContent(installationContent);
  window.location.hash = "installation"; // Update the URL hash
});

btnError.addEventListener("click", () => {
  updateActiveButton(btnError);
  showContent(errorContent);
  window.location.hash = "error"; // Update the URL hash
});

btnLimits.addEventListener("click", () => {
  updateActiveButton(btnLimits);
  showContent(limitsContent);
  window.location.hash = "limits"; // Update the URL hash
});

// Handle hash navigation on page load
window.addEventListener("load", handleHashNavigation);

// Handle hash changes dynamically
window.addEventListener("hashchange", handleHashNavigation);

console.log("Navigation script loaded successfully.", {
  btnEndpoints,
  btnInstallation,
  btnError,
  btnLimits,
  endpointsContent,
  installationContent,
  errorContent,
  limitsContent,
});
