var uptodate = true;
importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.0.0/workbox-sw.js');
if (workbox) {
	console.log(`Yay! Workbox is loaded 🎉         -     uptodate :` + uptodate);
  workbox.precaching.precacheAndRoute([
  {
    "url": "index.html",
    "revision": "e786abbb42629a288ae2b1c5b8e747ad"
  },
  {
    "url": "style/main.css",
    "revision": "c21b1d64efe5fa91addbd872b7e5137b"
  },
  {
    "url": "js/main.js",
    "revision": "d699b8ab1e4d91cf6fc201977d00a5f9"
  },
  {
    "url": "js/animation.js",
    "revision": "3f8fd475afa44c10b3107178a83bd9ae"
  },
  {
    "url": "images/icon/icon.svg",
    "revision": "d582b402cdafcc4a3934fba3986d1be7"
  },
  {
    "url": "images/icon/offline.png",
    "revision": "98719d2bea65dce664e52ae10074e616"
  },
  {
    "url": "images/icon/online.png",
    "revision": "7ada381259d03c6cca6b8e9d672e94f9"
  },
  {
    "url": "pages/offline.html",
    "revision": "60fdf44d5438078f9f242d504f013941"
  },
  {
    "url": "pages/404.html",
    "revision": "85695da32717e30feceb88d152194353"
  }
]);
  const NetWorkHandler = workbox.strategies.staleWhileRevalidate({
    cacheName: 'poc-cache',
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      })
    ]
  });
    const OfflineHandler = workbox.strategies.cacheOnly({
    cacheName: 'poc-cache',
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      })
    ]
  });
  workbox.routing.registerRoute(
    /.*\.(?:png|gif|jpg|svg)/,
    workbox.strategies.cacheFirst({
      cacheName: 'images-cache',
      plugins: [
        new workbox.expiration.Plugin({
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
        })
      ]
    })
  );
  workbox.routing.registerRoute(/.*\.(?:html|htm|js)/, args => {
	  console.log(args);
	console.log("up to date : " + uptodate);
	if(navigator.onLine){
		return NetWorkHandler.handle(args).then(response => {
		  if (!response) {
			return caches.match('pages/offline.html');
		  } else if (response.status === 404) {
			return caches.match('pages/404.html');
		  }
		  return response;
		});
	} else {
		return OfflineHandler.handle(args).then(response => {
		  if (response.status === 404) {
			return caches.match('pages/404.html');
		  }
		  return response;
		})
		.catch(function() {
		  return caches.match('pages/offline.html');
		});
	}
  });
  
  self.addEventListener('message', function(event){
	  uptodate = event.data;
	console.log("SW Received Message: " + event.data);
  });
} else {
  console.log(`Boo! Workbox didn't load 😬`);
}
