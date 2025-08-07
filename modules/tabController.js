// Tab Controller - Handles tab navigation and switching
export class TabController {
  constructor() {
    this.currentTab = 'tracking';
    this.isInitialized = false;
  }

  initialize() {
    if (this.isInitialized) return;
    
    this.setupTabNavigation();
    this.isInitialized = true;
  }

  setupTabNavigation() {
    // Tab navigation events
    document.getElementById('trackingTab').onclick = () => this.showTab('tracking');
    document.getElementById('preferencesTab').onclick = () => this.showTab('preferences');
    document.getElementById('aboutTab').onclick = () => this.showTab('about');
  }

  showTab(tabName) {
    // Validate tab name
    const validTabs = ['tracking', 'preferences', 'about'];
    if (!validTabs.includes(tabName)) {
      console.warn('Invalid tab name:', tabName);
      return;
    }

    // Hide all tab contents
    const trackingContent = document.getElementById('trackingContent');
    const preferencesContent = document.getElementById('preferencesContent');
    const aboutContent = document.getElementById('aboutContent');
    
    // Get tab buttons
    const trackingTab = document.getElementById('trackingTab');
    const preferencesTab = document.getElementById('preferencesTab');
    const aboutTab = document.getElementById('aboutTab');
    
    // Ensure elements exist
    if (!trackingContent || !preferencesContent || !aboutContent ||
        !trackingTab || !preferencesTab || !aboutTab) {
      console.error('Tab elements not found');
      return;
    }
    
    // Hide all content first
    trackingContent.style.display = 'none';
    preferencesContent.style.display = 'none';
    aboutContent.style.display = 'none';
    
    // Reset all tab buttons to inactive state
    const inactiveClass = 'tab-button px-6 py-3 bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all font-medium';
    const activeClass = 'tab-button active px-6 py-3 bg-primary text-white hover:bg-blue-600 transition-all font-medium';
    
    trackingTab.className = inactiveClass;
    preferencesTab.className = inactiveClass;
    aboutTab.className = inactiveClass;
    
    // Show selected tab and activate button
    if (tabName === 'tracking') {
      trackingContent.style.display = '';
      trackingTab.className = activeClass;
    } else if (tabName === 'preferences') {
      preferencesContent.style.display = '';
      preferencesTab.className = activeClass;
    } else if (tabName === 'about') {
      aboutContent.style.display = '';
      aboutTab.className = activeClass;
    }

    this.currentTab = tabName;
  }

  getCurrentTab() {
    return this.currentTab;
  }
}