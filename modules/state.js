// State Management Module - Simple observable state pattern
export class StateManager {
  constructor() {
    this.state = {
      currentTask: null,
      history: [],
      storageStatus: {
        fileSystemSupported: false,
        fileHandleActive: false,
        storageType: 'localStorage'
      }
    };
    this.listeners = new Map();
  }

  // State subscription
  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.get(key)?.delete(callback);
    };
  }

  // Notify listeners of state changes
  notify(key, value) {
    if (this.listeners.has(key)) {
      this.listeners.get(key).forEach(callback => callback(value));
    }
  }

  // State getters
  getCurrentTask() {
    return this.state.currentTask;
  }

  getHistory() {
    return this.state.history;
  }

  getStorageStatus() {
    return this.state.storageStatus;
  }

  // State setters
  setCurrentTask(task) {
    this.state.currentTask = task;
    this.notify('currentTask', task);
  }

  setHistory(history) {
    this.state.history = history;
    this.notify('history', history);
  }

  addHistoryEntry(entry) {
    this.state.history.push(entry);
    this.notify('history', [...this.state.history]);
  }

  clearHistory() {
    this.state.history = [];
    this.notify('history', []);
  }

  setStorageStatus(status) {
    this.state.storageStatus = { ...this.state.storageStatus, ...status };
    this.notify('storageStatus', this.state.storageStatus);
  }

  // Computed values
  isTaskActive() {
    return !!this.state.currentTask;
  }

  getElapsedTime() {
    if (!this.state.currentTask) return 0;
    return Date.now() - this.state.currentTask.startTs;
  }

  // State persistence helpers
  async loadFromStorage(storageManager) {
    const activeTask = storageManager.getActiveTask();
    const history = await storageManager.getHistory();
    const storageStatus = storageManager.getStorageStatus();

    this.setCurrentTask(activeTask);
    this.setHistory(history);
    this.setStorageStatus(storageStatus);
  }

  async saveToStorage(storageManager) {
    if (this.state.currentTask) {
      storageManager.saveActiveTask(this.state.currentTask);
    } else {
      storageManager.clearActiveTask();
    }
    
    await storageManager.saveHistory(this.state.history);
  }
}