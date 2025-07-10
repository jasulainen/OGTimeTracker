# ⏱️ TimeTracker

A smart Progressive Web App (PWA) for time tracking with automatic notifications and Excel-ready export functionality.
If you wish to continue development, CLAUDE.md is included. This code base is produced in co-operation with Claude Code.

## 🌟 Features

### Core Functionality
- **Smart Notifications**: Configurable reminders (1-360 minutes) ask if you're still working on your current task
- **Manual Control**: Start, stop, and switch tasks with intuitive controls
- **Always-Visible Input**: Task input field stays visible for easy task switching
- **Automatic History**: Every completed task is automatically saved with precise timestamps

### Data Management
- **Dual Storage**: File System API for Chrome/Edge with localStorage fallback
- **Export Options**: 
  - JSON format for complete data backup
  - CSV format optimized for Excel analysis with separate date/time columns
- **Date Navigation**: Filter and browse history by specific dates
- **Task Aggregation**: Intelligent task grouping with ID-based system

### User Experience
- **PWA Ready**: Install as a desktop/mobile app
- **Tab Interface**: Clean separation between Tracking and Preferences
- **Autocomplete**: Smart task suggestions based on your history
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **No Dependencies**: Pure vanilla JavaScript with no external frameworks

## 🚀 Quick Start

### Option 1: Use Online (Recommended)
Go https://timetracker.qkaasu.com/ and use it there. Note that this app does not store any data of yours to web site, but all the data is stored on your personal computer.

### Option 2: Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/timetracker.git
   cd timetracker
   ```

2. **Start a local server**
   ```bash
   # Using Python
   python -m http.server 8888
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8888
   ```

3. **Open in browser**
   ```
   http://localhost:8888
   ```

4. **Install as PWA** (Optional)
   - Click the install button in your browser's address bar
   - Or use "Add to Home Screen" on mobile

## 📖 How to Use

### Basic Time Tracking
1. **Start Tracking**: Enter a task name and click "Start Tracking"
2. **Automatic Notifications**: You'll receive periodic reminders asking if you're still working
3. **Stop Manually**: Click the 🛑 "Stop Tracking" button anytime
4. **Switch Tasks**: Enter a new task name to automatically complete the current one

### Advanced Features
1. **Configure Notifications**: Go to Preferences tab to set your preferred notification interval
2. **Export Data**: Use the export dropdown to download your history as JSON or CSV
3. **Browse History**: Use date navigation to filter entries by specific dates
4. **File Persistence**: Set up a data file (Chrome/Edge) for automatic saving

## 🛠️ Development

### Project Structure
```
timetracker/
├── index.html              # Main application UI
├── manifest.json          # PWA manifest
├── service-worker.js       # Service worker for PWA
├── icon-192.png           # App icon
├── modules/
│   ├── app.js             # Main application controller
│   ├── storage.js         # File System API and localStorage
│   ├── state.js           # State management
│   ├── taskManager.js     # Business logic
│   ├── notifications.js   # Notification service
│   ├── ui.js              # UI components
│   ├── preferences.js     # User preferences
│   ├── utils.js           # Utility functions
│   ├── dateFilter.js      # Date filtering
│   └── autocomplete.js    # Task autocomplete
└── app/
    └── timetracker-history.json  # Sample data file
```

### Architecture
- **Modular ES6**: Clean separation of concerns with ES6 modules
- **No Build Process**: Direct JavaScript execution, no transpilation needed
- **Observable State**: Reactive state management pattern
- **Progressive Enhancement**: Works offline with service worker caching

### Adding New Features

1. **UI Changes**: Modify `modules/ui.js` for new UI components
2. **Business Logic**: Add methods to `modules/taskManager.js`
3. **Storage**: Extend `modules/storage.js` for new data operations
4. **State**: Add new state properties to `modules/state.js`
5. **Integration**: Wire everything together in `modules/app.js`

### Key Development Guidelines
- Use ES6 modules with import/export syntax
- Follow the observable state pattern for UI updates
- Use async/await for all storage operations
- Maintain localStorage fallback compatibility
- Test PWA features on localhost or HTTPS
- Use Tailwind CSS classes for consistent styling

## 🔧 Configuration

### Notification Settings
- **Interval**: 1-360 minutes (configurable in Preferences)
- **Browser Permission**: Required for notifications to work
- **Service Worker**: Handles notification actions and PWA features

### Storage Options
- **File System API**: Chrome/Edge 86+ for direct file access
- **localStorage**: Fallback for other browsers
- **Export Formats**: JSON (complete) and CSV (Excel-optimized)

## 📊 Excel Integration

The CSV export is specifically designed for Excel analysis:

### Column Structure
- **Task Name**: Full task description
- **Category**: Auto-extracted from patterns like "Work: Task" or "[Project] Task"
- **Start Date/Time**: Separate columns in YYYY-MM-DD and HH:MM:SS format
- **End Date/Time**: Separate columns for easy filtering
- **Duration**: Human-readable (2h 30m 15s) and decimal hours (2.5042)
- **Task ID**: For grouping and pivot table analysis

### Excel Features Enabled
- **Pivot Tables**: Group by date, category, or task
- **Time Calculations**: Sum/average using decimal hours
- **Date Filtering**: Easy date range selection
- **Charts**: Timeline visualizations and productivity analysis

## 🌐 Browser Support

- **Chrome/Edge 86+**: Full features including File System API
- **Firefox**: Core features with localStorage
- **Safari**: Core features with localStorage
- **Mobile Browsers**: Full PWA support on iOS Safari and Android Chrome

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** following the development guidelines
4. **Test thoroughly** on multiple browsers
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Development Setup
```bash
# Clone your fork
git clone https://github.com/yourusername/timetracker.git
cd timetracker

# Start development server
python -m http.server 8888

# Make changes and test
# Submit PR when ready
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with vanilla JavaScript and modern web APIs
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from the emoji set
- Progressive Web App features using standard web APIs

## 🐛 Issues and Feature Requests

Found a bug or have a feature request? Please open an issue on GitHub:
- [Report Bug](https://github.com/yourusername/timetracker/issues/new?labels=bug)
- [Request Feature](https://github.com/yourusername/timetracker/issues/new?labels=enhancement)

## 📈 Roadmap

- [ ] Dark/Light theme toggle
- [ ] Multiple time zones support
- [ ] Team collaboration features
- [ ] Advanced reporting and analytics
- [ ] Integration with calendar apps
- [ ] Time tracking goals and targets

---

**Made with ❤️ for productivity enthusiasts**
