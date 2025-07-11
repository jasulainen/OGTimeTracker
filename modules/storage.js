// Storage Module - Handles File System API and localStorage operations
import { Utils } from './utils.js';

export class StorageManager {
  constructor() {
    this.fileSystemSupported = false;
    this.fileHandle = null;
    this.initialized = false;
    this.dbName = 'TimeTrackerDB';
    this.dbVersion = 1;
  }

  async init() {
    if (this.initialized) return;
    
    if ('showSaveFilePicker' in window) {
      this.fileSystemSupported = true;
      await this.loadExistingFileHandle();
    }
    
    this.initialized = true;
  }

  async openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('fileHandles')) {
          db.createObjectStore('fileHandles', { keyPath: 'id' });
        }
      };
    });
  }

  async loadExistingFileHandle() {
    try {
      // Open IndexedDB to retrieve file handle
      const db = await this.openDB();
      const transaction = db.transaction(['fileHandles'], 'readonly');
      const store = transaction.objectStore('fileHandles');
      const request = store.get('mainFileHandle');
      
      const result = await new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      if (result && result.handle) {
        this.fileHandle = result.handle;
        // Verify file is still accessible
        await this.fileHandle.getFile();
      }
    } catch (e) {
      this.fileHandle = null;
      // Clean up invalid handle
      try {
        const db = await this.openDB();
        const transaction = db.transaction(['fileHandles'], 'readwrite');
        const store = transaction.objectStore('fileHandles');
        store.delete('mainFileHandle');
      } catch (dbError) {
        console.warn('Failed to clean up invalid file handle:', dbError);
      }
    }
  }

  async setupDataFile() {
    if (!this.fileSystemSupported) return false;
    
    try {
      const options = {
        types: [{
          description: 'TimeTracker History',
          accept: { 'application/json': ['.json'] }
        }],
        suggestedName: 'timetracker-history.json'
      };
      
      this.fileHandle = await window.showSaveFilePicker(options);
      
      // Store file handle in IndexedDB
      try {
        const db = await this.openDB();
        const transaction = db.transaction(['fileHandles'], 'readwrite');
        const store = transaction.objectStore('fileHandles');
        await new Promise((resolve, reject) => {
          const request = store.put({ id: 'mainFileHandle', handle: this.fileHandle });
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      } catch (dbError) {
        console.warn('Failed to store file handle in IndexedDB:', dbError);
      }
      
      return true;
    } catch (e) {
      return false;
    }
  }

  // Active task storage
  saveActiveTask(task) {
    localStorage.setItem('activeTask', JSON.stringify(task));
  }

  getActiveTask() {
    const data = localStorage.getItem('activeTask');
    return data ? JSON.parse(data) : null;
  }

  clearActiveTask() {
    localStorage.removeItem('activeTask');
  }

  // History storage
  async getHistory() {
    if (this.fileSystemSupported && this.fileHandle) {
      try {
        const file = await this.fileHandle.getFile();
        const content = await file.text();
        return JSON.parse(content) || [];
      } catch (e) {
        // Fallback to localStorage if file read fails
        return JSON.parse(localStorage.getItem('taskHistory')) || [];
      }
    }
    return JSON.parse(localStorage.getItem('taskHistory')) || [];
  }

  async saveHistory(history) {
    if (this.fileSystemSupported && this.fileHandle) {
      try {
        const writable = await this.fileHandle.createWritable();
        await writable.write(JSON.stringify(history, null, 2));
        await writable.close();
        return true;
      } catch (e) {
        console.warn('File write failed, using localStorage:', e);
      }
    }
    // Fallback to localStorage
    localStorage.setItem('taskHistory', JSON.stringify(history));
    return false;
  }

  async addHistoryEntry(entry) {
    const history = await this.getHistory();
    history.push(entry);
    await this.saveHistory(history);
  }

  async clearHistory() {
    if (this.fileSystemSupported && this.fileHandle) {
      try {
        const writable = await this.fileHandle.createWritable();
        await writable.write('[]');
        await writable.close();
      } catch (e) {
        console.warn('File clear failed, using localStorage:', e);
      }
    }
    localStorage.removeItem('taskHistory');
  }

  // Export/Import functionality
  async exportHistory() {
    const history = await this.getHistory();
    const data = JSON.stringify(history, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'timetracker-history.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  async exportHistoryAsCSV() {
    const history = await this.getHistory();
    const csvContent = this.generateCSVContent(history);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'timetracker-history.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  generateCSVContent(history) {
    // CSV Headers optimized for Excel analysis
    const headers = [
      'Task Name',
      'Category',
      'Start Date',
      'Start Time',
      'End Date',
      'End Time',
      'Duration',
      'Duration (Hours)',
      'Task ID',
      'Entry ID'
    ];

    // Convert history entries to CSV rows
    const rows = history.map(entry => {
      return [
        Utils.escapeCsvField(entry.name),
        Utils.escapeCsvField(Utils.extractCategory(entry.name)),
        Utils.formatDateForCSV(entry.startTs),
        Utils.formatTimeForCSV(entry.startTs),
        Utils.formatDateForCSV(entry.endTs),
        Utils.formatTimeForCSV(entry.endTs),
        Utils.formatDuration(entry.duration),
        Utils.millisecondsToDecimalHours(entry.duration),
        Utils.escapeCsvField(entry.taskId),
        Utils.escapeCsvField(entry.id)
      ];
    });

    // Sort by start date (most recent first)
    rows.sort((a, b) => {
      const dateA = new Date(a[2] + ' ' + a[3]);
      const dateB = new Date(b[2] + ' ' + b[3]);
      return dateB - dateA;
    });

    // Combine headers and rows
    const allRows = [headers, ...rows];

    // Generate CSV content
    return allRows.map(row => row.join(',')).join('\n');
  }

  async importHistory(file) {
    try {
      const text = await file.text();
      
      // Basic size check to prevent DoS
      if (text.length > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('File is too large. Maximum size is 10MB.');
      }
      
      const history = JSON.parse(text);
      
      // Validate the imported data structure
      if (!Array.isArray(history)) {
        throw new Error('Invalid data format: expected an array of history entries');
      }
      
      // Validate each entry
      for (const entry of history) {
        if (!this.validateHistoryEntry(entry)) {
          throw new Error('Invalid history entry found in import data');
        }
      }
      
      await this.saveHistory(history);
      return true;
    } catch (error) {
      throw new Error('Invalid file format: ' + error.message);
    }
  }

  validateHistoryEntry(entry) {
    // Check required fields
    if (!entry || typeof entry !== 'object') return false;
    if (!entry.id || typeof entry.id !== 'string') return false;
    if (!entry.name || typeof entry.name !== 'string') return false;
    if (!entry.startTs || typeof entry.startTs !== 'number') return false;
    if (!entry.endTs || typeof entry.endTs !== 'number') return false;
    if (!entry.duration || typeof entry.duration !== 'number') return false;
    
    // Validate task name security
    if (!Utils.validateTaskNameSecure(entry.name)) return false;
    
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

  // Status information
  getStorageStatus() {
    return {
      fileSystemSupported: this.fileSystemSupported,
      fileHandleActive: !!this.fileHandle,
      storageType: this.fileSystemSupported && this.fileHandle ? 'file' : 'localStorage'
    };
  }
}