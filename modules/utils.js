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

  // Format duration in a human-readable way (full format with seconds)
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

  // Format duration in compact format (hours and minutes only)
  static formatDurationCompact(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
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

  // HTML sanitization methods
  static sanitizeHtml(input) {
    if (!input || typeof input !== 'string') return '';
    
    // Create a temporary element to use browser's built-in HTML escaping
    const temp = document.createElement('div');
    temp.textContent = input;
    return temp.innerHTML;
  }

  // Escape HTML characters manually (fallback method)
  static escapeHtml(input) {
    if (!input || typeof input !== 'string') return '';
    
    const entityMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;'
    };
    
    return input.replace(/[&<>"'\/]/g, (match) => entityMap[match]);
  }

  // Consolidated validation methods
  static validateTaskNameSecure(name) {
    if (!name || typeof name !== 'string') return false;
    
    const trimmedName = name.trim();
    
    // Check length (1-200 characters)
    if (trimmedName.length === 0 || trimmedName.length > 200) return false;
    
    // Check for HTML tags or script content
    const htmlTagPattern = /<[^>]*>/;
    const scriptPattern = /(javascript:|data:|vbscript:|on\w+\s*=)/i;
    
    if (htmlTagPattern.test(trimmedName) || scriptPattern.test(trimmedName)) {
      return false;
    }
    
    return true;
  }

  // Validate notification interval
  static validateNotificationInterval(minutes) {
    const num = parseInt(minutes);
    return !isNaN(num) && num >= 1 && num <= 360;
  }

  // Validate history entry structure
  static validateHistoryEntry(entry) {
    // Check required fields
    if (!entry || typeof entry !== 'object') return false;
    if (!entry.id || typeof entry.id !== 'string') return false;
    if (!entry.name || typeof entry.name !== 'string') return false;
    if (!entry.startTs || typeof entry.startTs !== 'number') return false;
    if (!entry.endTs || typeof entry.endTs !== 'number') return false;
    if (!entry.duration || typeof entry.duration !== 'number') return false;
    
    // Validate task name security
    if (!this.validateTaskNameSecure(entry.name)) return false;
    
    // Validate timestamps
    if (entry.startTs < 0 || entry.endTs < 0) return false;
    if (entry.startTs > entry.endTs) return false;
    if (entry.duration !== (entry.endTs - entry.startTs)) return false;
    
    // Validate reasonable time ranges (not in future, not too far in past)
    const now = Date.now();
    const oneYearAgo = now - (365 * 24 * 60 * 60 * 1000);
    if (entry.endTs > now || entry.startTs < oneYearAgo) return false;
    
    return true;
  }

  // Validate file size for imports
  static validateFileSize(text, maxSizeMB = 10) {
    const maxBytes = maxSizeMB * 1024 * 1024;
    return text.length <= maxBytes;
  }

  // Validate task structure (for active tasks)
  static validateTaskStructure(task) {
    if (!task || typeof task !== 'object') return false;
    if (!task.id || typeof task.id !== 'string') return false;
    if (!task.taskId || typeof task.taskId !== 'string') return false;
    if (!task.name || typeof task.name !== 'string') return false;
    if (!task.startTs || typeof task.startTs !== 'number') return false;
    
    // Validate task name security
    if (!this.validateTaskNameSecure(task.name)) return false;
    
    return true;
  }

  // Validate message structure (for service worker communication)
  static validateMessageStructure(message) {
    return message && 
           typeof message === 'object' && 
           typeof message.type === 'string' &&
           message.type.length > 0 &&
           message.type.length <= 50 &&
           /^[a-zA-Z_-]+$/.test(message.type);
  }

  // Create safe DOM element with text content
  static createSafeElement(tagName, textContent, className = '') {
    const element = document.createElement(tagName);
    if (textContent) {
      element.textContent = textContent;
    }
    if (className) {
      element.className = className;
    }
    return element;
  }

  // Safely set inner HTML using sanitization
  static setSafeInnerHTML(element, htmlContent) {
    // For now, we'll convert to text content to prevent XSS
    // In a production app, you'd want to use a proper HTML sanitizer like DOMPurify
    element.textContent = htmlContent.replace(/<[^>]*>/g, '');
  }
}