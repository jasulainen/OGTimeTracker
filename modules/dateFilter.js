// Date Filter Module - Handles date-based filtering for history entries
export class DateFilter {
  constructor() {
    this.currentDate = new Date();
  }

  // Filter entries by date (using start timestamp)
  filterEntriesByDate(entries, targetDate) {
    return entries.filter(entry => {
      const entryDate = new Date(entry.startTs);
      return this.isSameDate(entryDate, targetDate);
    });
  }

  // Get all unique dates that have entries
  getAvailableDates(entries) {
    const dates = new Set();
    entries.forEach(entry => {
      const entryDate = new Date(entry.startTs);
      dates.add(this.getDateString(entryDate));
    });
    return Array.from(dates).sort().reverse(); // Most recent first
  }

  // Get current date
  getCurrentDate() {
    return new Date();
  }

  // Set current selected date
  setCurrentDate(date) {
    this.currentDate = new Date(date);
  }

  // Get current selected date
  getSelectedDate() {
    return this.currentDate;
  }

  // Navigate to previous date
  getPreviousDate() {
    const prevDate = new Date(this.currentDate);
    prevDate.setDate(prevDate.getDate() - 1);
    return prevDate;
  }

  // Navigate to next date
  getNextDate() {
    const nextDate = new Date(this.currentDate);
    nextDate.setDate(nextDate.getDate() + 1);
    return nextDate;
  }

  // Check if two dates are the same day
  isSameDate(date1, date2) {
    return date1.toDateString() === date2.toDateString();
  }

  // Get date string for comparison (YYYY-MM-DD format)
  getDateString(date) {
    return date.toISOString().split('T')[0];
  }

  // Format date for display
  formatDateForDisplay(date) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (this.isSameDate(date, today)) {
      return 'Today';
    } else if (this.isSameDate(date, yesterday)) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  }

  // Format date for input field (YYYY-MM-DD)
  formatDateForInput(date) {
    return this.getDateString(date);
  }

  // Parse date from input field
  parseDateFromInput(dateString) {
    return new Date(dateString);
  }

  // Check if date has entries
  hasEntriesForDate(entries, date) {
    return this.filterEntriesByDate(entries, date).length > 0;
  }

  // Get daily summary for a specific date
  getDailySummary(entries, date) {
    const dayEntries = this.filterEntriesByDate(entries, date);
    
    if (dayEntries.length === 0) {
      return {
        totalTime: 0,
        totalTimeFormatted: '0h 0m',
        taskCount: 0,
        uniqueTaskCount: 0,
        entries: []
      };
    }

    const totalTime = dayEntries.reduce((sum, entry) => sum + entry.duration, 0);
    const uniqueTasks = new Set(dayEntries.map(entry => entry.taskId));
    
    return {
      totalTime,
      totalTimeFormatted: this.formatDuration(totalTime),
      taskCount: dayEntries.length,
      uniqueTaskCount: uniqueTasks.size,
      entries: dayEntries
    };
  }

  // Get date range summary
  getDateRangeSummary(entries, startDate, endDate) {
    const rangeEntries = entries.filter(entry => {
      const entryDate = new Date(entry.startTs);
      return entryDate >= startDate && entryDate <= endDate;
    });

    return this.getDailySummary(rangeEntries, null);
  }

  // Format duration in hours and minutes
  formatDuration(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  // Check if date is today
  isToday(date) {
    return this.isSameDate(date, new Date());
  }

  // Check if date is in the future
  isFuture(date) {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    return date > today;
  }

  // Get week start date (Monday)
  getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    return new Date(d.setDate(diff));
  }

  // Get month start date
  getMonthStart(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  // Get entries for current week
  getWeekEntries(entries, date) {
    const weekStart = this.getWeekStart(date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    return this.getDateRangeSummary(entries, weekStart, weekEnd);
  }

  // Get entries for current month
  getMonthEntries(entries, date) {
    const monthStart = this.getMonthStart(date);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    return this.getDateRangeSummary(entries, monthStart, monthEnd);
  }
}