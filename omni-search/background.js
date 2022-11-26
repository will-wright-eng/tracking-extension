function spawnTabs(text) {
  var urlList = [
    'https://searx.tuxcloud.net/search?q=',
    'https://search.feep.dev/search?q=',
    'https://searchcode.com/?q=',
    'https://duckduckgo.com/?q=',
    'https://grep.app/search?q=',
    // 'https://publicwww.com/search?q='
  ]

  for (let x in urlList) {
    // Encode user input for special characters , / ? : @ & = + $ #
    var newURL = urlList[x] + encodeURIComponent(text);
    console.log(newURL);
    chrome.tabs.create({ url: newURL });
  }
}

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

chrome.omnibox.onInputEntered.addListener( async (text) => {
  const tab = await getCurrentTab();
  spawnTabs(text);
  // close lurking tab used for omni-search
  var resp = await chrome.tabs.remove(tab.id);
  console.log(resp);
});
