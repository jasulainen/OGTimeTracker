// Autocomplete Module - Handles task name suggestions and filtering
export class AutocompleteManager {
  constructor() {
    this.suggestions = [];
    this.visible = false;
    this.selectedIndex = -1;
    this.inputElement = null;
    this.dropdownElement = null;
    this.onSelect = null;
  }

  // Initialize autocomplete with input element and selection callback
  init(inputElement, dropdownElement, onSelectCallback) {
    this.inputElement = inputElement;
    this.dropdownElement = dropdownElement;
    this.onSelect = onSelectCallback;
    this.attachEventListeners();
  }

  // Extract unique task definitions from task manager
  updateSuggestions(taskManager) {
    this.suggestions = taskManager.getUniqueTaskDefinitions();
  }

  // Get filtered suggestions based on input
  getFilteredSuggestions(input) {
    if (!input || input.trim().length === 0) {
      return [];
    }
    
    const normalizedInput = input.toLowerCase().trim();
    
    return this.suggestions.filter(taskDef => 
      taskDef.normalizedName.includes(normalizedInput) ||
      taskDef.slug.includes(normalizedInput)
    ).slice(0, 8); // Limit to 8 suggestions for performance
  }

  // Show autocomplete dropdown
  show(filteredSuggestions) {
    if (filteredSuggestions.length === 0) {
      this.hide();
      return;
    }
    
    this.visible = true;
    this.selectedIndex = -1;
    this.renderDropdown(filteredSuggestions);
    this.positionDropdown();
  }

  // Hide autocomplete dropdown
  hide() {
    this.visible = false;
    this.selectedIndex = -1;
    this.dropdownElement.style.display = 'none';
  }

  // Render dropdown with suggestions
  renderDropdown(suggestions) {
    this.dropdownElement.innerHTML = '';
    
    suggestions.forEach((taskDef, index) => {
      const item = document.createElement('div');
      item.className = 'autocomplete-item px-4 py-2 cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-b-0';
      item.textContent = taskDef.name;
      item.dataset.index = index;
      item.dataset.taskId = taskDef.id;
      
      // Add click handler
      item.addEventListener('click', () => {
        this.selectSuggestion(taskDef);
      });
      
      this.dropdownElement.appendChild(item);
    });
    
    this.dropdownElement.style.display = 'block';
  }

  // Position dropdown relative to input
  positionDropdown() {
    // Since the dropdown is already inside a relative container with the input,
    // we just need to position it relative to the input's height and width
    this.dropdownElement.style.position = 'absolute';
    this.dropdownElement.style.top = `${this.inputElement.offsetHeight}px`;
    this.dropdownElement.style.left = '0px';
    this.dropdownElement.style.width = `${this.inputElement.offsetWidth}px`;
    this.dropdownElement.style.maxHeight = '200px';
    this.dropdownElement.style.overflowY = 'auto';
    this.dropdownElement.style.zIndex = '1000';
  }

  // Handle keyboard navigation
  handleKeyDown(event) {
    if (!this.visible) return false;
    
    const items = this.dropdownElement.querySelectorAll('.autocomplete-item');
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, items.length - 1);
        this.updateSelection(items);
        return true;
        
      case 'ArrowUp':
        event.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
        this.updateSelection(items);
        return true;
        
      case 'Enter':
        event.preventDefault();
        if (this.selectedIndex >= 0 && items[this.selectedIndex]) {
          const selectedItem = items[this.selectedIndex];
          const taskId = selectedItem.dataset.taskId;
          const taskName = selectedItem.textContent;
          this.selectSuggestion({ id: taskId, name: taskName });
        }
        return true;
        
      case 'Escape':
        event.preventDefault();
        this.hide();
        return true;
        
      default:
        return false;
    }
  }

  // Update visual selection in dropdown
  updateSelection(items) {
    items.forEach((item, index) => {
      if (index === this.selectedIndex) {
        item.classList.add('bg-blue-100');
      } else {
        item.classList.remove('bg-blue-100');
      }
    });
  }

  // Select a suggestion
  selectSuggestion(taskDef) {
    this.inputElement.value = taskDef.name;
    this.hide();
    
    if (this.onSelect) {
      this.onSelect(taskDef);
    }
  }

  // Attach event listeners
  attachEventListeners() {
    if (!this.inputElement) return;
    
    // Input event for filtering
    this.inputElement.addEventListener('input', (event) => {
      const input = event.target.value;
      const filtered = this.getFilteredSuggestions(input);
      
      if (filtered.length > 0) {
        this.show(filtered);
      } else {
        this.hide();
      }
    });
    
    // Focus event
    this.inputElement.addEventListener('focus', () => {
      const input = this.inputElement.value;
      if (input) {
        const filtered = this.getFilteredSuggestions(input);
        if (filtered.length > 0) {
          this.show(filtered);
        }
      }
    });
    
    // Keydown event for navigation
    this.inputElement.addEventListener('keydown', (event) => {
      this.handleKeyDown(event);
    });
    
    // Click outside to close
    document.addEventListener('click', (event) => {
      if (!this.inputElement.contains(event.target) && 
          !this.dropdownElement.contains(event.target)) {
        this.hide();
      }
    });
  }

  // Get current suggestions for external use
  getCurrentSuggestions() {
    return this.suggestions;
  }

  // Check if dropdown is visible
  isVisible() {
    return this.visible;
  }
}