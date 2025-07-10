// Notification Service Module - Handles all notification-related functionality
export class NotificationService {
  constructor(taskManager, preferencesManager = null) {
    this.taskManager = taskManager;
    this.preferencesManager = preferencesManager;
    this.serviceWorkerRegistration = null;
    this.notificationInterval = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return false;

    // Check if notifications and service workers are supported
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      console.warn('Notifications or Service Workers not supported');
      return false;
    }

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission denied');
        return false;
      }

      // Register service worker
      this.serviceWorkerRegistration = await navigator.serviceWorker.register('service-worker.js');
      console.log('Service Worker registered successfully');

      // Set up message listener for service worker messages
      this.setupMessageListener();

      // Start notification interval
      this.startNotificationInterval();

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      return false;
    }
  }

  setupMessageListener() {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data.type === 'switch') {
        this.handleSwitchTaskRequest();
      }
    });
  }

  startNotificationInterval() {
    // Clear existing interval if any
    if (this.notificationInterval) {
      clearInterval(this.notificationInterval);
    }

    // Get interval from preferences or use default (1 minute)
    const intervalMs = this.preferencesManager 
      ? this.preferencesManager.getNotificationIntervalMs()
      : 60 * 1000; // fallback to 1 minute

    // Set up new interval with configurable time
    this.notificationInterval = setInterval(() => {
      this.checkAndShowNotification();
    }, intervalMs);
  }

  stopNotificationInterval() {
    if (this.notificationInterval) {
      clearInterval(this.notificationInterval);
      this.notificationInterval = null;
    }
  }

  // Update notification interval when preferences change
  updateNotificationInterval() {
    if (this.isInitialized) {
      this.startNotificationInterval(); // This will clear existing and start new
    }
  }

  // Set preferences manager (for cases where it's set after construction)
  setPreferencesManager(preferencesManager) {
    this.preferencesManager = preferencesManager;
    // Update interval if already initialized
    if (this.isInitialized) {
      this.updateNotificationInterval();
    }
  }

  async checkAndShowNotification() {
    if (!this.isInitialized || !this.serviceWorkerRegistration) return;

    const currentTask = this.taskManager.state.getCurrentTask();
    if (!currentTask) return;

    if (this.taskManager.shouldShowNotification()) {
      await this.showTaskNotification(currentTask);
      this.taskManager.updateNotificationTimestamp();
    }
  }

  async showTaskNotification(task) {
    if (!this.serviceWorkerRegistration) return;

    try {
      await this.serviceWorkerRegistration.showNotification(
        `Still working on "${task.name}"?`,
        {
          body: 'Click "No" to switch to a different task',
          icon: './icon-192.png',
          badge: './icon-192.png',
          actions: [
            { action: 'yes', title: 'Yes' },
            { action: 'no', title: 'No' }
          ],
          tag: 'time-tracker',
          requireInteraction: true,
          silent: false
        }
      );
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }

  async handleSwitchTaskRequest() {
    // Since input is always visible, we don't need to show prompt
    // Just focus the input field and clear it for the user to type
    const taskNameInput = document.getElementById('taskName');
    if (taskNameInput) {
      taskNameInput.value = '';
      taskNameInput.focus();
      console.log('Task input focused for switching');
    } else {
      console.warn('Task input field not found');
    }
  }

  // Manual notification methods
  async showSuccessNotification(message) {
    if (!this.isInitialized) return;

    try {
      await this.serviceWorkerRegistration.showNotification('TimeTracker', {
        body: message,
        icon: './icon-192.png',
        tag: 'time-tracker-success'
      });
    } catch (error) {
      console.error('Failed to show success notification:', error);
    }
  }

  async showErrorNotification(message) {
    if (!this.isInitialized) return;

    try {
      await this.serviceWorkerRegistration.showNotification('TimeTracker Error', {
        body: message,
        icon: './icon-192.png',
        tag: 'time-tracker-error'
      });
    } catch (error) {
      console.error('Failed to show error notification:', error);
    }
  }

  // Utility methods
  getNotificationPermission() {
    return Notification.permission;
  }

  isSupported() {
    return ('Notification' in window) && ('serviceWorker' in navigator);
  }

  getStatus() {
    return {
      supported: this.isSupported(),
      permission: this.getNotificationPermission(),
      initialized: this.isInitialized,
      serviceWorkerRegistered: !!this.serviceWorkerRegistration
    };
  }

  // Cleanup
  destroy() {
    this.stopNotificationInterval();
    this.isInitialized = false;
  }
}