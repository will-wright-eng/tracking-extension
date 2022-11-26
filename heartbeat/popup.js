async function copyToTheClipboard(textToCopy){
  console.log(textToCopy)
  const el = document.createElement('textarea');
  el.value = textToCopy;
  el.setAttribute('readonly', '');
  el.style.position = 'absolute';
  el.style.left = '-9999px';
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
}

const button = document.querySelector("button");
button.addEventListener("click", async () => {
  const tabs = await chrome.tabs.query({currentWindow: true});
  const tabIds = await tabs.map(({ id }) => id);
  copyToTheClipboard(JSON.stringify(tabs));
});
