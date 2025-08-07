// UI Components Module - Handles all UI rendering and DOM manipulation
import { Utils } from './utils.js';

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
      aboutTab: document.getElementById('aboutTab'),
      trackingContent: document.getElementById('trackingContent'),
      preferencesContent: document.getElementById('preferencesContent'),
      aboutContent: document.getElementById('aboutContent'),
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
    const elapsed = Date.now() - task.startTs;
    const formattedTime = Utils.formatDuration(elapsed);
    
    // Clear existing content
    this.elements.status.innerHTML = '';
    
    // Create secure DOM structure
    const container = document.createElement('div');
    container.className = 'bg-white rounded-xl card-shadow p-6 animate-fade-in';
    
    // Header section
    const header = document.createElement('div');
    header.className = 'flex items-center justify-between mb-4';
    
    const headerTitle = document.createElement('h3');
    headerTitle.className = 'text-lg font-semibold text-gray-800';
    headerTitle.textContent = 'Currently Working On';
    
    const statusIndicator = document.createElement('div');
    statusIndicator.className = 'flex items-center space-x-2';
    
    const statusDot = document.createElement('div');
    statusDot.className = 'w-3 h-3 bg-green-500 rounded-full animate-pulse';
    
    const statusText = document.createElement('span');
    statusText.className = 'text-sm font-medium text-green-600';
    statusText.textContent = 'Active';
    
    statusIndicator.appendChild(statusDot);
    statusIndicator.appendChild(statusText);
    header.appendChild(headerTitle);
    header.appendChild(statusIndicator);
    
    // Task info section
    const taskInfo = document.createElement('div');
    taskInfo.className = 'bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4';
    
    const taskContainer = document.createElement('div');
    taskContainer.className = 'flex items-center justify-between';
    
    const taskLeft = document.createElement('div');
    taskLeft.className = 'flex items-center space-x-3';
    
    const taskIcon = document.createElement('div');
    taskIcon.className = 'w-10 h-10 bg-primary rounded-full flex items-center justify-center';
    
    // Create SVG element securely
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'w-5 h-5 text-white');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('viewBox', '0 0 24 24');
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('d', 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2');
    
    svg.appendChild(path);
    taskIcon.appendChild(svg);
    
    const taskDetails = document.createElement('div');
    
    const taskName = document.createElement('p');
    taskName.className = 'text-lg font-medium text-gray-900';
    taskName.textContent = Utils.escapeHtml(task.name); // Secure task name display
    
    const taskStartTime = document.createElement('p');
    taskStartTime.className = 'text-sm text-gray-500';
    taskStartTime.textContent = `Started at ${new Date(task.startTs).toLocaleTimeString()}`;
    
    taskDetails.appendChild(taskName);
    taskDetails.appendChild(taskStartTime);
    
    const timeDisplay = document.createElement('div');
    timeDisplay.className = 'text-right';
    
    const elapsedTime = document.createElement('p');
    elapsedTime.id = 'elapsed-time';
    elapsedTime.className = 'text-2xl font-bold text-primary';
    elapsedTime.textContent = formattedTime;
    
    const elapsedLabel = document.createElement('p');
    elapsedLabel.className = 'text-sm text-gray-500';
    elapsedLabel.textContent = 'elapsed';
    
    timeDisplay.appendChild(elapsedTime);
    timeDisplay.appendChild(elapsedLabel);
    
    taskLeft.appendChild(taskIcon);
    taskLeft.appendChild(taskDetails);
    taskContainer.appendChild(taskLeft);
    taskContainer.appendChild(timeDisplay);
    taskInfo.appendChild(taskContainer);
    
    // Tip section
    const tipSection = document.createElement('div');
    tipSection.className = 'bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4';
    
    const tipText = document.createElement('p');
    tipText.className = 'text-sm text-yellow-800';
    
    // Create tip content securely
    const tipIcon = document.createTextNode('💡 ');
    const tipStrong = document.createElement('strong');
    tipStrong.textContent = 'Tip:';
    const tipMessage = document.createTextNode(' You\'ll get notifications asking if you\'re still working on this task (configurable in Preferences)');
    
    tipText.appendChild(tipIcon);
    tipText.appendChild(tipStrong);
    tipText.appendChild(tipMessage);
    
    tipSection.appendChild(tipText);
    
    // Stop button section
    const buttonSection = document.createElement('div');
    buttonSection.className = 'flex justify-center';
    
    const stopBtn = document.createElement('button');
    stopBtn.id = 'stopBtn';
    stopBtn.className = 'px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all font-medium text-lg';
    stopBtn.textContent = '🛑 Stop Tracking';
    
    // Set up stop button event listener
    stopBtn.onclick = () => {
      // Dispatch custom event to be handled by app controller
      const stopEvent = new CustomEvent('stopTask');
      document.dispatchEvent(stopEvent);
    };
    
    buttonSection.appendChild(stopBtn);
    
    // Assemble everything
    container.appendChild(header);
    container.appendChild(taskInfo);
    container.appendChild(tipSection);
    container.appendChild(buttonSection);
    
    this.elements.status.appendChild(container);
  }

  updateActiveTaskTime(task) {
    const timeElement = document.getElementById('elapsed-time');
    if (timeElement) {
      const elapsed = Date.now() - task.startTs;
      const formattedTime = Utils.formatDuration(elapsed);
      timeElement.textContent = formattedTime;
    }
  }

  // File status display
  renderFileStatus(storageStatus) {
    const { fileSystemSupported, fileHandleActive } = storageStatus;

    // Clear existing content
    this.elements.fileStatus.innerHTML = '';

    // Create container div
    const container = document.createElement('div');
    container.className = 'flex items-center space-x-2';

    // Create status dot
    const statusDot = document.createElement('div');
    statusDot.className = 'w-2 h-2 rounded-full';

    // Create status text
    const statusText = document.createElement('span');
    statusText.className = 'font-medium';

    if (fileSystemSupported && fileHandleActive) {
      statusDot.classList.add('bg-green-500');
      statusText.className += ' text-green-700';
      statusText.textContent = 'Using file system storage';
      this.elements.fileStatus.className = 'text-sm mb-4 p-3 rounded-lg bg-green-50 border-l-4 border-green-500';
      this.elements.setupFileBtn.textContent = '📁 Change Data File';
    } else if (fileSystemSupported) {
      statusDot.classList.add('bg-yellow-500');
      statusText.className += ' text-yellow-700';
      statusText.textContent = 'File system supported - click "Setup Data File" to enable';
      this.elements.fileStatus.className = 'text-sm mb-4 p-3 rounded-lg bg-yellow-50 border-l-4 border-yellow-500';
      this.elements.setupFileBtn.textContent = '📁 Setup Data File';
    } else {
      statusDot.classList.add('bg-gray-500');
      statusText.className += ' text-gray-700';
      statusText.textContent = 'Using browser storage (File System API not supported)';
      this.elements.fileStatus.className = 'text-sm mb-4 p-3 rounded-lg bg-gray-50 border-l-4 border-gray-500';
      this.elements.setupFileBtn.style.display = 'none';
    }

    container.appendChild(statusDot);
    container.appendChild(statusText);
    this.elements.fileStatus.appendChild(container);
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
      
      // Create empty state row securely
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.setAttribute('colspan', '4');
      cell.className = 'px-6 py-12 text-center text-gray-500';
      
      const container = document.createElement('div');
      container.className = 'flex flex-col items-center';
      
      // Create SVG icon securely
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'w-16 h-16 mb-4 text-gray-300');
      svg.setAttribute('fill', 'none');
      svg.setAttribute('stroke', 'currentColor');
      svg.setAttribute('viewBox', '0 0 24 24');
      
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');
      path.setAttribute('stroke-width', '2');
      path.setAttribute('d', 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z');
      
      svg.appendChild(path);
      
      const mainMessage = document.createElement('p');
      mainMessage.className = 'text-lg font-medium';
      mainMessage.textContent = emptyMessage;
      
      const subMessage = document.createElement('p');
      subMessage.className = 'text-sm';
      subMessage.textContent = emptySubMessage;
      
      container.appendChild(svg);
      container.appendChild(mainMessage);
      container.appendChild(subMessage);
      cell.appendChild(container);
      row.appendChild(cell);
      this.elements.historyBody.appendChild(row);
      return;
    }
    
    // Sort entries by start time (most recent first)
    const sortedHistory = history.slice().sort((a, b) => b.startTs - a.startTs);
    
    sortedHistory.forEach(entry => {
      const row = document.createElement('tr');
      row.className = 'table-row-hover transition-all duration-300';
      
      const startTime = new Date(entry.startTs).toLocaleString();
      const endTime = new Date(entry.endTs).toLocaleString();
      const duration = Utils.formatDuration(entry.duration);
      
      // Validate entry has required fields
      if (!entry.id || !entry.taskId || !entry.name) {
        console.error('Invalid history entry:', entry);
        return; // Skip invalid entries
      }

      // Create secure table cells using DOM manipulation
      const taskCell = document.createElement('td');
      taskCell.className = 'px-6 py-4 whitespace-nowrap';
      
      const taskContainer = document.createElement('div');
      taskContainer.className = 'flex items-center';
      
      const taskDot = document.createElement('div');
      taskDot.className = 'w-2 h-2 bg-primary rounded-full mr-3';
      
      const taskInfo = document.createElement('div');
      
      const taskName = document.createElement('span');
      taskName.className = 'text-sm font-medium text-gray-900';
      taskName.textContent = Utils.escapeHtml(entry.name); // Secure task name display
      
      const taskId = document.createElement('span');
      taskId.className = 'text-xs text-gray-400';
      taskId.textContent = `ID: ${entry.taskId.substring(0, 8)}...`;
      
      const lineBreak = document.createElement('br');
      
      taskInfo.appendChild(taskName);
      taskInfo.appendChild(lineBreak);
      taskInfo.appendChild(taskId);
      taskContainer.appendChild(taskDot);
      taskContainer.appendChild(taskInfo);
      taskCell.appendChild(taskContainer);
      
      const startTimeCell = document.createElement('td');
      startTimeCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-500';
      startTimeCell.textContent = startTime;
      
      const endTimeCell = document.createElement('td');
      endTimeCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-500';
      endTimeCell.textContent = endTime;
      
      const durationCell = document.createElement('td');
      durationCell.className = 'px-6 py-4 whitespace-nowrap';
      
      const durationBadge = document.createElement('span');
      durationBadge.className = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800';
      durationBadge.textContent = duration;
      
      durationCell.appendChild(durationBadge);
      
      row.appendChild(taskCell);
      row.appendChild(startTimeCell);
      row.appendChild(endTimeCell);
      row.appendChild(durationCell);
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

  // Utility methods - duration formatting moved to Utils module

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