import getApiInfo from './secret.js';

const apiInfo = getApiInfo();

function gotPlatformInfo(info) {
  const platInfo = {
    info_os: info.os,
    info_arch: info.arch,
  };
  return platInfo;
}

function getAllStorageSyncData() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(null, (items) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve(items);
    });
  });
}

async function addSysData(payload) {
  const gettingInfo = chrome.runtime.getPlatformInfo(); // promise
  const platInfo = await gettingInfo.then(gotPlatformInfo); // json

  const manInfo = chrome.runtime.getManifest();
  const manVersion = {
    manifest_version: manInfo.version,
    manifest_name: manInfo.name,
  }; // json

  const storedData = await getAllStorageSyncData(); // promise
  const userId = {info_user_id: storedData.userid}; // json

  const ts = new Date().toISOString();
  const timestamp = {created_timestamp: ts};

  // combine objects
  const sysData = Object.assign(
      {},
      platInfo,
      manVersion,
      userId,
      payload,
      timestamp,
  );
  return sysData;
}

function makeid(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for ( let i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function buildUrl(jsonData) {
  const bucket = 'bucket='+apiInfo.bucket;
  const objName = [
    'event_',
    jsonData.created_timestamp,
    '-',
    makeid(5),
    '.json',
  ].join('');
  const key = [
    'key='+jsonData.manifest_name.toLowerCase().replace(' ', '-'),
    'dev',
    jsonData.manifest_version,
    jsonData.info_user_id,
    objName,
  ].join('/');
  const portmanteau = apiInfo.portmanteau;
  const url = [portmanteau, '?', bucket, '&', key].join('');
  console.log(url);
  return url;
}

async function postUrl(jsonData) {
  const finalData = await addSysData(jsonData);
  const payload = JSON.stringify(finalData);
  fetch(buildUrl(finalData), {
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: payload,
  })
      .then((response) => {
        if (!response.ok) throw new Error(response.status);
      })
      .then((data) => {
      })
      .catch((error) => {
        console.log('error: ' + error);
      });
}

// bug: fires multiple times for each iframe in page
chrome.tabs.onUpdated.addListener( async (tabId, changeInfo, tab) => {
  const url = tab.url;
  if (url !== undefined && changeInfo.status == 'complete') {
    const jsonData = {
      tab_event: 'chrome.tabs.onUpdated',
      tab_url: tab.url,
      tab_id: tabId,
      tab_title: tab.title,
      tab_window_id: tab.windowId,
    };
    postUrl(jsonData);
  }
});

chrome.tabs.onRemoved.addListener( async (tabId, removeInfo) => {
  const jsonData = {
    tab_event: 'chrome.tabs.onRemoved',
    tab_id: tabId,
    tab_window_id: removeInfo.windowId,
  };
  postUrl(jsonData);
});

// tagging mechanism
chrome.runtime.onMessage.addListener(
    async (request, sender, sendResponse) => {
      sendResponse({farewell: 'goodbye'});

      const tab = await chrome.tabs.get(request.tabId);
      const tag = request.tag;

      const jsonData = {
        tab_event: 'chrome.runtime.onMessage',
        tab_url: tab.url,
        tab_id: tab.id,
        tab_title: tab.title,
        tab_windowId: tab.windowId,
        manual_tag: tag,
      };
      postUrl(jsonData);
    },
);

function getRandomToken() {
  const randomPool = new Uint8Array(32);
  crypto.getRandomValues(randomPool);
  let hex = '';
  for (let i = 0; i < randomPool.length; ++i) {
    hex += randomPool[i].toString(10);
  }
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
    const userid = items.userid;
    if (userid) {
      console.log('token exists');
    } else {
      console.log('creating userid token');
      createNewUserToken(userid);
    }
  });
});
