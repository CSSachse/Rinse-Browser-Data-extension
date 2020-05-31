# README
This is a (currently Firefox only, may add Chromium support soon) browser extension that hopefully makes it easier to track and clear browser data (and some other potentially annoying features).

You can *clear* or *disable/destabilize*, for any individual hostname:
* Cookies
* Local Storage
* Session Storage
* Cache Storage
* Service Workers
* IFrames
* Scripts
* Cache

Notice that for most of these, full disablement is not possible through an extension, so our compromise is to simply clear the features selected as disabled whenever you open/close the hostname

# Code
The frontend for the browser action is written/compiled from Svelte (definitely overkill, but learning svelte was on my bucket list anyway so shush). It is stored in `/src`, and output to `/public/build`.

The actual business logic for clearing browser data is running in `background.js`

## Building and running

To create an optimised version of the app:

```bash
npm run build
```

```bash
yarn build
```