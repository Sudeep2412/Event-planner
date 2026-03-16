// import React, { useState } from 'react';
// import { View, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
// import './global.css';

// import HomeScreen from './src/screens/HomeScreen';
// import FilterScreen from './src/screens/FilterScreen';
// import MarketplaceScreen from './src/screens/MarketplaceScreen';
// import VendorDetailScreen from './src/screens/VendorDetailScreen';

// type ScreenName = 'HOME' | 'FILTER' | 'MARKETPLACE' | 'VENDOR_DETAIL';

// export default function App() {
//   const [currentScreen, setCurrentScreen] = useState<ScreenName>('HOME');
//   const [selectedOccasionId, setSelectedOccasionId] = useState<string>('');
//   const [selectedVendorId, setSelectedVendorId] = useState<string>('');

//   const [selectedLocation, setSelectedLocation] = useState<string>('');
//   const [selectedVenueTypes, setSelectedVenueTypes] = useState<string[]>([]);

//   const navigateTo = (screen: ScreenName) => {
//     setCurrentScreen(screen);
//   };

//   const handleSelectOccasion = (id: string, location: string) => {
//     setSelectedOccasionId(id);
//     setSelectedLocation(location);
//     navigateTo('FILTER');
//   };

//   const handleShowVendors = (selectedTypes: string[]) => {
//     setSelectedVenueTypes(selectedTypes);
//     navigateTo('MARKETPLACE');
//   };

//   const handleSelectVendor = (id: string) => {
//     setSelectedVendorId(id);
//     navigateTo('VENDOR_DETAIL');
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
//       <View style={styles.container}>
//         <View style={styles.mobileConstraint}>
//           {currentScreen === 'HOME' && (
//             <HomeScreen onSelectOccasion={handleSelectOccasion} />
//           )}
//           {currentScreen === 'FILTER' && (
//             <FilterScreen
//               occasionId={selectedOccasionId}
//               onBack={() => navigateTo('HOME')}
//               onShowVendors={handleShowVendors}
//             />
//           )}
//           {currentScreen === 'MARKETPLACE' && (
//             <MarketplaceScreen
//               onBack={() => navigateTo('FILTER')}
//               onVendorSelect={handleSelectVendor}
//               occasionId={selectedOccasionId}
//               location={selectedLocation}
//               venueTypes={selectedVenueTypes}
//             />
//           )}
//           {currentScreen === 'VENDOR_DETAIL' && (
//             <VendorDetailScreen
//               vendorId={selectedVendorId}
//               onBack={() => navigateTo('MARKETPLACE')}
//             />
//           )}
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: Platform.OS === 'web' ? '#f0f0f0' : '#ffffff',
//   },
//   container: {
//     flex: 1,
//     alignItems: Platform.OS === 'web' ? 'center' : 'stretch',
//     justifyContent: 'center',
//   },
//   mobileConstraint: {
//     flex: 1,
//     width: '100%',
//     maxWidth: Platform.OS === 'web' ? 400 : '100%',
//     backgroundColor: '#ffffff',
//     overflow: 'hidden',
//     // Mock mobile device styling for web
//     ...(Platform.OS === 'web' && {
//       maxHeight: 850,
//       borderRadius: 40,
//       shadowColor: '#000',
//       shadowOffset: { width: 0, height: 10 },
//       shadowOpacity: 0.15,
//       shadowRadius: 30,
//       borderWidth: 8,
//       borderColor: '#1a1a1a',
//       marginVertical: 20
//     })
//   }
// });


import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import './global.css';

import HomeScreen from './src/screens/HomeScreen';
import FilterScreen from './src/screens/FilterScreen';
import MarketplaceScreen from './src/screens/MarketplaceScreen';
import VendorDetailScreen from './src/screens/VendorDetailScreen';

type ScreenName = 'HOME' | 'FILTER' | 'MARKETPLACE' | 'VENDOR_DETAIL';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('HOME');
  const [selectedOccasionId, setSelectedOccasionId] = useState<string>('');
  const [selectedVendorId, setSelectedVendorId] = useState<string>('');

  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedVenueTypes, setSelectedVenueTypes] = useState<string[]>([]);
  
  // ADDED: Global state for favorited/saved vendors
  const [savedVendors, setSavedVendors] = useState<string[]>([]);

  const toggleSaveVendor = (id: string) => {
    setSavedVendors(prev => prev.includes(id) ? prev.filter(vId => vId !== id) : [...prev, id]);
  };

  const navigateTo = (screen: ScreenName) => {
    setCurrentScreen(screen);
  };

  const handleSelectOccasion = (id: string, location: string) => {
    setSelectedOccasionId(id);
    setSelectedLocation(location || ''); // Fallback to empty string
    navigateTo('FILTER');
  };

  const handleShowVendors = (selectedTypes: string[]) => {
    setSelectedVenueTypes(selectedTypes);
    navigateTo('MARKETPLACE');
  };

  const handleSelectVendor = (id: string) => {
    setSelectedVendorId(id);
    navigateTo('VENDOR_DETAIL');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.container}>
        <View style={styles.mobileConstraint}>
          {currentScreen === 'HOME' && (
            <HomeScreen 
              onSelectOccasion={handleSelectOccasion} 
              onVendorSelect={handleSelectVendor} // ADDED: So trending vendors work
            />
          )}
          {currentScreen === 'FILTER' && (
            <FilterScreen
              occasionId={selectedOccasionId}
              onBack={() => navigateTo('HOME')}
              onShowVendors={handleShowVendors}
            />
          )}
          {currentScreen === 'MARKETPLACE' && (
            <MarketplaceScreen
              onBack={() => navigateTo('FILTER')}
              onVendorSelect={handleSelectVendor}
              occasionId={selectedOccasionId}
              location={selectedLocation}
              venueTypes={selectedVenueTypes}
              savedVendors={savedVendors} // ADDED
              toggleSaveVendor={toggleSaveVendor} // ADDED
            />
          )}
          {currentScreen === 'VENDOR_DETAIL' && (
            <VendorDetailScreen
              vendorId={selectedVendorId}
              onBack={() => navigateTo('MARKETPLACE')}
              isSaved={savedVendors.includes(selectedVendorId)} // ADDED
              toggleSave={() => toggleSaveVendor(selectedVendorId)} // ADDED
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Platform.OS === 'web' ? '#f0f0f0' : '#ffffff',
  },
  container: {
    flex: 1,
    alignItems: Platform.OS === 'web' ? 'center' : 'stretch',
    justifyContent: 'center',
  },
  mobileConstraint: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 400 : '100%',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    ...(Platform.OS === 'web' && {
      maxHeight: 850,
      borderRadius: 40,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 30,
      borderWidth: 8,
      borderColor: '#1a1a1a',
      marginVertical: 20
    })
  }
});