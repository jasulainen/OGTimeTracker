// Utility functions for TimeTracker
export class Utils {
  // Generate a unique ID for tasks
  static generateTaskId() {
    return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Generate a unique ID for history entries
  static generateHistoryId() {
    return 'hist_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Normalize task name for comparison and searching
  static normalizeTaskName(name) {
    return name.trim().toLowerCase();
  }

  // Create a task slug from task name (for URL-friendly IDs)
  static createTaskSlug(name) {
    return name.trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Format duration in a human-readable way
  static formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  // Validate task name
  static validateTaskName(name) {
    return name && typeof name === 'string' && name.trim().length > 0;
  }

  // Deep clone object
  static deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // Get current timestamp
  static now() {
    return Date.now();
  }

  // Format date for CSV (YYYY-MM-DD)
  static formatDateForCSV(timestamp) {
    const date = new Date(timestamp);
    return date.toISOString().split('T')[0];
  }

  // Format time for CSV (HH:MM:SS)
  static formatTimeForCSV(timestamp) {
    const date = new Date(timestamp);
    return date.toTimeString().split(' ')[0];
  }

  // Convert milliseconds to decimal hours for Excel calculations
  static millisecondsToDecimalHours(ms) {
    return (ms / (1000 * 60 * 60)).toFixed(4);
  }

  // Escape CSV field (handle commas, quotes, newlines)
  static escapeCsvField(field) {
    if (field == null) return '';
    const str = String(field);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  }

  // Extract category from task name (optional feature for grouping)
  static extractCategory(taskName) {
    // Look for patterns like "Category: Task" or "[Category] Task"
    const colonMatch = taskName.match(/^([^:]+):/);
    if (colonMatch) return colonMatch[1].trim();
    
    const bracketMatch = taskName.match(/^\[([^\]]+)\]/);
    if (bracketMatch) return bracketMatch[1].trim();
    
    return 'General';
  }
}