const colors = ["yellow", "pink", "blue", "green", "orange", "purple"];

// Function to create context menu items
function createContextMenus() {
  colors.forEach((color) => {
    chrome.contextMenus.create({
      id: color,
      title: `Highlight with ${color}`,
      contexts: ["selection"]
    }, () => {
      if (chrome.runtime.lastError) {
        console.error(`Error creating menu item: ${chrome.runtime.lastError.message}`);
      }
    });
  });
}

// Handler function for context menu clicks
function handleMenuClick(info, tab) {
  if (colors.includes(info.menuItemId)) {
    console.log("Context menu clicked", info); // Debug log
    chrome.tabs.sendMessage(tab.id, {
      type: "highlight",
      color: info.menuItemId,
      text: info.selectionText,
      url: tab.url
    });
  }
}

// Set up context menus on installation and startup
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
  createContextMenus();
});

chrome.runtime.onStartup.addListener(() => {
  console.log("Extension started");
  createContextMenus();
});

// Use chrome.contextMenus.onClicked to handle all context menu clicks
chrome.contextMenus.onClicked.addListener(handleMenuClick);
