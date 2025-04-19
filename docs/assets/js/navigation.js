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

// Event listeners for buttons
btnEndpoints.addEventListener("click", () => {
  updateActiveButton(btnEndpoints);
  showContent(endpointsContent);
});

btnInstallation.addEventListener("click", () => {
  updateActiveButton(btnInstallation);
  showContent(installationContent);
});

btnError.addEventListener("click", () => {
  updateActiveButton(btnError);
  showContent(errorContent);
});

btnLimits.addEventListener("click", () => {
  updateActiveButton(btnLimits);
  showContent(limitsContent);
});

console.log("Navigation script loaded successfully.");
