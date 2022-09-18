function gotPlatformInfo(info) {
  var platInfo = {
    info_os: info.os,
    info_arch: info.arch
  };
  return platInfo;
}

function getAllStorageSyncData() {
  // Immediately return a promise and start asynchronous work
  return new Promise((resolve, reject) => {
    // Asynchronously fetch all data from storage.sync.
    chrome.storage.sync.get(null, (items) => {
      // Pass any observed errors down the promise chain.
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      // Pass the data retrieved from storage down the promise chain.
      resolve(items);
    });
  });
}

async function addSysData(payload) {
  let gettingInfo = chrome.runtime.getPlatformInfo(); // promise
  var platInfo = await gettingInfo.then(gotPlatformInfo); // json

  let manInfo = chrome.runtime.getManifest();
  var manVersion = {manifest_version: manInfo.version}; // json

  let storedData = await getAllStorageSyncData(); // promise
  var userId = {info_user_id: storedData.userid}; // json

  // combine objects
  var sysData = Object.assign({}, platInfo, manVersion, userId, payload);
  console.log(sysData);
  return sysData;
}


async function postUrl(jsonData) {
    let payload = JSON.stringify(await addSysData(jsonData));
    let port = 'http://127.0.'
    let manteau = '0.1:8000/acceptdata'
    fetch(port+manteau, {
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
    // console.log("tab url - "+tab.url);
    // console.log("tabId - "+tabId);
    // console.log("tab title - "+tab.title)
    // console.log("tab windowId - "+tab.windowId)

    let jsonData = {
        tab_event: "chrome.tabs.onUpdated",
        tab_url: tab.url,
        tab_id: tabId,
        tab_title: tab.title,
        tab_window_id: tab.windowId
    };
    postUrl(jsonData);
  }
});

chrome.tabs.onRemoved.addListener( async (tabId, removeInfo) => {
    console.log("--- onRemoved ---");
    // console.log("tabId - "+tabId);
    // console.log("windowId - "+removeInfo.windowId);
    let jsonData = {
        tab_event: "chrome.tabs.onRemoved",
        tab_id: tabId,
        tab_window_id: removeInfo.windowId
    };
    postUrl(jsonData);
});

// tagging mechanism
chrome.runtime.onMessage.addListener(
  async (request, sender, sendResponse) => {
    sendResponse({farewell: "goodbye"});

    let tab = await chrome.tabs.get(request.tabId);
    console.log("--- extension ---");

    let tag = request.tag;
    console.log("tag - "+tag);

    let jsonData = {
        tab_event: "chrome.runtime.onMessage",
        tab_url: tab.url,
        tab_id: tab.id,
        tab_title: tab.title,
        tab_windowId: tab.windowId,
        manual_tag: tag
    };
    postUrl(jsonData);
  }
);


function getRandomToken() {
    // E.g. 8 * 32 = 256 bits token
    var randomPool = new Uint8Array(32);
    crypto.getRandomValues(randomPool);
    var hex = '';
    for (var i = 0; i < randomPool.length; ++i) {
        hex += randomPool[i].toString(16);
    }
    // E.g. db18458e2782b2b77e36769c569e263a53885a9944dd0a861e5064eac16f1a
    return hex;
}

function createNewUserToken(userid) {
    userid = getRandomToken();
    chrome.storage.sync.set({userid: userid}, function() {
    console.log(userid);
    });
}



chrome.runtime.onInstalled.addListener(async () => {
    chrome.storage.sync.get('userid', function(items) {
        var userid = items.userid;
        if (userid) {
            console.log('token exists');
        } else {
            console.log('creating userid token');
            createNewUserToken(userid);
        }
    });
});
