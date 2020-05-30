'use strict';
const storage = browser.storage.local;

/**
 * --------------------------------------------------------------------------
 * Section: Listeners for browser events
 * --------------------------------------------------------------------------
 */

browser.runtime.onMessage.addListener(event => {
  switch (event.method) {
    case 'clear': return clearBrowsingData(event.url, event.type);
    case 'updateDisablementSettings': return updateDisablementSettings(event.hostname, event.settings);
  }
});

browser.webRequest.onHeadersReceived.addListener(
  details => processWebRequest(details),
  {
    urls: ['<all_urls>'],
    types: ['main_frame', 'sub_frame'],
  },
  ['blocking', 'responseHeaders']
);

const tabIdUrlMap = {};
browser.tabs.onUpdated.addListener(
  (tabId, _, tab) => handlePageEnter(tabId, tab));

browser.tabs.onRemoved.addListener(
  tabId => handlePageClose(tabId)
);

/**
 * --------------------------------------------------------------------------
 * Section: Handlers for browser events and browser actions
 * --------------------------------------------------------------------------
 */

const processWebRequest = async details => {
  const isIframe = !!details.frameId;
  const topLevelUrl = isIframe ? details.frameAncestors[details.frameAncestors.length - 1].url : details.url;
  const { hostname } = new URL(topLevelUrl);
  let { responseHeaders } = details;
  const disablementSettings = (await storage.get(hostname))[hostname] || {};

  if (disablementSettings.javascript) {
    responseHeaders.push({
      name: 'Content-Security-Policy',
      value: "script-src 'none';"
    });
  }

  return {
    responseHeaders,
    cancel: disablementSettings.iframe && isIframe,
  };

};

const handlePageEnter = async (tabId, tab) => {
  if (tabIdUrlMap[tabId]) { await handlePageClose(tabId); }
  if (!tab) { return; }
  const { hostname } = new URL(tab.url);
  const settings = (await storage.get(hostname))[hostname] || {};
  if (settings.sessionStorage) { await clearBrowsingData(tab.url, 'sessionStorage'); }
  if (settings.cacheStorage) { await clearBrowsingData(tab.url, 'cacheStorage'); }
  if (settings.iframe) { await clearBrowsingData(tab.url, 'iframe'); }
  if (settings.serviceWorker) { await clearBrowsingData(tab.url, 'serviceWorker'); }
  tabIdUrlMap[tab.id] = tab.url;
}

const handlePageClose = async tabId => {
  const previousUrl = tabIdUrlMap[tabId];
  const { hostname } = new URL(previousUrl);
  const settings = (await storage.get(hostname))[hostname] || {};
  if (settings.cookies) { await clearBrowsingData(previousUrl, 'cookies'); }
  if (settings.localStorage) { await clearBrowsingData(previousUrl, 'localStorage'); }
  if (settings.cache) { await clearBrowsingData(previousUrl, 'cache'); }
  delete tabIdUrlMap[tabId];
}



const updateDisablementSettings = async (hostname, settings) => {
  await storage.set({ [hostname]: settings });
  const tabs = await browser.tabs.query({ url: `*://*.${hostname}/*` });
  return Promise.all(tabs.map(tab => browser.tabs.reload(tab.id)));
}




/**
 * --------------------------------------------------------------------------
 * Section: Logic for clearing various datatypes
 * --------------------------------------------------------------------------
 */

const clearBasicData = (hostname, type) => {
  browser.browsingData.remove(
    { hostnames: [hostname] },
    { [type]: true });
};

const clearCookies = url =>
  browser.cookies.getAll({ url })
    .then(cookieList => Promise.all(
      cookieList
        .map(cookie =>
          browser.cookies.remove({ url, name: cookie.name }))));

const clearSessionStorage = tabs =>
  tabs.forEach(tab =>
    browser.tabs.executeScript(tab.id, { code: 'sessionStorage.clear();' })
  );

const clearCacheStorage = async tabs => {
  const tabId = tabs[0].id;
  const keys = (await browser.tabs.executeScript(tabId, { code: "caches.keys();" }))[0];
  return Promise.all(keys.map(key => browser.tabs.executeScript(tabId,
    { code: `caches.delete("${key}");` }
  )));
};

const clearIframe = tabs => Promise.all(
  tabs.map(tab =>
    browser.tabs.executeScript(tab.id, {
      code:
        `Array.from(document.getElementsByTagName("iframe"))
        .forEach(iframe => iframe.replaceWith(''));`
    })));

const clearServiceWorker = tabs => Promise.all(
  tabs.map(tab => browser.tabs.executeScript(tab.id, {
    code:
      `navigator.serviceWorker.getRegistrations().then(
        registrations => Promise.all(
          registrations.map(
            sw => sw.unregister()
          )))`
  })));

const pauseJavascript = tabs => Promise.all(
  tabs.map(tab => browser.tabs.executeScript(tab.id, {
    code: `debugger;`
  })));

const clearBrowsingData = async (url, type) => {
  const { hostname } = new URL(url);
  console.log(`Clearing ${type} from ${hostname}`);
  const tabs = await browser.tabs.query({ url: `*://*.${hostname}/*` });

  switch (type) {
    case 'sessionStorage': return clearSessionStorage(tabs);
    case 'cookies': return clearCookies(url);
    case 'cacheStorage': return clearCacheStorage(tabs);
    case 'iframe': return clearIframe(tabs);
    case 'serviceWorker': return clearServiceWorker(tabs);
    case 'javascript': return pauseJavascript(tabs);
    default: return clearBasicData(hostname, type);
  }
};
