// This script gets injected into any opened page
// whose URL matches the pattern defined in the manifest
// (see "content_script" key).
// Several foreground scripts can be declared
// and injected into the same or different pages.

console.log("This prints to the console of the page")

chrome.runtime.onSuspend.addListener(() => {
  console.log("Unloading service worker");
});
