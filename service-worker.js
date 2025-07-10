const CACHE_NAME = 'tt-cache-v3';
const urlsToCache = ['/', 'index.html', 'manifest.json'];

self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request)
      .then(resp => resp || fetch(evt.request))
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'yes') return;

  event.waitUntil(
    clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    }).then(list => {
      // Filter for TimeTracker instances (check URL contains index.html or is root)
      const timeTrackerClients = list.filter(client => {
        const url = new URL(client.url);
        return url.pathname === '/' || 
               url.pathname === '/index.html' || 
               url.pathname.endsWith('/index.html');
      });

      if (timeTrackerClients.length > 0) {
        // Found existing TimeTracker instance, focus it
        const client = timeTrackerClients[0];
        return client.focus().then(() => {
          // Send message to switch task
          client.postMessage({ type: 'switch' });
        });
      } else {
        // No existing instance, open new one
        return clients.openWindow('./').then(client => {
          // Wait a bit for the new window to load, then send switch message
          if (client) {
            setTimeout(() => {
              client.postMessage({ type: 'switch' });
            }, 1000);
          }
        });
      }
    }).catch(error => {
      console.error('Error handling notification click:', error);
      // Fallback: try to open window anyway
      return clients.openWindow('./');
    })
  );
});