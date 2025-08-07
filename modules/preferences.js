// Preferences Module - Handles user settings and preferences
import { Utils } from './utils.js';

export class PreferencesManager {
  constructor() {
    this.defaultSettings = {
      notificationInterval: 1, // minutes
      theme: 'light',
      dateFormat: 'default',
      timeFormat: '24h'
    };
    this.settings = this.loadSettings();
  }

  // Load settings from localStorage
  loadSettings() {
    try {
      const savedSettings = localStorage.getItem('timetracker-preferences');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        // Merge with defaults to ensure all settings exist
        return { ...this.defaultSettings, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load preferences:', error);
    }
    return { ...this.defaultSettings };
  }

  // Save settings to localStorage
  saveSettings() {
    try {
      localStorage.setItem('timetracker-preferences', JSON.stringify(this.settings));
      return true;
    } catch (error) {
      console.error('Failed to save preferences:', error);
      return false;
    }
  }

  // Get a specific setting
  getSetting(key) {
    return this.settings[key] ?? this.defaultSettings[key];
  }

  // Set a specific setting
  setSetting(key, value) {
    this.settings[key] = value;
    return this.saveSettings();
  }

  // Get all settings
  getAllSettings() {
    return { ...this.settings };
  }

  // Update multiple settings at once
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    return this.saveSettings();
  }

  // Reset to default settings
  resetToDefaults() {
    this.settings = { ...this.defaultSettings };
    return this.saveSettings();
  }

  // Notification interval specific methods
  getNotificationInterval() {
    return this.getSetting('notificationInterval');
  }

  setNotificationInterval(minutes) {
    // Validate range: 1-360 minutes (1 minute to 6 hours)
    const validatedMinutes = Math.min(Math.max(parseInt(minutes), 1), 360);
    return this.setSetting('notificationInterval', validatedMinutes);
  }

  // Get notification interval in milliseconds (for use with setInterval)
  getNotificationIntervalMs() {
    return this.getNotificationInterval() * 60 * 1000;
  }

  // Validate notification interval using centralized validation
  isValidNotificationInterval(minutes) {
    return Utils.validateNotificationInterval(minutes);
  }

  // Get formatted interval display
  getFormattedNotificationInterval() {
    const minutes = this.getNotificationInterval();
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours} hour${hours !== 1 ? 's' : ''}`;
      } else {
        return `${hours}h ${remainingMinutes}m`;
      }
    }
  }

  // Theme methods
  getTheme() {
    return this.getSetting('theme');
  }

  setTheme(theme) {
    return this.setSetting('theme', theme);
  }

  // Date format methods
  getDateFormat() {
    return this.getSetting('dateFormat');
  }

  setDateFormat(format) {
    return this.setSetting('dateFormat', format);
  }

  // Time format methods
  getTimeFormat() {
    return this.getSetting('timeFormat');
  }

  setTimeFormat(format) {
    return this.setSetting('timeFormat', format);
  }

  // Export settings for backup
  exportSettings() {
    return JSON.stringify(this.settings, null, 2);
  }

  // Import settings from backup
  importSettings(settingsJson) {
    try {
      const importedSettings = JSON.parse(settingsJson);
      
      // Validate critical settings
      if (importedSettings.notificationInterval) {
        if (!this.isValidNotificationInterval(importedSettings.notificationInterval)) {
          importedSettings.notificationInterval = this.defaultSettings.notificationInterval;
        }
      }

      return this.updateSettings(importedSettings);
    } catch (error) {
      console.error('Failed to import settings:', error);
      return false;
    }
  }

  // Get settings validation errors
  validateSettings(settings = null) {
    const toValidate = settings || this.settings;
    const errors = [];

    // Validate notification interval
    if (!this.isValidNotificationInterval(toValidate.notificationInterval)) {
      errors.push('Notification interval must be between 1 and 360 minutes');
    }

    // Add more validations as needed for other settings

    return errors;
  }

  // Check if settings are valid
  areSettingsValid(settings = null) {
    return this.validateSettings(settings).length === 0;
  }

  // Get setting info for UI display
  getSettingInfo(key) {
    const settingInfoMap = {
      notificationInterval: {
        label: 'Notification Interval',
        description: 'How often to ask if you\'re still working on the current task',
        type: 'number',
        min: 1,
        max: 360,
        unit: 'minutes',
        value: this.getNotificationInterval(),
        displayValue: this.getFormattedNotificationInterval()
      },
      theme: {
        label: 'Theme',
        description: 'Choose your preferred color scheme',
        type: 'select',
        options: ['light', 'dark', 'auto'],
        value: this.getTheme()
      },
      dateFormat: {
        label: 'Date Format',
        description: 'How dates are displayed throughout the app',
        type: 'select',
        options: ['default', 'iso', 'us', 'eu'],
        value: this.getDateFormat()
      },
      timeFormat: {
        label: 'Time Format',
        description: 'Choose between 12-hour or 24-hour time display',
        type: 'select',
        options: ['12h', '24h'],
        value: this.getTimeFormat()
      }
    };

    return settingInfoMap[key] || null;
  }

  // Get all setting info for UI
  getAllSettingInfo() {
    return {
      notificationInterval: this.getSettingInfo('notificationInterval'),
      theme: this.getSettingInfo('theme'),
      dateFormat: this.getSettingInfo('dateFormat'),
      timeFormat: this.getSettingInfo('timeFormat')
    };
  }
}