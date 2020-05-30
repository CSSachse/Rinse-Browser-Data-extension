export const contentTypes = [
	'cookies',
	'localStorage',
	'sessionStorage',
	'cacheStorage',
	'serviceWorker',
	'iframe',
	'javascript',
	'cache',
];

export const contentTypeNameMap = {
	cookies: browser.i18n.getMessage('ContentLabel_Cookies'),
	localStorage: browser.i18n.getMessage('ContentLabel_LocalStorage'),
	sessionStorage: browser.i18n.getMessage('ContentLabel_SessionStorage'),
	cacheStorage: browser.i18n.getMessage('ContentLabel_CacheStorage'),
	serviceWorker: browser.i18n.getMessage('ContentLabel_ServiceWorker'),
	iframe: browser.i18n.getMessage('ContentLabel_Iframe'),
	javascript: browser.i18n.getMessage('ContentLabel_Javascript'),
	cache: browser.i18n.getMessage('ContentLabel_Cache'),
};
