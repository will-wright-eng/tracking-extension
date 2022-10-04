import getApiInfo from './secret.js';

var apiInfo = getApiInfo();

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

  let ts = new Date().toISOString();
  var timestamp = {created_timestamp: ts};

  // combine objects
  var sysData = Object.assign({}, platInfo, manVersion, userId, payload, timestamp);
  return sysData;
}

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}
// eg console.log(makeid(5));

function buildUrl(jsonData) {
    let bucket = 'bucket='+apiInfo.bucket;
    let objName = ['event_',jsonData.created_timestamp,'-',makeid(5),'.json'].join('');
    let key = ['key=prod',jsonData.manifest_version,jsonData.info_user_id,objName].join('/');
    let portmanteau = apiInfo.portmanteau
    let url = [portmanteau,'?',bucket,'&',key].join('');
    console.log(url)
    return url;
}

async function postUrl(jsonData) {
    let finalData = await addSysData(jsonData)
    let payload = JSON.stringify(finalData);
    fetch(buildUrl(finalData), {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: payload
    })
    .then((response) => {
        console.log('response: '+ response.status.toString());
        if(!response.ok) throw new Error(response.status);
        else return console.log('all good babby babby...')
    })
    .then((data) => {
    console.log("DATA STORED");
    })
    .catch((error) => {
    console.log('error: ' + error);
    });
}

chrome.tabs.onUpdated.addListener( async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
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
    let tag = request.tag;

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
        return userid;
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
            // setup listener for each new extension update
            // remove repetative data from addSysData and insert only once
            // modify key path to be dev/api-gateway/metadata/<info_user_id>/metadata_<timestamp>.json
            // var newUserId = {info_user_id: createNewUserToken(userid)}
            // postUrl(newUserId);
        }
    });
});
