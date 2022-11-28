import getApiInfo from './secret.js';

const apiInfo = getApiInfo();

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
  const manInfo = chrome.runtime.getManifest();
  const manVersion = {
    manifest_version: manInfo.version,
    manifest_name: manInfo.name,
    manifest_desc:manInfo.description,
  }; // json

  const storedData = await getAllStorageSyncData(); // promise
  const userId = {info_user_id: storedData.userid}; // json

  const ts = new Date().toISOString();
  const timestamp = {created_timestamp: ts};

  // combine objects
  const sysData = Object.assign({}, manVersion, userId, payload, timestamp);
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
  const objName = ['event_', jsonData.created_timestamp, '-', makeid(5), '.json'].join('');
  const key = [
    'key='+jsonData.manifest_name.toLowerCase().replace(" ","-"),
    jsonData.manifest_desc,
    jsonData.manifest_version.split(".").slice(0,2).join("."),
    jsonData.info_user_id,
    objName
  ].join('/');
  const portmanteau = apiInfo.portmanteau;
  const url = [portmanteau, '?', bucket, '&', key].join('');
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
        console.log('still alive');
      })
      .catch((error) => {
        console.log('error: ' + error);
      });
}

function getRandomToken(length){
    var a = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split("");
    var b = [];
    for (var i=0; i<length; i++) {
        var j = (Math.random() * (a.length-1)).toFixed(0);
        b[i] = a[j];
    }
    return b.join("");
}

function createNewUserToken(userid) {
  userid = getRandomToken(32);
  chrome.storage.sync.set({userid: userid}, function() {
    return userid;
  });
}

export {createNewUserToken, postUrl};
