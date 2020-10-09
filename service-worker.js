/*
Service workers are initialized prior to the window being created therefore we use the 'self' keyword to refernece the service worker
*/


//Define the files we'd like to cache in the service worker
/*
Every browser has a cache limit, which can range anywhere from 50 MB to 250 MB. We've prioritized caching the JavaScript and HTML files so that the site is at least functional.
*/
const FILES_TO_CACHE = [
    "./index.html",
    "./events.html",
    "./tickets.html",
    "./schedule.html",
    "./assets/css/style.css",
    "./assets/css/bootstrap.css",
    "./assets/css/tickets.css",
    "./dist/app.bundle.js",
    "./dist/events.bundle.js",
    "./dist/tickets.bundle.js",
    "./dist/schedule.bundle.js"
];
const APP_PREFIX = 'FoodFest-';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

self.addEventListener('install', function (e) {
    //Installation
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('installing cache : ' + CACHE_NAME)
            return cache.addAll(FILES_TO_CACHE)
        })
    );

})
// Activation
self.addEventListener('activate', function (e) {
    e.waitUntil(
        // .keys() returns an array of all cache names, which we're calling keyList.
        caches.keys().then(function (keyList) {
            let cacheKeeplist = keyList.filter(function (key) {
                return key.indexOf(APP_PREFIX);
            })
            // we set up CACHE_NAME as a global constant to help keep track of which cache to use.
            cacheKeeplist.push(CACHE_NAME);
            //This last bit of the activate listener returns a Promise that resolves once all old versions of the cache have been deleted.
            return Promise.all(keyList.map(function (key, i) {
                if (cacheKeeplist.indexOf(key) === -1) {
                    console.log('deleting cache : ' + keyList[i]);
                    return caches.delete(keyList[i]);
                }
            }));
        })
    )
});

// Waiting/Idle
//Here, we listen for the fetch event, log the URL of the requested resource, and then begin to define how we will respond to the request.
self.addEventListener('fetch', function (e) {
    console.log('fetch request : ' + e.request.url)
    //e.respondWith will deliver the resource directly from the cache; otherwise the resource will be retrieved normally.
    e.respondWith(
        //First, we use .match() to determine if the resource already exists in caches. If it does, we'll log the URL to the console with a message and then return the cached resource, using the following code:
        caches.match(e.request).then(function (request) {
            if (request) {
                console.log('responding with cache : ' + e.request.url)
                return request
            } else {
                //Next, if the resource is not in caches, we allow the resource to be retrieved from the online network as usual, using the following code:
                console.log('file is not cached, fetching : ' + e.request.url)
                return fetch(e.request)
            }

            // You can omit if/else for console.log & put one line below like this too.
            // return request || fetch(e.request)
        })
    )
})