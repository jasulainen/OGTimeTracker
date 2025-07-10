// Task Manager Module - Handles business logic for task management
import { Utils } from './utils.js';

export class TaskManager {
  constructor(stateManager, storageManager) {
    this.state = stateManager;
    this.storage = storageManager;
    this.taskRegistry = new Map(); // taskId -> task definition
  }

  // Task operations
  async startTask(taskName, taskId = null) {
    if (!Utils.validateTaskName(taskName)) {
      throw new Error('Task name is required');
    }

    // Save current task to history if exists
    const currentTask = this.state.getCurrentTask();
    if (currentTask) {
      await this.completeCurrentTask();
    }

    // Find or create task definition
    const taskDef = this.findOrCreateTaskDefinition(taskName, taskId);

    // Create new active task instance - must have all required fields
    const now = Utils.now();
    const newTask = {
      id: Utils.generateTaskId(),
      taskId: taskDef.id,
      name: taskDef.name,
      startTs: now,
      lastNotifTs: now
    };

    // Validate task structure
    if (!newTask.id || !newTask.taskId || !newTask.name) {
      throw new Error('Invalid task structure: missing required fields');
    }

    // Update state and storage
    this.state.setCurrentTask(newTask);
    this.storage.saveActiveTask(newTask);
  }

  async switchTask(newTaskName, taskId = null) {
    if (!Utils.validateTaskName(newTaskName)) {
      throw new Error('New task name is required');
    }

    await this.startTask(newTaskName, taskId);
  }

  async completeCurrentTask() {
    const currentTask = this.state.getCurrentTask();
    if (!currentTask) return;

    // Validate current task has required fields
    if (!currentTask.id || !currentTask.taskId || !currentTask.name) {
      throw new Error('Invalid current task: missing required fields');
    }

    const now = Utils.now();
    const historyEntry = {
      id: Utils.generateHistoryId(),
      taskId: currentTask.taskId,
      name: currentTask.name,
      startTs: currentTask.startTs,
      endTs: now,
      duration: now - currentTask.startTs
    };

    // Validate history entry structure
    if (!historyEntry.id || !historyEntry.taskId || !historyEntry.name) {
      throw new Error('Invalid history entry: missing required fields');
    }

    // Add to history
    await this.storage.addHistoryEntry(historyEntry);
    this.state.addHistoryEntry(historyEntry);

    // Clear current task
    this.state.setCurrentTask(null);
    this.storage.clearActiveTask();
  }

  async stopTracking() {
    await this.completeCurrentTask();
  }

  // Task registry methods
  findOrCreateTaskDefinition(taskName, taskId = null) {
    const normalizedName = Utils.normalizeTaskName(taskName);
    
    // If taskId is provided, use it directly
    if (taskId && this.taskRegistry.has(taskId)) {
      return this.taskRegistry.get(taskId);
    }
    
    // Look for existing task by normalized name
    for (const [id, taskDef] of this.taskRegistry) {
      if (Utils.normalizeTaskName(taskDef.name) === normalizedName) {
        return taskDef;
      }
    }
    
    // Create new task definition - must have all required fields
    const newTaskDef = {
      id: taskId || Utils.generateTaskId(),
      name: taskName.trim(),
      normalizedName: normalizedName,
      slug: Utils.createTaskSlug(taskName),
      createdAt: Utils.now(),
      updatedAt: Utils.now()
    };
    
    // Validate task definition structure
    if (!newTaskDef.id || !newTaskDef.name || !newTaskDef.normalizedName) {
      throw new Error('Invalid task definition: missing required fields');
    }
    
    this.taskRegistry.set(newTaskDef.id, newTaskDef);
    return newTaskDef;
  }

  getTaskDefinition(taskId) {
    return this.taskRegistry.get(taskId);
  }

  getAllTaskDefinitions() {
    return Array.from(this.taskRegistry.values());
  }

  updateTaskDefinition(taskId, updates) {
    const taskDef = this.taskRegistry.get(taskId);
    if (taskDef) {
      Object.assign(taskDef, updates, { updatedAt: Utils.now() });
      this.taskRegistry.set(taskId, taskDef);
    }
    return taskDef;
  }

  // History operations
  async refreshHistory() {
    const history = await this.storage.getHistory();
    this.state.setHistory(history);
  }

  async clearHistory() {
    await this.storage.clearHistory();
    this.state.clearHistory();
  }

  async exportHistory() {
    await this.storage.exportHistory();
  }

  async exportHistoryAsCSV() {
    await this.storage.exportHistoryAsCSV();
  }

