import {createNewUserToken, postUrl} from './background-utils.js';

function createAlarm() {
  const alarmName = 'heartbeat';
  chrome.alarms.create(alarmName, {
    delayInMinutes: 0.1,
    periodInMinutes: 1
  });
}

createAlarm();

async function postHeartbeat() {
  const windowsInfo = await chrome.windows.getAll({populate: true});
  const windowsIds = windowsInfo.map(({ id }) => id );
  const tabCounts = windowsInfo.map(({ tabs }) => tabs.length );

  var sum = 0;
  tabCounts.forEach(a => {
    if (typeof a === 'number') {
      sum += a;
    }
  });

  const jsonData = {
    event: 'hearbeat',
    data: windowsInfo,
    metadata: {
      window_count: windowsInfo.length,
      window_ids: windowsIds,
      tab_count: sum,
    }
  };
  postUrl(jsonData);
}

chrome.alarms.onAlarm.addListener(function( alarm ) {
  const ts = new Date().toISOString();
  const timestamp = {timestamp: ts};
  // console.log("Got an alarm!", JSON.stringify(timestamp)); //, alarm
  postHeartbeat();
});

chrome.runtime.onInstalled.addListener(async () => {
  chrome.storage.sync.get('userid', function(items) {
    const userid = items.userid;
    if (userid) {
      console.log('token exists:', String(userid));
    } else {
      console.log('creating userid token');
      createNewUserToken(userid);
    }
  });
});
