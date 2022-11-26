function createAlarm() {
  const alarmName = 'heartbeat';
  chrome.alarms.create(alarmName, {
    delayInMinutes: 0.1,
    periodInMinutes: 1
  });
}

// chrome.runtime.onStartup.addListener(function() {
//   console.log('on launched')
//   createAlarm();
// });

createAlarm();

chrome.alarms.onAlarm.addListener(function( alarm ) {
  console.log("Got an alarm!", alarm);
});
