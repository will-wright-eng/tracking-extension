# tracking-extension

## todo
- as es linter check
- keyboard shortcut to auto-tag with default string
	- checkbox to set default tag string
- header to popup
	- home
	- user id (copy text)


### onInstalled

```js
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
```

### thoughts on building edges for navigation graph
- new listeners
- https://developer.chrome.com/docs/extensions/reference/webNavigation/#event-onTabReplaced
- webNav events give details on where you're going but not where you've been
```js
chrome.webNavigation.onBeforeNavigate.addListener( async (details) => {
    console.log('-- onBeforeNavigate --');
    console.log(details);
});

chrome.webNavigation.onCommitted.addListener( async (details) => {
    console.log('-- onCommitted --');
    if (details.transitionType == 'link') {
        // console.log(details);
        console.log(details.tabId);
        
        const tab = await chrome.tabs.get(details.tabId);
        console.log(tab)
        console.log(tab.url)

        console.log(details.transitionType);
        console.log(details.url);        
    }
});

chrome.webNavigation.onCompleted.addListener( async (details) => {
    console.log('-- onCompleted --');
    console.log(details);
});
```

what I need are a set of navigation events that define node and edges
- navigate to page, between pages, by link, reload, back/forward
- set of ingress and egress events
- how to define an edge? --> two urls with some kind of way of connecting the two
- two events tied together by (primary keys) time sequence, tabId, tabWindowId, etc -- other key identifiers

- what are the boundry conditions of a session? since navigation happens between windows and tabs, it can't be bound by those ids
- session: defines a set of events
- node: url or site visited
- edge: 
    - nav within a tab
    - nav within a window
    - proximity in time
    - related site content
    - embedded links (webNav.onCommitted)
    - Omnibox search/ search engine query
