// Colors mapped to CSS classes for highlights
const colorClasses = {
  yellow: 'highlight-yellow',
  pink: 'highlight-pink',
  blue: 'highlight-blue',
  green: 'highlight-green',
  orange: 'highlight-orange',
  purple: 'highlight-purple'
};

// Listen for messages from background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "highlight") {
    console.log("Received highlight request:", message);
    applyHighlight(message.color, message.text, message.url);
  }
});

// Apply a CSS-based highlight and store it in chrome storage
function applyHighlight(color, text, url) {
  const selection = window.getSelection();

  if (!selection.rangeCount || !selection.toString().trim()) {
    console.warn("No valid text selected for highlighting.");
    return;
  }

  const selectedText = selection.toString().trim();
  const range = selection.getRangeAt(0);

  // Verify the selected text matches
  if (selectedText !== text) {
    console.warn("Selected text does not match.");
    return;
  }

  // Wrap text in a span with the CSS class and data attribute
  const span = document.createElement("span");
  span.className = colorClasses[color];
  span.setAttribute("data-highlight", color);
  span.textContent = selectedText;

  range.deleteContents();
  range.insertNode(span);
  selection.removeAllRanges();

  const quote = {
    text: selectedText,
    color: color,
    url: url,
    title: document.title,
    timestamp: Date.now(),
    comment: ''
  };
  saveQuote(quote);
}

// Save the highlight data to chrome storage
function saveQuote(quote) {
  chrome.storage.local.get({ quotes: [] }, (result) => {
    const quotes = result.quotes;
    quotes.push(quote);
    chrome.storage.local.set({ quotes }, () => {
      console.log("Highlight saved to storage:", quote);
    });
  });
}

// Load highlights from storage and apply CSS-based highlights
function loadHighlights() {
  chrome.storage.local.get({ quotes: [] }, (result) => {
    const quotes = result.quotes.filter(q => q.url === window.location.href);
    quotes.forEach((quote) => {
      applyHighlightFromStorage(quote.text, quote.color);
    });
  });
}

// Apply stored highlights using CSS classes
function applyHighlightFromStorage(text, color) {
  const bodyTextNodes = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
  let found = false;

  while (bodyTextNodes.nextNode()) {
    const node = bodyTextNodes.currentNode;
    const matchIndex = node.nodeValue.indexOf(text);

    if (matchIndex !== -1) {
      found = true;

      // Create a range to wrap the matched text
      const range = document.createRange();
      range.setStart(node, matchIndex);
      range.setEnd(node, matchIndex + text.length);

      const span = document.createElement("span");
      span.className = colorClasses[color];
      span.setAttribute("data-highlight", color);
      span.textContent = text;

      range.deleteContents();
      range.insertNode(span);
      break;
    }
  }

  if (!found) {
    console.warn(`Could not find exact match for "${text}" to apply highlight.`);
  }
}

// Load highlights on page load
loadHighlights();
