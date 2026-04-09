// content_jd.js
// Extracts all visible text from the current page (Job Description).
// Executed via chrome.scripting.executeScript — the return value
// is captured as results[0].result by the caller.
(() => {
  const text = document.body.innerText.replace(/\s+/g, ' ').trim();
  return text;
})();
