// Preferences Controller - Handles all preferences-related UI logic
export class PreferencesController {
  constructor(preferencesManager, notificationService) {
    this.preferences = preferencesManager;
    this.notifications = notificationService;
    this.isInitialized = false;
  }

  initialize() {
    if (this.isInitialized) return;
    
    this.setupPreferencesTab();
    this.isInitialized = true;
  }

  setupPreferencesTab() {
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
      this.showPreferencesMessage('Preferences saved successfully!', 'success');
      
    } catch (error) {
      // Show error message
      this.showPreferencesMessage('Error: ' + error.message, 'error');
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
    this.showPreferencesMessage('Preferences reset to defaults!', 'success');
  }

  showPreferencesMessage(message, type) {
    const messageDiv = document.getElementById('preferencesMessage');
    const messageText = document.getElementById('preferencesMessageText');
    
    if (!messageDiv || !messageText) return;

    const isSuccess = type === 'success';
    const bgColor = isSuccess ? 'bg-green-50' : 'bg-red-50';
    const borderColor = isSuccess ? 'border-green-200' : 'border-red-200';
    
    messageDiv.className = `mt-4 p-3 rounded-lg ${bgColor} border ${borderColor}`;
    messageText.textContent = message;
    messageDiv.classList.remove('hidden');
    
    // Hide message after timeout
    const timeout = isSuccess ? 3000 : 5000;
    setTimeout(() => {
      messageDiv.classList.add('hidden');
    }, timeout);
  }
}