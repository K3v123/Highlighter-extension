const colors = {
  yellow: 'rgba(255, 255, 0, 0.2)',
  pink: 'rgba(255, 192, 203, 0.2)',
  blue: 'rgba(173, 216, 230, 0.2)',
  green: 'rgba(144, 238, 144, 0.2)',
  orange: 'rgba(255, 165, 0, 0.2)',
  purple: 'rgba(128, 0, 128, 0.2)'
};

function loadQuotes() {
  chrome.storage.local.get({ quotes: [] }, (result) => {
    const quotesList = document.getElementById('quotes');
    quotesList.innerHTML = ''; // Clear existing list

    if (result.quotes.length === 0) {
      // Display a message when there are no highlights
      const emptyMessage = document.createElement('li');
      emptyMessage.textContent = 'No highlights available';
      emptyMessage.style.fontStyle = 'italic';
      emptyMessage.style.color = '#555';
      quotesList.appendChild(emptyMessage);
      return;
    }

    result.quotes.forEach((quote, index) => {
      const item = document.createElement('li');

      // Title
      const title = document.createElement('h4');
      title.textContent = quote.title || 'Untitled';

      // Highlight text
      const text = document.createElement('div');
      text.className = 'highlight-text';
      text.textContent = `${quote.text} (${quote.color})`;
      text.style.backgroundColor = colors[quote.color];

      // Comment toggle link
      const toggleComment = document.createElement('span');
      toggleComment.textContent = 'Show/Hide Comment';
      toggleComment.style.color = '#007bff';
      toggleComment.style.cursor = 'pointer';
      toggleComment.style.fontSize = '12px';
      toggleComment.style.marginTop = '4px';
      toggleComment.onclick = () => {
        comment.style.display = comment.style.display === 'none' ? 'block' : 'none';
      };

      // Comment section
      const comment = document.createElement('div');
      comment.className = 'comment-section';
      comment.textContent = quote.comment || 'No comment added';

      // Buttons for visiting, editing, and deleting
      const visitButton = createButton('Visit', () => {
        chrome.tabs.create({ url: quote.url }).catch(err => console.error('Failed to open tab:', err));
      });
      const editButton = createButton('Edit Comment', () => addComment(index));
      const deleteButton = createButton('Delete', () => deleteQuote(index));

      // Append elements to the item
      item.appendChild(title);
      item.appendChild(text);
      item.appendChild(toggleComment);
      item.appendChild(comment);
      item.appendChild(visitButton);
      item.appendChild(editButton);
      item.appendChild(deleteButton);

      quotesList.appendChild(item);
    });
  }).catch(err => {
    console.error('Failed to retrieve quotes from storage:', err);
  });
}

function createButton(text, action) {
  const button = document.createElement('button');
  button.textContent = text;
  button.onclick = action;
  return button;
}

function addComment(index) {
  const comment = prompt("Enter your comment:");
  if (comment === null) return; // Cancel if no input
  chrome.storage.local.get({ quotes: [] }, (result) => {
    result.quotes[index].comment = comment;
    chrome.storage.local.set({ quotes: result.quotes }, loadQuotes);
  }).catch(err => {
    console.error('Failed to save comment:', err);
  });
}

function deleteQuote(index) {
  chrome.storage.local.get({ quotes: [] }, (result) => {
    result.quotes.splice(index, 1);
    chrome.storage.local.set({ quotes: result.quotes }, loadQuotes);
  }).catch(err => {
    console.error('Failed to delete quote:', err);
  });
}

document.addEventListener('DOMContentLoaded', loadQuotes);
