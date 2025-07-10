// UI Components Module - Handles all UI rendering and DOM manipulation
export class UIComponents {
  constructor() {
    this.elements = this.initializeElements();
  }

  initializeElements() {
    return {
      taskName: document.getElementById('taskName'),
      startBtn: document.getElementById('startBtn'),
      stopBtn: document.getElementById('stopBtn'),
      status: document.getElementById('status'),
      setupFileBtn: document.getElementById('setupFileBtn'),
      exportDropdownBtn: document.getElementById('exportDropdownBtn'),
      exportDropdown: document.getElementById('exportDropdown'),
      exportJsonBtn: document.getElementById('exportJsonBtn'),
      exportCsvBtn: document.getElementById('exportCsvBtn'),
      importBtn: document.getElementById('importBtn'),
      clearHistoryBtn: document.getElementById('clearHistoryBtn'),
      fileStatus: document.getElementById('fileStatus'),
      historyBody: document.getElementById('historyBody'),
      autocompleteDropdown: document.getElementById('autocompleteDropdown'),
      // Date navigation elements
      prevDateBtn: document.getElementById('prevDateBtn'),
      nextDateBtn: document.getElementById('nextDateBtn'),
      todayBtn: document.getElementById('todayBtn'),
      datePicker: document.getElementById('datePicker'),
      selectedDateDisplay: document.getElementById('selectedDateDisplay'),
      dailyTotal: document.getElementById('dailyTotal'),
      dailyTaskCount: document.getElementById('dailyTaskCount'),
      // Tab elements
      trackingTab: document.getElementById('trackingTab'),
      preferencesTab: document.getElementById('preferencesTab'),
      trackingContent: document.getElementById('trackingContent'),
      preferencesContent: document.getElementById('preferencesContent'),
      // Preferences elements
      notificationInterval: document.getElementById('notificationInterval'),
      intervalDisplay: document.getElementById('intervalDisplay'),
      savePreferences: document.getElementById('savePreferences'),
      resetPreferences: document.getElementById('resetPreferences'),
      preferencesMessage: document.getElementById('preferencesMessage'),
      preferencesMessageText: document.getElementById('preferencesMessageText')
    };
  }

  // Task input controls - now always visible
  showTaskInput() {
    // Input is always visible, no need to change display
    this.elements.taskName.style.display = '';
    this.elements.startBtn.style.display = '';
  }

  hideTaskInput() {
    // Input remains visible all the time - no-op
  }

  getTaskName() {
    return this.elements.taskName.value.trim();
  }

  clearTaskName() {
    this.elements.taskName.value = '';
  }

  // Status display
  clearStatus() {
    this.elements.status.innerHTML = '';
  }

  renderActiveTask(task) {
    const elapsed = Math.floor((Date.now() - task.startTs) / 1000);
    const formattedTime = this.formatDuration(elapsed * 1000);
    
    this.elements.status.innerHTML = `
      <div class="bg-white rounded-xl card-shadow p-6 animate-fade-in">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">Currently Working On</h3>
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span class="text-sm font-medium text-green-600">Active</span>
          </div>
        </div>
        
        <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <div>
                <p class="text-lg font-medium text-gray-900">${task.name}</p>
                <p class="text-sm text-gray-500">Started at ${new Date(task.startTs).toLocaleTimeString()}</p>
              </div>
            </div>
            <div class="text-right">
              <p id="elapsed-time" class="text-2xl font-bold text-primary">${formattedTime}</p>
              <p class="text-sm text-gray-500">elapsed</p>
            </div>
          </div>
        </div>
        
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <p class="text-sm text-yellow-800">
            💡 <strong>Tip:</strong> You'll get notifications asking if you're still working on this task (configurable in Preferences)
          </p>
        </div>
        
        <div class="flex justify-center">
          <button 
            id="stopBtn"
            class="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all font-medium text-lg"
          >
            🛑 Stop Tracking
          </button>
        </div>
      </div>
    `;
    
    // Set up stop button event listener
    const stopBtn = document.getElementById('stopBtn');
    if (stopBtn) {
      stopBtn.onclick = () => {
        // Dispatch custom event to be handled by app controller
        const stopEvent = new CustomEvent('stopTask');
        document.dispatchEvent(stopEvent);
      };
    }
  }

  updateActiveTaskTime(task) {
    const timeElement = document.getElementById('elapsed-time');
    if (timeElement) {
      const elapsed = Math.floor((Date.now() - task.startTs) / 1000);
      const formattedTime = this.formatDuration(elapsed * 1000);
      timeElement.textContent = formattedTime;
    }
  }

  // File status display
  renderFileStatus(storageStatus) {
    const { fileSystemSupported, fileHandleActive } = storageStatus;

    if (fileSystemSupported && fileHandleActive) {
      this.elements.fileStatus.innerHTML = `
        <div class="flex items-center space-x-2">
          <div class="w-2 h-2 bg-green-500 rounded-full"></div>
          <span class="text-green-700 font-medium">Using file system storage</span>
        </div>
      `;
      this.elements.fileStatus.className = 'text-sm mb-4 p-3 rounded-lg bg-green-50 border-l-4 border-green-500';
      this.elements.setupFileBtn.textContent = '📁 Change Data File';
    } else if (fileSystemSupported) {
      this.elements.fileStatus.innerHTML = `
        <div class="flex items-center space-x-2">
          <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <span class="text-yellow-700 font-medium">File system supported - click "Setup Data File" to enable</span>
        </div>
      `;
      this.elements.fileStatus.className = 'text-sm mb-4 p-3 rounded-lg bg-yellow-50 border-l-4 border-yellow-500';
      this.elements.setupFileBtn.textContent = '📁 Setup Data File';
    } else {
      this.elements.fileStatus.innerHTML = `
        <div class="flex items-center space-x-2">
          <div class="w-2 h-2 bg-gray-500 rounded-full"></div>
          <span class="text-gray-700 font-medium">Using browser storage (File System API not supported)</span>
        </div>
      `;
      this.elements.fileStatus.className = 'text-sm mb-4 p-3 rounded-lg bg-gray-50 border-l-4 border-gray-500';
      this.elements.setupFileBtn.style.display = 'none';
    }
  }

