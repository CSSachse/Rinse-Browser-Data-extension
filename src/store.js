'use strict';

import { writable } from 'svelte/store';
import { contentTypes } from './contentTypes.js';
const storage = browser.storage.local;

const generateInitialMap = (initialValue) => {
	const map = {};
	contentTypes.forEach(contentType => map[contentType] = initialValue);
	return map;
}

export const getUrl = async () => {
	try { return (await browser.tabs.executeScript({ code: 'window.location.href;' }))[0]; }
	catch { return ''; }
};

export const getDisablementSettings = async (hostname) => (await storage.get(hostname))[hostname] || {}

export const contentTypeDisabledMap = (() => {
	const initialMap = generateInitialMap(false);
	const { subscribe, set } = writable(initialMap);
	const refresh = () => getUrl()
		.then(url => getDisablementSettings(new URL(url).hostname))
		.catch(() => initialMap)
		.then(set);
	refresh();
	return { subscribe, refresh };
})()

export const contentTypeCountMap = (() => {
	const initialMap = generateInitialMap(0);
	const { subscribe, set } = writable(initialMap);
	const refresh = () => {
		getUrl()
			.then(url => extractContentCounts(url))
			.catch(() => initialMap)
			.then(set);
	};
	refresh();
	return { subscribe, refresh };
})()

const extractContentCounts = async url => {
	const extract = JSON.parse(
		await browser.tabs.executeScript({
			code: `
        JSON.stringify({
          javascript: Array.from(document.getElementsByTagName("script")),
          iframe: Array.from(document.getElementsByTagName("iframe")),
          localStorage,
          sessionStorage,
        });`}));

	// Run separately because caches.keys() is async
	const cacheStorageExtract = (await browser.tabs.executeScript({
		code: `caches.keys();`
	}))[0];
	// Run separately because serviceWorker.getRegistrations() is async
	const serviceWorkerExtract = (await browser.tabs.executeScript({
		code: `navigator.serviceWorker.getRegistrations().then(
      registration => registration.map(
        sw => sw.active && sw.active.scriptURL
      )
    );`
	}))[0];
	// Run separately to include http-only cookies
	const cookiesExtract = await browser.cookies.getAll({ url });

	return {
		cookies: cookiesExtract.length,
		localStorage: Object.keys(extract.localStorage).length,
		sessionStorage: Object.keys(extract.sessionStorage).length,
		cacheStorage: cacheStorageExtract.length,
		serviceWorker: serviceWorkerExtract.length,
		iframe: extract.iframe.length,
		javascript: extract.javascript.length,
		cache: 0,
	};
}

export const sendClearEvent = (url, type) =>
	browser.runtime.sendMessage({ method: 'clear', url, type });

export const sendDisablementEvent = (hostname, type, disablementSettings, isDisabled) =>
	browser.runtime.sendMessage({
		method: 'updateDisablementSettings',
		hostname,
		settings: { ...disablementSettings, [type]: !isDisabled },
	});
