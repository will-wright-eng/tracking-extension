function postUrl(payload) {
    fetch('http://127.0.0.1:8000/acceptdata', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: payload
    })
    .then((response) => {
        console.log('response: '+ response.status.toString());
        if(!response.ok) throw new Error(response.status);
        else return response.json();
    })
    .then((data) => {
    // this.setState({ isLoading: false, downlines: data.response });
    console.log("DATA STORED");
    })
    .catch((error) => {
    console.log('error: ' + error);
    // this.setState({ requestFailed: true });
    });
}

chrome.tabs.onUpdated.addListener( async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    console.log("--- onUpdated ---");
    console.log("tab url - "+tab.url);
    console.log("tabId - "+tabId);
    console.log("tab title - "+tab.title)
    console.log("tab windowId - "+tab.windowId)

    let payload = JSON.stringify({
        event: "chrome.tabs.onUpdated",
        tab_url: tab.url,
        tabId: tabId,
        tab_title: tab.title,
        tab_windowId: tab.windowId
    });
    postUrl(payload);
  }
});

chrome.tabs.onRemoved.addListener( async (tabId, removeInfo) => {
    console.log("--- onRemoved ---");
    console.log("tabId - "+tabId);
    console.log("windowId - "+removeInfo.windowId);
    let payload = JSON.stringify({
        event: "chrome.tabs.onRemoved",
        tabId: tabId,
        windowId: removeInfo.windowId
    });
    postUrl(payload);
});

chrome.runtime.onMessage.addListener(
  async (request, sender, sendResponse) => {
    sendResponse({farewell: "goodbye"});

    let tab = await chrome.tabs.get(request.tabId);
    console.log("--- extension ---");
    console.log("tab url - "+tab.url); 
    console.log("tabId - "+tab.id);
    console.log("tab title - "+tab.title);
    console.log("tab windowId - "+tab.windowId);

    let tag = request.tag;
    console.log("tag - "+tag);

    let payload = JSON.stringify({
        event: "chrome.runtime.onMessage",
        tab_url: tab.url,
        tabId: tab.id,
        tab_title: tab.title,
        tab_windowId: tab.windowId,
        tag: tag
    });
    console.log(payload);
    postUrl(payload);
  }
);