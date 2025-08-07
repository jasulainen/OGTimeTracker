// File Controller - Handles file management operations (import/export/setup)
export class FileController {
  constructor(taskManager, ui) {
    this.taskManager = taskManager;
    this.ui = ui;
    this.isInitialized = false;
  }

  initialize() {
    if (this.isInitialized) return;
    
    this.setupFileEventListeners();
    this.isInitialized = true;
  }

  setupFileEventListeners() {
    // File management events
    this.ui.elements.setupFileBtn.onclick = () => this.handleSetupFile();
    this.ui.elements.exportDropdownBtn.onclick = () => this.toggleExportDropdown();
    this.ui.elements.exportJsonBtn.onclick = () => this.handleExportJSON();
    this.ui.elements.exportCsvBtn.onclick = () => this.handleExportCSV();
    this.ui.elements.importBtn.onclick = () => this.handleImport();
    this.ui.elements.clearHistoryBtn.onclick = () => this.handleClearHistory();
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
      if (!event.target.closest('.relative')) {
        this.closeExportDropdown();
      }
    });
  }

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
}