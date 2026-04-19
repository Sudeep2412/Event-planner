import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useColorScheme } from 'nativewind';

export default function ProfileScreen({ navigation }: any) {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [radius, setRadius] = useState('20');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;
      setUser(authUser);
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
        
      if (profile) {
        setName(profile.full_name || authUser.user_metadata?.full_name || '');
        setPhone(profile.phone || '');
        setLocation(profile.default_location || 'Mumbai');
        setRadius(profile.search_radius_km !== null ? profile.search_radius_km.toString() : '20');
      }
    } catch (error: any) {
      console.log('Error fetching profile:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: name,
        phone: phone,
        default_location: location,
        search_radius_km: parseInt(radius) || 20,
        role: 'planner'
      });
      if (error) throw error;
      Alert.alert('Success', 'Profile settings updated natively!');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Save Failed', error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return <View className="flex-1 bg-[#fcfaff] dark:bg-slate-900 justify-center items-center"><ActivityIndicator size="large" color="#4f46e5"/></View>;
  }

  return (
    <View className="flex-1 bg-[#fcfaff] dark:bg-slate-900 pt-12 transition-colors">
      <View className="px-6 py-4 flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 transition-colors">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-slate-50 dark:bg-slate-800 items-center justify-center rounded-full border border-slate-100 dark:border-slate-700">
          <Feather name="arrow-left" size={20} color={colorScheme === 'dark' ? '#f8fafc' : '#0f172a'} />
        </TouchableOpacity>
        <Text className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Profile Settings</Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 100 }}>
        
        <View className="items-center mb-6">
          <View className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-full items-center justify-center border-4 border-white dark:border-slate-800 shadow-sm mb-4 transition-colors">
            <Feather name="user" size={40} color={colorScheme === 'dark' ? '#818cf8' : '#4f46e5'} />
          </View>
          <Text className="text-slate-500 dark:text-slate-400 font-medium text-sm">{user?.email}</Text>
        </View>

        {/* Global Theme Toggler */}
        <View className="mb-8 bg-white dark:bg-slate-800 rounded-3xl shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-slate-100 dark:border-slate-700 overflow-hidden flex-row items-center justify-between px-5 py-4 transition-colors">
          <View className="flex-row items-center">
            <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${colorScheme === 'dark' ? 'bg-indigo-900/50' : 'bg-amber-100'}`}>
              <Feather name={colorScheme === 'dark' ? 'moon' : 'sun'} size={18} color={colorScheme === 'dark' ? '#818cf8' : '#d97706'} />
            </View>
            <View>
              <Text className="text-slate-800 dark:text-white font-extrabold text-base">{colorScheme === 'dark' ? 'Dark Mode' : 'Light Mode'}</Text>
              <Text className="text-slate-400 text-xs font-medium">Global Theme Sync</Text>
            </View>
          </View>
          <Switch 
            value={colorScheme === 'dark'} 
            onValueChange={toggleColorScheme}
            trackColor={{ false: '#e2e8f0', true: '#4f46e5' }}
            thumbColor={'#ffffff'}
          />
        </View>

        {/* Profile Navigation Hub */}
        <View className="mb-8 bg-white dark:bg-slate-800 rounded-3xl shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
          <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row items-center justify-between px-5 py-4 border-b border-slate-50 dark:border-slate-700/50 active:bg-slate-50 dark:active:bg-slate-700">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 items-center justify-center mr-4">
                <Feather name="calendar" size={18} color={colorScheme === 'dark' ? '#818cf8' : '#4f46e5'} />
              </View>
              <Text className="text-slate-800 dark:text-white font-extrabold text-base">My Bookings</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colorScheme === 'dark' ? '#64748b' : '#cbd5e1'} />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => Alert.alert('Coming Soon', 'Global Guest Management is currently in Beta.')} className="flex-row items-center justify-between px-5 py-4 border-b border-slate-50 dark:border-slate-700/50 active:bg-slate-50 dark:active:bg-slate-700">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 items-center justify-center mr-4">
                <Feather name="users" size={18} color={colorScheme === 'dark' ? '#34d399' : '#10b981'} />
              </View>
              <Text className="text-slate-800 dark:text-white font-extrabold text-base">Master Guest List</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colorScheme === 'dark' ? '#64748b' : '#cbd5e1'} />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => Alert.alert('Billing', 'All your event payments are completely up to date!')} className="flex-row items-center justify-between px-5 py-4 active:bg-slate-50 dark:active:bg-slate-700">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/30 items-center justify-center mr-4">
                <Feather name="credit-card" size={18} color={colorScheme === 'dark' ? '#fbbf24' : '#f59e0b'} />
              </View>
              <Text className="text-slate-800 dark:text-white font-extrabold text-base">Payment History</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colorScheme === 'dark' ? '#64748b' : '#cbd5e1'} />
          </TouchableOpacity>
        </View>

        <Text className="text-slate-900 dark:text-white font-extrabold text-lg mb-4 ml-1">Account Settings</Text>

        <View className="mb-6">
          <Text className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase mb-2 ml-1">Full Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="John Doe"
            placeholderTextColor={colorScheme === 'dark' ? '#475569' : '#cbd5e1'}
            className="bg-white dark:bg-slate-800 px-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium text-base shadow-sm shadow-slate-100 dark:shadow-none transition-colors"
          />
        </View>

        <View className="mb-6">
          <Text className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase mb-2 ml-1">Phone Number</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="+91 98765 43210"
            keyboardType="phone-pad"
            placeholderTextColor={colorScheme === 'dark' ? '#475569' : '#cbd5e1'}
            className="bg-white dark:bg-slate-800 px-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium text-base shadow-sm shadow-slate-100 dark:shadow-none transition-colors"
          />
        </View>
        
        <View className="mb-6">
          <Text className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase mb-2 ml-1">Default Planning Location</Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="Mumbai, Maharashtra"
            placeholderTextColor={colorScheme === 'dark' ? '#475569' : '#cbd5e1'}
            className="bg-white dark:bg-slate-800 px-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium text-base shadow-sm shadow-slate-100 dark:shadow-none transition-colors"
          />
        </View>

        <View className="mb-10 flex-row gap-x-4">
          <View className="flex-1">
            <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase mb-2 ml-1 mt-1">Vendor Map Radius (km)</Text>
            <View className="flex-row items-center bg-white dark:bg-slate-800 px-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm shadow-slate-100 dark:shadow-none transition-colors">
               <Feather name="target" size={16} color={colorScheme === 'dark' ? '#64748b' : '#94a3b8'} />
               <TextInput
                 value={radius}
                 onChangeText={setRadius}
                 keyboardType="numeric"
                 placeholder="20"
                 placeholderTextColor={colorScheme === 'dark' ? '#475569' : '#cbd5e1'}
                 className="flex-1 ml-3 text-slate-900 dark:text-white font-bold text-base"
               />
            </View>
            <Text className="text-slate-400 dark:text-slate-500 text-xs mt-2 ml-1">We'll scan this far globally for venues.</Text>
          </View>
        </View>

        <TouchableOpacity 
          onPress={saveProfile}
          disabled={saving}
          className="w-full bg-indigo-600 dark:bg-indigo-500 py-4 rounded-2xl flex-row justify-center items-center shadow-lg shadow-indigo-600/30 dark:shadow-none active:scale-95 transition-all mb-4"
        >
          {saving ? <ActivityIndicator color="white" /> : (
             <Text className="text-white font-black tracking-wide text-base">Save Preferences</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={handleSignOut}
          className="w-full bg-red-50 dark:bg-red-900/20 py-4 rounded-2xl flex-row justify-center items-center border border-red-100 dark:border-red-900/30 active:bg-red-100 dark:active:bg-red-900/40 transition-colors"
        >
          <Feather name="log-out" size={18} color="#ef4444" />
          <Text className="text-red-500 font-bold ml-2 text-base">Sign Out Natively</Text>
        </TouchableOpacity>
        
      </ScrollView>
    </View>
  );
}
