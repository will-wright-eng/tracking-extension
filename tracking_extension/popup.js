const form = document.getElementById('popup-form');
const message = document.getElementById('message');

form.addEventListener('submit', handleFormSubmit);

async function handleFormSubmit(event) {
  const tagName = input.value;
  event.preventDefault();

  setMessage('Submitted: ' + tagName);
  form.reset();

  const tabs = await chrome.tabs.query({active: true, currentWindow: true});
  chrome.runtime.sendMessage(
      {
        tag: tagName,
        tabId: tabs[0].id,
      }, function(response) {
        console.log('sent hello...');
      });

  console.log('form submitted');
}

function setMessage(str) {
  message.textContent = str;
  message.hidden = false;
}

chrome.action.onClicked.addListener(() => {
  postUrl();
});
