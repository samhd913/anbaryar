# 🏥 انبار یار (AnbarYar) - Inventory Management App

## 📋 Overview

**انبار یار** is a professional inventory counting application designed specifically for pharmacies to match system stock with physical stock and record differences. Built with React Native + Expo using MVVM architecture.

## 🎯 Key Features

### 📁 File Import
- **Excel/CSV Support**: Import inventory data from Excel (.xlsx) or CSV files
- **Auto-Detection**: Automatically detects Persian or English headers
- **Data Validation**: Validates and processes imported data with error handling

### 🧾 Inventory Counting
- **Responsive Table**: Scrollable list of all imported medicines
- **Search Functionality**: Quick filter by drug code or name
- **Status Indicators**: Visual indicators for counted/uncounted items
- **Real-time Updates**: Immediate reflection of changes

### 💊 Medicine Detail Management
- **Physical Count Input**: Numeric input for physical inventory count
- **Difference Calculation**: Automatic calculation of system vs physical difference
- **Color-coded Status**: 
  - 🔴 Red for shortage (کمبود)
  - 🟢 Green for surplus (مازاد)
  - ⚪ Gray for exact match (مطابق)
- **Persistent Storage**: All data saved locally with AsyncStorage

### ⚙️ Settings & Export
- **Excel Export**: Export all current data with statistics
- **Data Management**: Clear all data with confirmation
- **Statistics Dashboard**: Real-time statistics and reporting
- **Storage Management**: View storage usage and last import date

## 🏗️ Architecture

### MVVM Pattern Implementation

#### **Model Layer**
```typescript
// models/Drug.ts
interface Drug {
  id: string;
  code: string;
  name: string;
  systemQty: number;
  physicalQty: number;
  difference: number;
}
```

#### **ViewModel Layer**
```typescript
// viewmodels/InventoryViewModel.ts
- State management with Zustand
- Business logic for inventory operations
- File import/export functionality
- Data persistence with AsyncStorage
```

#### **View Layer**
```typescript
// screens/
- InventoryScreen: Main inventory list
- DrugDetailScreen: Physical count input
- SettingsScreen: Export and data management
```

## 🎨 UI/UX Design

### Color Palette
- **Primary**: Neon Blue `#0072FF`
- **Secondary**: Light Gray `#F7F8FA`
- **Accent**: Light Blue `#4DB8FF`
- **Success**: Green `#2ECC71`
- **Error**: Red `#E74C3C`
- **Text**: Deep Black `#1A1A1A`

### Design Principles
- **RTL Support**: Full right-to-left layout for Persian
- **Minimal Design**: Clean, modern interface
- **Responsive**: Works on all screen sizes
- **Accessibility**: High contrast and readable fonts
- **Persian-Friendly**: Optimized for Persian text and UI

## 🛠️ Tech Stack

### Core Technologies
- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and tools
- **TypeScript**: Type-safe development
- **Expo Router**: File-based navigation

### State Management
- **Zustand**: Lightweight state management
- **AsyncStorage**: Local data persistence

### File Operations
- **expo-document-picker**: File selection
- **expo-file-system**: File system operations
- **expo-sharing**: File sharing capabilities
- **xlsx**: Excel file processing

### UI Components
- **React Native**: Core components
- **Custom Components**: Reusable UI components
- **Styled Components**: Consistent styling

## 📱 Platform Support

- **iOS**: Full support with native performance
- **Android**: Optimized for Android devices
- **Web**: PWA support for web browsers

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd anbaryad
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm start
```

4. **Run on specific platform**
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## 📁 Project Structure

```
anbaryad/
├── app/                          # App screens (Expo Router)
│   ├── (tabs)/                   # Tab navigation
│   │   ├── index.tsx            # Inventory screen
│   │   ├── explore.tsx           # Settings screen
│   │   └── _layout.tsx          # Tab layout
│   ├── drug-detail/[id].tsx     # Drug detail modal
│   └── _layout.tsx              # Root layout
├── models/                       # Data models
│   ├── Drug.ts                  # Drug interface
│   └── InventoryState.ts        # State interfaces
├── viewmodels/                   # MVVM ViewModels
│   └── InventoryViewModel.ts     # Main ViewModel
├── services/                     # Business logic
│   ├── StorageService.ts        # Data persistence
│   └── ExcelService.ts          # File operations
├── components/                   # Reusable components
│   ├── ui/                      # UI components
│   │   ├── DrugCard.tsx         # Drug card component
│   │   └── SearchBar.tsx        # Search component
│   └── forms/                   # Form components
│       └── PhysicalCountInput.tsx
├── constants/                    # App constants
│   └── colors.ts                # Color palette
└── utils/                       # Utility functions
```

## 🔧 Configuration

### Environment Setup
```bash
# Install Expo CLI globally
npm install -g @expo/cli

# Install dependencies
npm install

# Start development server
expo start
```

### Dependencies
Key dependencies for the inventory app:
- `@react-native-async-storage/async-storage`: Local storage
- `expo-document-picker`: File selection
- `expo-file-system`: File operations
- `expo-sharing`: File sharing
- `xlsx`: Excel processing
- `zustand`: State management

## 📊 Features Implementation

### File Import Process
1. User selects Excel/CSV file
2. File is parsed and validated
3. Data is converted to Drug models
4. Drugs are stored in AsyncStorage
5. UI updates with imported data

### Inventory Counting Flow
1. User views list of imported drugs
2. Taps on a drug to open detail view
3. Enters physical count
4. System calculates difference
5. Data is saved and UI updates

### Export Functionality
1. User requests Excel export
2. All data is compiled with statistics
3. Excel file is generated
4. File is shared via system share sheet

## 🎯 Business Logic

### Difference Calculation
```typescript
difference = physicalQty - systemQty
```

### Status Determination
- **Shortage**: `difference < 0` (Red)
- **Surplus**: `difference > 0` (Green)
- **Exact**: `difference === 0` (Gray)
- **Uncounted**: `physicalQty === 0` (Orange)

### Data Validation
- Drug code and name are required
- System quantity must be non-negative
- Physical quantity must be non-negative
- File format validation for imports

## 🔒 Data Security

- **Local Storage**: All data stored locally on device
- **No Cloud Sync**: Data remains on user's device
- **Encryption**: Sensitive data encrypted in storage
- **Privacy**: No data collection or tracking

## 🚀 Performance Optimizations

- **Lazy Loading**: Components loaded on demand
- **Memoization**: Expensive calculations cached
- **Efficient Rendering**: Optimized list rendering
- **Memory Management**: Proper cleanup of resources

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

## 📱 Deployment

### Development Build
```bash
expo build:android
expo build:ios
```

### Production Build
```bash
expo build:android --type apk
expo build:ios --type archive
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- **Barcode Scanning**: Scan drug codes with camera
- **Cloud Sync**: Optional cloud backup
- **Multi-language**: Support for other languages
- **Advanced Reporting**: Detailed analytics
- **Offline Mode**: Enhanced offline capabilities
- **Dark Mode**: Dark theme support

---

**انبار یار** - Professional inventory management for pharmacies 🏥📊
