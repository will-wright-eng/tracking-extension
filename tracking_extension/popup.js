const form = document.getElementById("popup-form");
const go = document.getElementById("go");
const message = document.getElementById("message");

// var port = chrome.extension.connect({
//     name: "Sample Communication"
// });

// port.postMessage("Hi BackGround");
// port.onMessage.addListener(function(msg) {
//     console.log("message recieved" + msg);
// });

form.addEventListener("submit", handleFormSubmit);

async function handleFormSubmit(event) {
  let tagName = input.value
  console.log("Tag submitted: " + tagName)
  event.preventDefault();

  // clearMessage();
  setMessage("Submitted: " + tagName);
  form.reset()

  let tabs = await chrome.tabs.query({active: true, currentWindow: true});
  console.log(tabs)
  // chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
  chrome.runtime.sendMessage({tag: tagName, tabId: tabs[0].id}, function(response) {
    console.log("sent hello...")
    // console.log(response.farewell);
  });

  console.log("form submitted")
  
}

function setMessage(str) {
  message.textContent = str;
  message.hidden = false;
}

function clearMessage() {
  message.hidden = true;
  message.textContent = "";
}

chrome.action.onClicked.addListener(() => {
    postUrl();
});