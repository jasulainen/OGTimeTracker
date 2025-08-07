// Main Application Controller - Orchestrates all modules
import { StorageManager } from './storage.js';
import { StateManager } from './state.js';
import { TaskManager } from './taskManager.js';
import { NotificationService } from './notifications.js';
import { UIComponents } from './ui.js';
import { AutocompleteManager } from './autocomplete.js';
import { DateFilter } from './dateFilter.js';
import { PreferencesManager } from './preferences.js';
import { PreferencesController } from './preferencesController.js';
import { DateNavigationController } from './dateNavigationController.js';
import { TabController } from './tabController.js';
import { FileController } from './fileController.js';
import { Utils } from './utils.js';

export class TimeTrackerApp {
  constructor() {
    this.storage = new StorageManager();
    this.state = new StateManager();
    this.taskManager = new TaskManager(this.state, this.storage);
    this.preferences = new PreferencesManager();
    this.notifications = new NotificationService(this.taskManager, this.preferences);
    this.ui = new UIComponents();
    this.autocomplete = new AutocompleteManager();
    this.dateFilter = new DateFilter();
    
    // Initialize controllers
    this.preferencesController = new PreferencesController(this.preferences, this.notifications);
    this.dateNavigationController = new DateNavigationController(this.dateFilter, this.state, this.ui);
    this.tabController = new TabController();
    this.fileController = new FileController(this.taskManager, this.ui);
    
    this.renderTimer = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Initialize all modules
      await this.taskManager.initialize();
      await this.notifications.initialize();

      // Initialize controllers
      this.tabController.initialize();
      this.preferencesController.initialize();
      this.dateNavigationController.initialize();
      this.fileController.initialize();
      
      // Set up remaining event listeners
      this.setupTaskEventListeners();
      
      // Set up autocomplete
      this.setupAutocomplete();
      
      // Set up state subscriptions
      this.setupStateSubscriptions();
      
      // Start render timer
      this.startRenderTimer();
      
      // Initial render
      await this.render();
      
      this.isInitialized = true;
      console.log('TimeTracker initialized successfully');
    } catch (error) {
      console.error('Failed to initialize TimeTracker:', error);
      this.ui.showError('Failed to initialize application: ' + error.message);
    }
  }

  setupTaskEventListeners() {
    // Task control events
    this.ui.elements.startBtn.onclick = () => this.handleStartTask();
    
    // Enter key support for task input
    this.ui.elements.taskName.onkeypress = (e) => {
      if (e.key === 'Enter') {
        // Only handle enter if autocomplete is not visible
        if (!this.autocomplete.isVisible()) {
          this.handleStartTask();
        }
      }
    };
    
    // Stop task event listener
    document.addEventListener('stopTask', () => this.handleStopTask());
  }

  setupAutocomplete() {
    // Ensure autocomplete dropdown exists
    const dropdown = this.ui.ensureAutocompleteDropdown();
    const input = this.ui.getTaskInputElement();
    
    // Initialize autocomplete
    this.autocomplete.init(input, dropdown, (selectedTaskDef) => {
      // Start task with the selected task ID
      setTimeout(() => {
        this.handleStartTaskWithId(selectedTaskDef.name, selectedTaskDef.id);
      }, 100);
    });
    
    // Update suggestions when history changes
    this.refreshAutocompleteSuggestions();
  }

  refreshAutocompleteSuggestions() {
    this.autocomplete.updateSuggestions(this.taskManager);
  }

  // Date navigation methods moved to DateNavigationController

  // Preferences methods moved to PreferencesController
  // Tab methods moved to TabController

  setupStateSubscriptions() {
    // Subscribe to state changes for automatic re-rendering
    this.state.subscribe('currentTask', () => this.render());
    this.state.subscribe('history', () => {
      this.dateNavigationController.refreshDateView(); // Use date-filtered view instead of renderHistory
      this.refreshAutocompleteSuggestions();
    });
    this.state.subscribe('storageStatus', () => this.renderFileStatus());
  }

  startRenderTimer() {
    // Update UI every second when task is active
    this.renderTimer = setInterval(() => {
      if (this.state.isTaskActive()) {
        this.updateActiveTaskTime();
      }
    }, 1000);
  }

  // Event handlers
  async handleStartTask() {
    const taskName = this.ui.getTaskName();
    if (!taskName) {
      this.ui.showAlert('Please enter a task name');
      return;
    }
    
    // Client-side validation before sending to task manager
    if (!Utils.validateTaskNameSecure(taskName)) {
      this.ui.showAlert('Task name contains invalid characters or is too long. Please use only safe characters and keep it under 200 characters.');
      return;
    }

    try {
      await this.taskManager.startTask(taskName);
      this.ui.clearTaskName();
    } catch (error) {
      this.ui.showError('Failed to start task: ' + error.message);
    }
  }

  async handleStartTaskWithId(taskName, taskId) {
    // Client-side validation before sending to task manager
    if (!Utils.validateTaskNameSecure(taskName)) {
      this.ui.showAlert('Task name contains invalid characters or is too long. Please use only safe characters and keep it under 200 characters.');
      return;
    }
    
    try {
      await this.taskManager.startTask(taskName, taskId);
      this.ui.clearTaskName();
    } catch (error) {
      this.ui.showError('Failed to start task: ' + error.message);
    }
  }

  // File management methods moved to FileController

  async handleStopTask() {
    try {
      await this.taskManager.stopTracking();
    } catch (error) {
      this.ui.showError('Failed to stop task: ' + error.message);
    }
  }

  // Rendering methods
  async render() {
    const currentTask = this.state.getCurrentTask();
    
    if (currentTask) {
      this.ui.hideTaskInput();
      this.ui.renderActiveTask(currentTask);
    } else {
      this.ui.showTaskInput();
      this.ui.clearStatus();
    }
    
    this.dateNavigationController.refreshDateView(); // Use date-filtered view instead of renderHistory
    this.renderFileStatus();
  }

  renderActiveTask() {
    const currentTask = this.state.getCurrentTask();
    if (currentTask) {
      this.ui.renderActiveTask(currentTask);
    }
  }

  updateActiveTaskTime() {
    const currentTask = this.state.getCurrentTask();
    if (currentTask) {
      this.ui.updateActiveTaskTime(currentTask);
    }
  }

  async renderHistory() {
    // This method is now handled by DateNavigationController for date filtering
    this.dateNavigationController.refreshDateView();
  }

  renderFileStatus() {
    const storageStatus = this.state.getStorageStatus();
    this.ui.renderFileStatus(storageStatus);
  }

  // Utility methods
  getAppStatus() {
    return {
      initialized: this.isInitialized,
      currentTask: this.taskManager.getCurrentTaskSummary(),
      historySummary: this.taskManager.getHistorySummary(),
      storageStatus: this.state.getStorageStatus(),
      notificationStatus: this.notifications.getStatus()
    };
  }

  // Cleanup
  destroy() {
    if (this.renderTimer) {
      clearInterval(this.renderTimer);
    }
    this.notifications.destroy();
    this.isInitialized = false;
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  const app = new TimeTrackerApp();
  await app.initialize();
  
  // Make app globally available for debugging
  window.timeTracker = app;
});