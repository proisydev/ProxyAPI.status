// Function to copy code to clipboard
function copyCode(button) {
  const pre = button.previousElementSibling;
  const code = pre.textContent;

  navigator.clipboard.writeText(code).then(() => {
    const originalText = button.textContent;
    button.textContent = "Copied!";
    button.style.backgroundColor = "rgba(139, 92, 246, 0.3)";

    setTimeout(() => {
      button.textContent = originalText;
      button.style.backgroundColor = "rgba(17, 24, 39, 0.8)";
    }, 2000);
  });
}
