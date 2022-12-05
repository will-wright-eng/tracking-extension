// This is the service worker script, which executes in its own context
// when the extension is installed or refreshed (or when you access its console).
// It would correspond to the background script in chrome extensions v2.

console.log('This prints to the console of the service worker (background script)');

// Importing and using functionality from external files is also possible.
// Note: not compatible when content scripts are configured as modules in manifest.json, ie:
// import customFunction from './service-worker-utils.js';
importScripts('service-worker-utils.js');

// If you want to import a file that is deeper in the file hierarchy of your
// extension, simply do `importScripts('path/to/file.js')`.
// The path should be relative to the file `manifest.json`.