  // History table rendering (now supports filtered entries)
  renderHistory(history, selectedDate = null) {
    this.elements.historyBody.innerHTML = '';
    
    if (history.length === 0) {
      const isDateFiltered = selectedDate !== null;
      const emptyMessage = isDateFiltered 
        ? `No entries for ${selectedDate}`
        : 'No history yet';
      const emptySubMessage = isDateFiltered 
        ? 'Try selecting a different date or browse your history'
        : 'Start tracking your first task to see history here';
      
      this.elements.historyBody.innerHTML = `
        <tr>
          <td colspan="4" class="px-6 py-12 text-center text-gray-500">
            <div class="flex flex-col items-center">
              <svg class="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p class="text-lg font-medium">${emptyMessage}</p>
              <p class="text-sm">${emptySubMessage}</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }
    
    // Sort entries by start time (most recent first)
    const sortedHistory = history.slice().sort((a, b) => b.startTs - a.startTs);
    
    sortedHistory.forEach(entry => {
      const row = document.createElement('tr');
      row.className = 'table-row-hover transition-all duration-300';
      
      const startTime = new Date(entry.startTs).toLocaleString();
      const endTime = new Date(entry.endTs).toLocaleString();
      const duration = this.formatDuration(entry.duration);
      
      // Validate entry has required fields
      if (!entry.id || !entry.taskId || !entry.name) {
        console.error('Invalid history entry:', entry);
        return; // Skip invalid entries
      }

      row.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="flex items-center">
            <div class="w-2 h-2 bg-primary rounded-full mr-3"></div>
            <div>
              <span class="text-sm font-medium text-gray-900">${entry.name}</span>
              <br><span class="text-xs text-gray-400">ID: ${entry.taskId.substring(0, 8)}...</span>
            </div>
          </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${startTime}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${endTime}</td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ${duration}
          </span>
        </td>
      `;
      this.elements.historyBody.appendChild(row);
    });
  }

  // Update date navigation UI
  updateDateNavigation(selectedDate, dateFilter) {
    // Update date picker value
    this.elements.datePicker.value = dateFilter.formatDateForInput(selectedDate);
    
    // Update selected date display
    this.elements.selectedDateDisplay.textContent = dateFilter.formatDateForDisplay(selectedDate);
    
    // Update navigation button states
    const today = new Date();
    const isToday = dateFilter.isSameDate(selectedDate, today);
    const isFuture = dateFilter.isFuture(selectedDate);
    
    // Disable next button if trying to go to future dates
    this.elements.nextDateBtn.disabled = isFuture;
    this.elements.nextDateBtn.classList.toggle('opacity-50', isFuture);
    this.elements.nextDateBtn.classList.toggle('cursor-not-allowed', isFuture);
    
    // Update today button state
    this.elements.todayBtn.disabled = isToday;
    this.elements.todayBtn.classList.toggle('opacity-50', isToday);
    this.elements.todayBtn.classList.toggle('cursor-not-allowed', isToday);
  }

  // Update daily summary
  updateDailySummary(summary) {
    this.elements.dailyTotal.textContent = summary.totalTimeFormatted;
    this.elements.dailyTaskCount.textContent = summary.taskCount;
  }

  // Get date navigation elements for event listeners
  getDateNavigationElements() {
    return {
      prevDateBtn: this.elements.prevDateBtn,
      nextDateBtn: this.elements.nextDateBtn,
      todayBtn: this.elements.todayBtn,
      datePicker: this.elements.datePicker
    };
  }

  // Utility methods
  formatDuration(ms) {
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

  // User feedback
  showAlert(message) {
    alert(message);
  }

  showSuccess(message) {
    alert(message);
  }

  showError(message) {
    alert(message);
  }

  // Autocomplete support methods
  getAutocompleteDropdown() {
    return this.elements.autocompleteDropdown;
  }

  // Enhanced task input focus for autocomplete
  focusTaskInput() {
    if (this.elements.taskName) {
      this.elements.taskName.focus();
    }
  }

  // Get task input element for autocomplete integration
  getTaskInputElement() {
    return this.elements.taskName;
  }

  // Create autocomplete dropdown if it doesn't exist
  ensureAutocompleteDropdown() {
    if (!this.elements.autocompleteDropdown) {
      // Create dropdown element
      const dropdown = document.createElement('div');
      dropdown.id = 'autocompleteDropdown';
      dropdown.className = 'autocomplete-dropdown bg-white border border-gray-200 rounded-lg shadow-lg';
      dropdown.style.display = 'none';
      dropdown.style.position = 'absolute';
      dropdown.style.zIndex = '1000';
      
      // Insert after task input
      const taskInput = this.elements.taskName;
      if (taskInput && taskInput.parentNode) {
        taskInput.parentNode.insertBefore(dropdown, taskInput.nextSibling);
      }
      
      // Update elements reference
      this.elements.autocompleteDropdown = dropdown;
    }
    
    return this.elements.autocompleteDropdown;
  }
}