  async importHistory(file) {
    try {
      await this.storage.importHistory(file);
      await this.refreshHistory();
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Notification helpers
  updateNotificationTimestamp() {
    const currentTask = this.state.getCurrentTask();
    if (currentTask) {
      currentTask.lastNotifTs = Date.now();
      this.state.setCurrentTask(currentTask);
      this.storage.saveActiveTask(currentTask);
    }
  }

  shouldShowNotification() {
    const currentTask = this.state.getCurrentTask();
    if (!currentTask) return false;

    const now = Date.now();
    return (now - currentTask.lastNotifTs) >= 60 * 1000; // 1 minute
  }


  getCurrentTaskSummary() {
    const currentTask = this.state.getCurrentTask();
    if (!currentTask) return null;

    return {
      name: currentTask.name,
      startTime: new Date(currentTask.startTs),
      elapsed: Date.now() - currentTask.startTs,
      elapsedFormatted: Utils.formatDuration(Date.now() - currentTask.startTs)
    };
  }

  getHistorySummary() {
    const history = this.state.getHistory();
    
    if (history.length === 0) {
      return {
        totalEntries: 0,
        totalTime: 0,
        totalTimeFormatted: '0s'
      };
    }

    const totalTime = history.reduce((sum, entry) => sum + entry.duration, 0);
    
    return {
      totalEntries: history.length,
      totalTime,
      totalTimeFormatted: Utils.formatDuration(totalTime),
      mostRecentTask: history[history.length - 1]?.name
    };
  }

  // File system operations
  async setupDataFile() {
    const success = await this.storage.setupDataFile();
    if (success) {
      const status = this.storage.getStorageStatus();
      this.state.setStorageStatus(status);
    }
    return success;
  }

  // Autocomplete support methods
  getUniqueTaskDefinitions() {
    const taskDefs = this.getAllTaskDefinitions();
    return taskDefs.sort((a, b) => a.name.localeCompare(b.name));
  }

  getTaskSuggestions(input) {
    if (!input || input.trim().length === 0) {
      return [];
    }
    
    const taskDefs = this.getUniqueTaskDefinitions();
    const normalizedInput = Utils.normalizeTaskName(input);
    
    return taskDefs.filter(taskDef => 
      taskDef.normalizedName.includes(normalizedInput) ||
      taskDef.slug.includes(normalizedInput)
    ).slice(0, 8); // Limit to 8 suggestions for performance
  }


  // Get aggregated time data for a task ID
  getTaskAggregatedTimeById(taskId) {
    const history = this.state.getHistory();
    const entries = history.filter(entry => entry.taskId === taskId);
    const taskDef = this.getTaskDefinition(taskId);
    
    if (entries.length === 0) {
      return {
        taskId,
        taskName: taskDef?.name || 'Unknown',
        totalTime: 0,
        totalTimeFormatted: '0s',
        sessionCount: 0,
        lastWorked: null
      };
    }
    
    const totalTime = entries.reduce((sum, entry) => sum + entry.duration, 0);
    const lastWorked = Math.max(...entries.map(entry => entry.endTs));
    
    return {
      taskId,
      taskName: taskDef?.name || entries[0]?.name || 'Unknown',
      totalTime,
      totalTimeFormatted: Utils.formatDuration(totalTime),
      sessionCount: entries.length,
      lastWorked: new Date(lastWorked)
    };
  }


  // Get all tasks with aggregated time data
  getAggregatedTaskSummary() {
    const taskDefs = this.getAllTaskDefinitions();
    
    return taskDefs.map(taskDef => this.getTaskAggregatedTimeById(taskDef.id))
      .sort((a, b) => b.totalTime - a.totalTime); // Sort by total time descending
  }

  // Initialization
  async initialize() {
    await this.storage.init();
    await this.state.loadFromStorage(this.storage);
    this.buildTaskRegistryFromHistory();
  }

  // Build task registry from history data (repair entries missing taskId)
  buildTaskRegistryFromHistory() {
    const history = this.state.getHistory();
    const taskNameMap = new Map();
    let historyModified = false;
    
    // Process history entries - repair missing taskId
    history.forEach(entry => {
      if (!entry.id) {
        throw new Error('Invalid history entry: missing required id');
      }
      
      // If missing taskId, assign one based on task name
      if (!entry.taskId) {
        const normalizedName = Utils.normalizeTaskName(entry.name);
        
        // Check if we already have a taskId for this normalized name
        if (taskNameMap.has(normalizedName)) {
          entry.taskId = taskNameMap.get(normalizedName);
        } else {
          // Create new taskId for this name
          entry.taskId = Utils.generateTaskId();
          taskNameMap.set(normalizedName, entry.taskId);
        }
        
        historyModified = true;
        console.log(`Repaired history entry: assigned taskId ${entry.taskId} to "${entry.name}"`);
      }
      
      // Add to registry if not already present
      if (!this.taskRegistry.has(entry.taskId)) {
        this.taskRegistry.set(entry.taskId, {
          id: entry.taskId,
          name: entry.name,
          normalizedName: Utils.normalizeTaskName(entry.name),
          slug: Utils.createTaskSlug(entry.name),
          createdAt: entry.startTs,
          updatedAt: entry.endTs
        });
      }
    });
    
    // Save repaired history if any modifications were made
    if (historyModified) {
      this.state.setHistory(history);
      this.storage.saveHistory(history);
      console.log('History repaired and saved');
    }
  }
}