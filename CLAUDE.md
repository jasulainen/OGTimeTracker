# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TimeTracker is a Progressive Web App (PWA) demonstration of a simple time tracking solution with automatic notification-based task management. The core concept is that users don't need to remember to update their current task - the app automatically sends notifications asking if they're still working on the same thing, allowing them to confirm or switch tasks effortlessly.

Built with vanilla JavaScript and styled with Tailwind CSS, it features a modern, professional interface while running entirely in the browser using localStorage for data persistence.

## Architecture

- **Single Page Application**: All functionality contained in one HTML page
- **Modern UI**: Tailwind CSS via CDN for responsive, professional design
- **Modular ES6 Structure**: Clean separation of concerns with ES6 modules
- **No Build Process**: Direct JavaScript execution, no transpilation or bundling
- **PWA Features**: Service worker for offline functionality and push notifications
- **Client-side Storage**: Uses localStorage for task persistence
- **File System Integration**: Chrome/Edge File System API for direct file persistence
- **Observable State Management**: Simple reactive state pattern for UI updates
- **Configurable Notification System**: Browser notifications at user-configurable intervals (1-360 minutes) asking "Still working on [task]?" - the core feature that eliminates manual task switching
- **Git Version Control**: Uses git for source code management and collaboration

## Key Files

### Core Application
- `index.html`: Main application UI with task input, controls, and tab-based interface
- `modules/app.js`: Main application controller and initialization (refactored)
- `service-worker.js`: PWA service worker for caching and notification click handling
- `manifest.json`: PWA manifest for app metadata and icons
- `icon-192.png`: App icon for PWA

### Business Logic & State
- `modules/taskManager.js`: Core business logic for task operations and ID-based registry
- `modules/state.js`: Observable state management with reactive pattern
- `modules/storage.js`: File System API and localStorage management with JSON/CSV export
- `modules/notifications.js`: PWA notification service with configurable intervals

### UI & Controllers (Post-Refactoring)
- `modules/ui.js`: UI components and DOM manipulation (security-hardened)
- `modules/tabController.js`: Tab navigation and switching logic
- `modules/preferencesController.js`: Settings management and validation
- `modules/fileController.js`: Import/export operations and file handling
- `modules/dateNavigationController.js`: Date filtering and navigation controls

### Utilities & Features
- `modules/utils.js`: Consolidated utility functions with security validation
- `modules/preferences.js`: User preferences persistence and defaults
- `modules/dateFilter.js`: Date-based filtering and navigation for history
- `modules/autocomplete.js`: Task name autocomplete functionality

### Data & Testing
- `app/timetracker-history.json`: Database of time tracking history as JSON file
- `tests/essential.test.js`: Security validation and essential business logic tests
- `tests/setup.js`: Minimal test configuration
- `package.json`: Development dependencies and npm scripts
- `vite.config.js`: Test framework configuration

## Development Commands

This project uses minimal tooling with focused testing for security validation:

