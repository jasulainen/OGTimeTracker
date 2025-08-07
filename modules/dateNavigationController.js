// Date Navigation Controller - Handles date navigation and filtering logic
export class DateNavigationController {
  constructor(dateFilter, stateManager, ui) {
    this.dateFilter = dateFilter;
    this.state = stateManager;
    this.ui = ui;
    this.isInitialized = false;
  }

  initialize() {
    if (this.isInitialized) return;
    
    this.setupDateNavigation();
    this.isInitialized = true;
  }

  setupDateNavigation() {
    const { prevDateBtn, nextDateBtn, todayBtn, datePicker } = this.ui.getDateNavigationElements();
    
    // Previous date button
    prevDateBtn.addEventListener('click', () => {
      this.handlePrevDate();
    });
    
    // Next date button
    nextDateBtn.addEventListener('click', () => {
      this.handleNextDate();
    });
    
    // Today button
    todayBtn.addEventListener('click', () => {
      this.handleTodayClick();
    });
    
    // Date picker
    datePicker.addEventListener('change', (event) => {
      this.handleDateChange(event.target.value);
    });
    
    // Initialize with current date
    this.dateFilter.setCurrentDate(new Date());
    this.updateDateView();
  }

  handlePrevDate() {
    const prevDate = this.dateFilter.getPreviousDate();
    this.dateFilter.setCurrentDate(prevDate);
    this.updateDateView();
  }

  handleNextDate() {
    const nextDate = this.dateFilter.getNextDate();
    // Don't allow navigation to future dates
    if (!this.dateFilter.isFuture(nextDate)) {
      this.dateFilter.setCurrentDate(nextDate);
      this.updateDateView();
    }
  }

  handleTodayClick() {
    this.dateFilter.setCurrentDate(new Date());
    this.updateDateView();
  }

  handleDateChange(dateString) {
    const selectedDate = this.dateFilter.parseDateFromInput(dateString);
    this.dateFilter.setCurrentDate(selectedDate);
    this.updateDateView();
  }

  updateDateView() {
    const selectedDate = this.dateFilter.getSelectedDate();
    const allHistory = this.state.getHistory();
    
    // Filter history for selected date
    const filteredHistory = this.dateFilter.filterEntriesByDate(allHistory, selectedDate);
    
    // Get daily summary
    const dailySummary = this.dateFilter.getDailySummary(allHistory, selectedDate);
    
    // Update UI
    this.ui.updateDateNavigation(selectedDate, this.dateFilter);
    this.ui.updateDailySummary(dailySummary);
    this.ui.renderHistory(filteredHistory, this.dateFilter.formatDateForDisplay(selectedDate));
  }

  // Public method for external updates
  refreshDateView() {
    this.updateDateView();
  }
}