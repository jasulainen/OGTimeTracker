// Main Application Controller - Orchestrates all modules
import { StorageManager } from './storage.js';
import { StateManager } from './state.js';
import { TaskManager } from './taskManager.js';
import { NotificationService } from './notifications.js';
import { UIComponents } from './ui.js';
import { AutocompleteManager } from './autocomplete.js';
import { DateFilter } from './dateFilter.js';
import { PreferencesManager } from './preferences.js';
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
    
    this.renderTimer = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Initialize all modules
      await this.taskManager.initialize();
      await this.notifications.initialize();

      // Set up event listeners
      this.setupEventListeners();
      
      // Set up autocomplete
      this.setupAutocomplete();
      
      // Set up date navigation
      this.setupDateNavigation();
      
      // Set up preferences tab
      this.setupPreferences();
      
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

  setupEventListeners() {
    // Task control events
    this.ui.elements.startBtn.onclick = () => this.handleStartTask();
    
    // File management events
    this.ui.elements.setupFileBtn.onclick = () => this.handleSetupFile();
    this.ui.elements.exportDropdownBtn.onclick = () => this.toggleExportDropdown();
    this.ui.elements.exportJsonBtn.onclick = () => this.handleExportJSON();
    this.ui.elements.exportCsvBtn.onclick = () => this.handleExportCSV();
    this.ui.elements.importBtn.onclick = () => this.handleImport();
    this.ui.elements.clearHistoryBtn.onclick = () => this.handleClearHistory();
    
    // Tab navigation events
    document.getElementById('trackingTab').onclick = () => this.showTab('tracking');
    document.getElementById('preferencesTab').onclick = () => this.showTab('preferences');
    
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
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
      if (!event.target.closest('.relative')) {
        this.closeExportDropdown();
      }
    });
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

  setupDateNavigation() {
    const { prevDateBtn, nextDateBtn, todayBtn, datePicker } = this.ui.getDateNavigationElements();
    
    // Previous date button
    prevDateBtn.addEventListener('click', () => {
      this.handlePrevDate();
    });
    
    // Next date button
    nextDateBtn.addEventListener('click', () => {
      this.handleNextDate();
    });
    
    // Today button
    todayBtn.addEventListener('click', () => {
      this.handleTodayClick();
    });
    
    // Date picker
    datePicker.addEventListener('change', (event) => {
      this.handleDateChange(event.target.value);
    });
    
    // Initialize with current date
    this.dateFilter.setCurrentDate(new Date());
    this.updateDateView();
  }

  handlePrevDate() {
    const prevDate = this.dateFilter.getPreviousDate();
    this.dateFilter.setCurrentDate(prevDate);
    this.updateDateView();
  }

  handleNextDate() {
    const nextDate = this.dateFilter.getNextDate();
    // Don't allow navigation to future dates
    if (!this.dateFilter.isFuture(nextDate)) {
      this.dateFilter.setCurrentDate(nextDate);
      this.updateDateView();
    }
  }

  handleTodayClick() {
    this.dateFilter.setCurrentDate(new Date());
    this.updateDateView();
  }

  handleDateChange(dateString) {
    const selectedDate = this.dateFilter.parseDateFromInput(dateString);
    this.dateFilter.setCurrentDate(selectedDate);
    this.updateDateView();
  }

  updateDateView() {
    const selectedDate = this.dateFilter.getSelectedDate();
    const allHistory = this.state.getHistory();
    
    // Filter history for selected date
    const filteredHistory = this.dateFilter.filterEntriesByDate(allHistory, selectedDate);
    
    // Get daily summary
    const dailySummary = this.dateFilter.getDailySummary(allHistory, selectedDate);
    
    // Update UI
    this.ui.updateDateNavigation(selectedDate, this.dateFilter);
    this.ui.updateDailySummary(dailySummary);
    this.ui.renderHistory(filteredHistory, this.dateFilter.formatDateForDisplay(selectedDate));
  }

  setupPreferences() {
    // Set up notification interval input
    const notificationIntervalInput = document.getElementById('notificationInterval');
    const intervalDisplay = document.getElementById('intervalDisplay');
    
    // Load current value
    if (notificationIntervalInput) {
      notificationIntervalInput.value = this.preferences.getNotificationInterval();
      this.updateIntervalDisplay();
    }
    
    // Update display when input changes
    if (notificationIntervalInput) {
      notificationIntervalInput.addEventListener('input', () => {
        this.updateIntervalDisplay();
      });
    }
    
    // Set up preference buttons
    const saveBtn = document.getElementById('savePreferences');
    const resetBtn = document.getElementById('resetPreferences');
    
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.handleSavePreferences());
    }
    
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.handleResetPreferences());
    }
  }

  updateIntervalDisplay() {
    const input = document.getElementById('notificationInterval');
    const display = document.getElementById('intervalDisplay');
    
    if (input && display) {
      const minutes = parseInt(input.value) || 1;
      const validatedMinutes = Math.min(Math.max(minutes, 1), 360);
      
      if (validatedMinutes < 60) {
        display.textContent = `(${validatedMinutes} minute${validatedMinutes !== 1 ? 's' : ''})`;
      } else {
        const hours = Math.floor(validatedMinutes / 60);
        const remainingMinutes = validatedMinutes % 60;
        if (remainingMinutes === 0) {
          display.textContent = `(${hours} hour${hours !== 1 ? 's' : ''})`;
        } else {
          display.textContent = `(${hours}h ${remainingMinutes}m)`;
        }
      }
    }
  }

  showTab(tabName) {
    // Hide all tab contents
    const trackingContent = document.getElementById('trackingContent');
    const preferencesContent = document.getElementById('preferencesContent');
    
    // Remove active class from all tab buttons
    const trackingTab = document.getElementById('trackingTab');
    const preferencesTab = document.getElementById('preferencesTab');
    
    if (tabName === 'tracking') {
      trackingContent.style.display = '';
      preferencesContent.style.display = 'none';
      trackingTab.className = 'tab-button active px-6 py-3 bg-primary text-white rounded-l-lg hover:bg-blue-600 transition-all font-medium';
      preferencesTab.className = 'tab-button px-6 py-3 bg-gray-200 text-gray-700 rounded-r-lg hover:bg-gray-300 transition-all font-medium';
    } else if (tabName === 'preferences') {
      trackingContent.style.display = 'none';
      preferencesContent.style.display = '';
      trackingTab.className = 'tab-button px-6 py-3 bg-gray-200 text-gray-700 rounded-l-lg hover:bg-gray-300 transition-all font-medium';
      preferencesTab.className = 'tab-button active px-6 py-3 bg-primary text-white rounded-r-lg hover:bg-blue-600 transition-all font-medium';
    }
  }

  handleSavePreferences() {
    const notificationIntervalInput = document.getElementById('notificationInterval');
    const messageDiv = document.getElementById('preferencesMessage');
    const messageText = document.getElementById('preferencesMessageText');
    
    try {
      const minutes = parseInt(notificationIntervalInput.value);
      
      if (!this.preferences.isValidNotificationInterval(minutes)) {
        throw new Error('Notification interval must be between 1 and 360 minutes');
      }
      
      // Save the preference
      this.preferences.setNotificationInterval(minutes);
      
      // Update notification service
      this.notifications.updateNotificationInterval();
      
      // Show success message
      messageDiv.className = 'mt-4 p-3 rounded-lg bg-green-50 border border-green-200';
      messageText.textContent = 'Preferences saved successfully!';
      messageDiv.classList.remove('hidden');
      
      // Hide message after 3 seconds
      setTimeout(() => {
        messageDiv.classList.add('hidden');
      }, 3000);
      
    } catch (error) {
      // Show error message
      messageDiv.className = 'mt-4 p-3 rounded-lg bg-red-50 border border-red-200';
      messageText.textContent = 'Error: ' + error.message;
      messageDiv.classList.remove('hidden');
      
      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add('hidden');
      }, 5000);
    }
  }

  handleResetPreferences() {
    if (!confirm('Are you sure you want to reset all preferences to defaults?')) {
      return;
    }
    
    // Reset preferences
    this.preferences.resetToDefaults();
    
    // Update UI
    const notificationIntervalInput = document.getElementById('notificationInterval');
    if (notificationIntervalInput) {
      notificationIntervalInput.value = this.preferences.getNotificationInterval();
      this.updateIntervalDisplay();
    }
    
    // Update notification service
    this.notifications.updateNotificationInterval();
    
    // Show success message
    const messageDiv = document.getElementById('preferencesMessage');
    const messageText = document.getElementById('preferencesMessageText');
    messageDiv.className = 'mt-4 p-3 rounded-lg bg-green-50 border border-green-200';
    messageText.textContent = 'Preferences reset to defaults!';
    messageDiv.classList.remove('hidden');
    
    // Hide message after 3 seconds
    setTimeout(() => {
      messageDiv.classList.add('hidden');
    }, 3000);
  }

  setupStateSubscriptions() {
    // Subscribe to state changes for automatic re-rendering
    this.state.subscribe('currentTask', () => this.render());
    this.state.subscribe('history', () => {
      this.updateDateView(); // Use date-filtered view instead of renderHistory
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

  // Method removed - no longer needed since input is always visible

  async handleSetupFile() {
    try {
      const success = await this.taskManager.setupDataFile();
      if (success) {
        this.ui.showSuccess('Data file set up successfully!');
      } else {
        this.ui.showAlert('Failed to set up data file or cancelled by user');
      }
    } catch (error) {
      this.ui.showError('Failed to set up data file: ' + error.message);
    }
  }

  toggleExportDropdown() {
    const dropdown = this.ui.elements.exportDropdown;
    if (dropdown.style.display === 'none' || dropdown.style.display === '') {
      dropdown.style.display = 'block';
    } else {
      dropdown.style.display = 'none';
    }
  }

  closeExportDropdown() {
    const dropdown = this.ui.elements.exportDropdown;
    if (dropdown) {
      dropdown.style.display = 'none';
    }
  }

  async handleExportJSON() {
    try {
      await this.taskManager.exportHistory();
      this.ui.showSuccess('History exported as JSON successfully!');
    } catch (error) {
      this.ui.showError('Failed to export history as JSON: ' + error.message);
    } finally {
      this.closeExportDropdown();
    }
  }

  async handleExportCSV() {
    try {
      await this.taskManager.exportHistoryAsCSV();
      this.ui.showSuccess('History exported as CSV successfully!');
    } catch (error) {
      this.ui.showError('Failed to export history as CSV: ' + error.message);
    } finally {
      this.closeExportDropdown();
    }
  }

  async handleImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        await this.taskManager.importHistory(file);
        this.ui.showSuccess('History imported successfully!');
      } catch (error) {
        this.ui.showError('Failed to import history: ' + error.message);
      }
    };
    input.click();
  }

  async handleClearHistory() {
    if (!confirm('Are you sure you want to clear all history? This action cannot be undone.')) {
      return;
    }

    try {
      await this.taskManager.clearHistory();
      this.ui.showSuccess('History cleared successfully!');
    } catch (error) {
      this.ui.showError('Failed to clear history: ' + error.message);
    }
  }

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
    
    await this.updateDateView(); // Use date-filtered view instead of renderHistory
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
    // This method is now handled by updateDateView for date filtering
    this.updateDateView();
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