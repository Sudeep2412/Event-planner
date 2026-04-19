import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, Platform, StatusBar, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { supabase } from './src/lib/supabase';
import { Session } from '@supabase/supabase-js';
import './global.css';

// Auth Screens
import LandingScreen from './src/screens/auth/LandingScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import SignupScreen from './src/screens/auth/SignupScreen';

// Main Screens
import HomeScreen from './src/screens/HomeScreen';
import FilterScreen from './src/screens/FilterScreen';
import VendorDetailScreen from './src/screens/VendorDetailScreen';
import GuestListScreen from './src/screens/GuestListScreen';
import TicketScreen from './src/screens/TicketScreen';
import GatekeeperScreen from './src/screens/GatekeeperScreen';
import DiscoveryDashboardScreen from './src/screens/DiscoveryDashboard';
import ProfileScreen from './src/screens/ProfileScreen';
import SubEventBuilderScreen from './src/screens/SubEventBuilderScreen';
import RSVPFormScreen from './src/screens/RSVPFormScreen';
import RSVPConfirmationScreen from './src/screens/RSVPConfirmationScreen';
import FoodAnalyticsScreen from './src/screens/FoodAnalyticsScreen';
import BudgetScreen from './src/screens/BudgetScreen';
import TimelineBuilderScreen from './src/screens/TimelineBuilderScreen';

const Stack = createNativeStackNavigator();

const linking = {
  prefixes: ['http://localhost:8081', 'https://eventmasterpro.com', 'exp://'],
  config: {
    screens: {
      RSVPForm: 'rsvp/:eventId',
      RSVPConfirmation: 'rsvp-confirm/:qrHash'
    }
  }
};

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Global state mock for now (as was previously inside App.tsx)
  const [savedVendors, setSavedVendors] = useState<string[]>([]);
  const toggleSaveVendor = (id: string) => {
    setSavedVendors(prev => prev.includes(id) ? prev.filter(vId => vId !== id) : [...prev, id]);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.container}>
        <View style={styles.mobileConstraint}>
          <NavigationContainer linking={linking}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {session && session.user ? (
                // Main App Flow
                <>
                  <Stack.Screen name="Home">
                    {(props) => (
                      <HomeScreen 
                        {...props} 
                        onSelectOccasion={(id: string, location: string) => 
                          props.navigation.navigate('Filter', { occasionId: id, location })
                        }
                        onVendorSelect={(id: string) => 
                          props.navigation.navigate('VendorDetail', { vendorId: id })
                        }
                      />
                    )}
                  </Stack.Screen>
                  <Stack.Screen name="Filter">
                    {({ route, navigation }: any) => (
                      <FilterScreen
                        occasionId={route.params?.occasionId}
                        initialLocation={route.params?.location}
                        onBack={() => navigation.goBack()}
                        onDiscoveryReady={(eventType: string, budget: number, eventId: string) => 
                          navigation.navigate('DiscoveryDashboard', { eventType, budget, eventId })
                        }
                      />
                    )}
                  </Stack.Screen>
                  <Stack.Screen name="DiscoveryDashboard" component={DiscoveryDashboardScreen} />
                  <Stack.Screen name="VendorDetail">
                    {({ route, navigation }: any) => (
                      <VendorDetailScreen
                        vendorId={route.params?.vendorId}
                        eventId={route.params?.eventId}
                        onBack={() => navigation.goBack()}
                        isSaved={savedVendors.includes(route.params?.vendorId)}
                        toggleSave={() => toggleSaveVendor(route.params?.vendorId)}
                      />
                    )}
                  </Stack.Screen>
                  <Stack.Screen name="GuestList" component={GuestListScreen} />
                  <Stack.Screen name="Ticket" component={TicketScreen} />
                  <Stack.Screen name="Gatekeeper" component={GatekeeperScreen} />
                  <Stack.Screen name="Profile" component={ProfileScreen} />
                  
                  {/* Event Flow Integrations */}
                  <Stack.Screen name="SubEventBuilder" component={SubEventBuilderScreen} />
                  <Stack.Screen name="FoodAnalytics" component={FoodAnalyticsScreen} />
                  <Stack.Screen name="Budget" component={BudgetScreen} />
                  <Stack.Screen name="TimelineBuilder" component={TimelineBuilderScreen} />
                </>
              ) : (
                // Auth Flow
                <>
                  <Stack.Screen name="Landing" component={LandingScreen} />
                  <Stack.Screen name="Login" component={LoginScreen} />
                  <Stack.Screen name="Signup" component={SignupScreen} />
                </>
              )}
              {/* Public/Guest Accessible Routes bypassing Auth */}
              <Stack.Screen name="RSVPForm" component={RSVPFormScreen} />
              <Stack.Screen name="RSVPConfirmation" component={RSVPConfirmationScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Platform.OS === 'web' ? '#f0f0f0' : '#ffffff' },
  container: { flex: 1, alignItems: Platform.OS === 'web' ? 'center' : 'stretch', justifyContent: 'center' },
  mobileConstraint: {
    flex: 1, width: '100%', maxWidth: Platform.OS === 'web' ? 400 : '100%', backgroundColor: '#ffffff', overflow: 'hidden',
    ...(Platform.OS === 'web' && {
      maxHeight: 850, borderRadius: 40, boxShadow: '0px 10px 30px rgba(0,0,0,0.15)', borderWidth: 8, borderColor: '#1a1a1a', marginVertical: 20
    })
  }
});