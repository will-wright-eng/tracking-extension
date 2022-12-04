# tracking-extension

## archetecture

- `background.js`: split code into logical groupings
    - startup & user profiling: send system data along with userid upon startup so as to decrease message size and process time
    - listeners & UI events: might split these into individual modules but they work together for now
- popup: js/html/css
    - add popup.html headers for easy access to homepage, useid (copy), and manual control over feature toggles
- `content-script.js`: grab text from page when tagged (will need join keys if message is being sent separately... not ideal, try to send async so that the tag, page info, and content are bundled into single message)

## publish extension

- <https://developer.chrome.com/docs/webstore/publish/>
- [github actions](https://github.com/marketplace?type=actions&query=Chrome+extension+upload+action+)
    - [anther one](https://github.com/marketplace/actions/chrome-extension-upload-action)
- setup and create developer account
- publish hello world extension
- publish tracking-extension manually
- automate tracking-extension publish via github actions

> before publishing I need to create a homepage that allows for the api address to be manually entered in (along with storage of the url within sync.storage, like the usesr token)

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
- <https://developer.chrome.com/docs/extensions/reference/webNavigation/#event-onTabReplaced>

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
- <https://github.com/GoogleChrome/chrome-extensions-samples>


## publish extension

[Publish in the Chrome Web Store](https://developer.chrome.com/docs/webstore/publish/)

### GitHub Actions

1. <https://github.com/marketplace/actions/chrome-extension-upload-action>
2. <https://github.com/marketplace/actions/chrome-extension-upload-publish>

[*example*](https://github.com/fahad-israr/browser-extension-for-starfix/blob/a58f0ae376519ed3a2a94bf7010d3cb254e80e89/.github/workflows/browser-extension-release-chrome-webstore.yml)

```yaml
name: "Browser-Extension-Release-Chrome-Webstore"
on:
  push:
    branches:
      - master
    paths:
      - 'browser-extension/**'
  release:
    types: [created]

jobs:
  chrome-extension:
    name: "zip-files"
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: papeloto/action-zip@v1
        with:
          files: browser-extension/
          dest: starfix-extension-chrome.zip

      - name: "Upload Artifact"
        uses: actions/upload-artifact@v1
        with:
          name: starfix-extension-chrome.zip
          path: ${{ github.workspace }}/starfix-extension-chrome.zip

      - name: "publish extension on chrome webstore"
        uses: Klemensas/chrome-extension-upload-action@master
        with:
          refresh-token: ${{ secrets.GOOGLE_CHROME_REFRESH_TOKEN }}
          client-id: ${{ secrets.GOOGLE_CHROME_CLIENT_ID }}
          file-name: starfix-extension-chrome.zip
          app-id: 'ojlhpgekmmemhihkigibkhehlejkjdmo'
          publish : true
```
