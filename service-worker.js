const CACHE_NAME = 'tt-cache-v4';
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

// Import utilities for validation - note: service workers have limited import support
// For now, inline the validation until we can properly import modules
function isValidMessage(message) {
  return message && 
         typeof message === 'object' && 
         typeof message.type === 'string' &&
         message.type.length > 0 &&
         message.type.length <= 50 &&
         /^[a-zA-Z_-]+$/.test(message.type);
}

// Validate client URL for TimeTracker instances
function isTimeTrackerClient(client) {
  try {
    const url = new URL(client.url);
    const validPaths = ['/', '/index.html'];
    return validPaths.includes(url.pathname) || url.pathname.endsWith('/index.html');
  } catch (error) {
    console.warn('Invalid client URL:', error);
    return false;
  }
}

// Safe postMessage with validation
function safePostMessage(client, message) {
  if (!client || !isValidMessage(message)) {
    console.warn('Invalid client or message for postMessage');
    return;
  }
  
  try {
    client.postMessage(message);
  } catch (error) {
    console.error('Failed to send message to client:', error);
  }
}

self.addEventListener('notificationclick', event => {
  // Validate event structure
  if (!event || !event.notification) {
    console.warn('Invalid notification click event');
    return;
  }

  event.notification.close();
  
  // Validate action is expected value
  if (event.action && event.action !== 'yes' && event.action !== 'no') {
    console.warn('Unknown notification action:', event.action);
    return;
  }
  
  if (event.action === 'yes') return;

  event.waitUntil(
    clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    }).then(list => {
      // Filter for valid TimeTracker instances
      const timeTrackerClients = list.filter(isTimeTrackerClient);

      if (timeTrackerClients.length > 0) {
        // Found existing TimeTracker instance, focus it
        const client = timeTrackerClients[0];
        return client.focus().then(() => {
          // Send validated message to switch task
          safePostMessage(client, { type: 'switch' });
        }).catch(error => {
          console.error('Failed to focus client:', error);
        });
      } else {
        // No existing instance, open new one
        return clients.openWindow('./').then(client => {
          // Wait a bit for the new window to load, then send switch message
          if (client) {
            setTimeout(() => {
              safePostMessage(client, { type: 'switch' });
            }, 1000);
          }
        }).catch(error => {
          console.error('Failed to open new window:', error);
        });
      }
    }).catch(error => {
      console.error('Error handling notification click:', error);
      // Fallback: try to open window anyway
      return clients.openWindow('./').catch(fallbackError => {
        console.error('Fallback window open failed:', fallbackError);
      });
    })
  );
});