1. **Run locally**: Serve files via HTTP server (not file://)
   ```bash
   npm run serve
   # Or for HTTPS (required for PWA features)
   npm run serve:https
   ```

2. **Testing**: Essential security and validation tests
   ```bash
   npm test        # Run security validation tests
   npm run test:watch  # Watch mode for development
   ```

3. **Test PWA features**: Must be served over HTTPS or localhost for service worker and notifications to work

4. **Git workflow**: Standard version control operations
   - Use `git status`, `git add`, `git commit`, `git push` for basic operations
   - Feature branches recommended for larger changes

## Code Structure

### Storage Layer (`modules/storage.js`)
- File System API integration for direct file persistence
- localStorage fallback for browser compatibility
- Export/import functionality for history backup (JSON and CSV formats)
- Automatic file handle management
- CSV export optimized for Excel with separate date/time columns

### State Management (`modules/state.js`)
- Observable state pattern for reactive UI updates
- Centralized state for current task, history, and storage status
- Subscription-based state change notifications

### Business Logic (`modules/taskManager.js`)
- Task operations: start, switch, complete, stop
- ID-based task registry with autocomplete support
- History management: add, clear, export (JSON/CSV), import
- Time calculation and formatting utilities
- File system operations coordination

### UI Components (`modules/ui.js`)
- Modular UI rendering functions
- DOM manipulation and event handling
- Tab-based interface (Tracking/Preferences)
- Date-based history navigation
- Stop button for manual task completion
- Export dropdown menu (JSON/CSV options)
- Consistent styling with Tailwind CSS
- User feedback and error handling

### Notification Service (`modules/notifications.js`)
- Service worker integration for PWA notifications
- Configurable notification intervals (1-360 minutes) via preferences
- User interaction handling for task switching
- **Fixed**: Notification clicks now properly reuse existing PWA instances instead of opening new ones

### Main Controller (`modules/app.js`)
- Application initialization and coordination
- Event listener setup and management
- Tab switching and preferences integration
- Module orchestration and lifecycle management
- Global app state and debugging interface

### Preferences Management (`modules/preferences.js`)
- User settings persistence in localStorage
- Configurable notification intervals (1-360 minutes)
- Settings validation and defaults
- Future-ready for theme and formatting preferences

### Utility Functions (`modules/utils.js`)
- Task ID generation and validation
- Date/time formatting for CSV export
- Duration calculations and formatting
- CSV field escaping and data processing

### Date Filtering (`modules/dateFilter.js`)
- Date-based history filtering and navigation
- Daily summary calculations
- Date picker integration
- Today/previous/next date navigation

### Autocomplete (`modules/autocomplete.js`)
- Task name suggestion system
- ID-based task matching and aggregation
- Keyboard navigation support
- Real-time filtering and selection

## Important Implementation Notes

- **Core Feature - Configurable Notifications**: User-configurable intervals (1-360 minutes) ask "Still working on [task]?" with Yes/No actions
- **User Experience**: Users never need to remember to update their current task manually
- **Notification Actions**: "Yes" dismisses notification, "No" focuses task input for switching
- **Stop Button**: Manual task completion with 🛑 Stop Tracking button
- **Preferences Tab**: Settings for notification intervals, future theme options
- **Data Persistence**: 
  - **File System API**: Chrome/Edge 86+ can save directly to local files
  - **localStorage Fallback**: Other browsers use browser storage
  - **Auto-detection**: Automatically detects and uses best available storage
- **File Management**: Export/import functionality with dual format support:
  - **JSON Export**: Complete data backup with all fields
  - **CSV Export**: Excel-optimized format with separate date/time columns for analysis
- **Task ID System**: Comprehensive ID-based task registry for proper aggregation and autocomplete
- **Date Navigation**: Filter history by date with daily summaries and navigation controls
- **Autocomplete**: Intelligent task suggestions based on history
- **Service Worker**: Handles offline caching and notification click events
- **No External Dependencies**: Pure vanilla JavaScript implementation
- **PWA Ready**: Includes manifest.json and service worker for installation

## Editing Guidelines

When modifying this codebase:
- **Modular Structure**: Keep functionality separated into appropriate modules
- **ES6 Modules**: Use import/export syntax for module communication
- **State Management**: Use the observable state pattern for UI updates
- **UI Components**: Add new UI elements through the UIComponents class
- **Storage Operations**: Use the StorageManager for all data persistence
- **Business Logic**: Keep task-related logic in TaskManager
- Use Tailwind CSS classes for styling (loaded via CDN)
- Test PWA features on localhost or HTTPS
- Update service worker cache version when changing cached files
- Ensure notification permissions are properly handled
- Test File System API in Chrome/Edge for file persistence features
- Maintain localStorage fallback for browser compatibility
- Use async/await for all storage operations due to File System API
- Follow the established design system with consistent spacing and colors

### Version Control Guidelines
- **Commit frequently**: Make small, logical commits with descriptive messages
- **Branch strategy**: Use feature branches for new features and bug fixes
- **Commit messages**: Use clear, concise commit messages describing the change
- **Code review**: Review changes before merging to main branch
- **Data files**: The `app/timetracker-history.json` file contains user data and may have local modifications
- **Service worker**: Update cache version in service worker when modifying cached files
- **Testing**: Test changes locally before committing to ensure PWA functionality works

## Recent Improvements (2024)

### Security & Architecture Refactoring
- **XSS Prevention**: Comprehensive input validation and HTML escaping
- **Service Worker Security**: Message validation and secure communication
- **Modular Controllers**: Extracted UI logic into dedicated controller modules
- **Code Consolidation**: Reduced main app.js from 568 to ~230 lines (60% reduction)
- **Input Sanitization**: All user inputs properly validated and escaped

### New Controller Modules
- **tabController.js**: Tab navigation and switching logic
- **preferencesController.js**: Settings management and validation  
- **fileController.js**: Import/export operations and file handling
- **dateNavigationController.js**: Date filtering and navigation controls

### Testing Framework
- **Security-Focused Tests**: Essential validation and XSS prevention tests
- **Minimal Setup**: Streamlined testing without complex mocking
- **Fast Execution**: 7 focused tests covering critical security functions
- **Easy Maintenance**: Simple test structure avoiding brittle integration tests

### Adding New Features
1. **UI Changes**: Modify `modules/ui.js` for new UI components
2. **Business Logic**: Add methods to `modules/taskManager.js`
3. **Storage**: Extend `modules/storage.js` for new data operations
4. **State**: Add new state properties to `modules/state.js`
5. **Controllers**: Create new controller modules for complex UI logic
6. **Testing**: Add security validation tests to `tests/essential.test.js`
7. **Integration**: Wire everything together in `modules/app.js`

## Development Best Practices

### Security Guidelines
- **Always validate inputs**: Use `Utils.validateTaskNameSecure()` for user inputs
- **Escape HTML content**: Use `Utils.escapeHtml()` before DOM insertion  
- **Validate service worker messages**: Check message structure and type
- **File size limits**: Validate import file sizes to prevent memory issues
- **Test security changes**: Run `npm test` to verify security validations

### Architecture Guidelines
- **Controller extraction**: Move complex UI logic to dedicated controller modules
- **Observable state pattern**: Use state subscriptions for reactive UI updates
- **Async storage operations**: Always use async/await for storage calls
- **Error handling**: Provide meaningful error messages and graceful fallbacks
- **Module boundaries**: Keep clear separation between UI, business logic, and storage

### Testing Guidelines
- **Focus on security**: Prioritize tests for XSS prevention and input validation
- **Keep tests simple**: Avoid complex mocking that creates maintenance burden
- **Test critical paths**: Cover essential business logic and security functions
- **Fast feedback**: Maintain quick test execution for development workflow
