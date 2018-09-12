var uptodate = true;
importScripts('workbox/workbox-sw.js');
if (workbox) {
	console.log(`Yay! Workbox is loaded 🎉         -     uptodate :` + uptodate);
  workbox.precaching.precacheAndRoute([
  {
    "url": "index.html",
    "revision": "a89ea0d06d9823bef6a2003e5c62eeff"
  },
  {
    "url": "style/main.css",
    "revision": "c21b1d64efe5fa91addbd872b7e5137b"
  },
  {
    "url": "js/main.js",
    "revision": "1b6be804a5c3991d59e4137876c425ee"
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
    "revision": "c5d1b233b9a2f1d1c60b0f37ee1b9ed3"
  },
  {
    "url": "pages/404.html",
    "revision": "316980af0b39d8ea7a64779d2dc344d0"
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
