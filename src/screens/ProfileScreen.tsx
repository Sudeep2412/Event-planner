import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function ProfileScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');

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
    return <View className="flex-1 bg-[#fcfaff] justify-center items-center"><ActivityIndicator size="large" color="#4f46e5"/></View>;
  }

  return (
    <View className="flex-1 bg-[#fcfaff] pt-12">
      <View className="px-6 py-4 flex-row items-center justify-between border-b border-slate-100 bg-white">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-slate-50 items-center justify-center rounded-full border border-slate-100">
          <Feather name="arrow-left" size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-slate-900 tracking-tight">Profile Settings</Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 100 }}>
        
        <View className="items-center mb-6">
          <View className="w-24 h-24 bg-indigo-100 rounded-full items-center justify-center border-4 border-white shadow-sm mb-4">
            <Feather name="user" size={40} color="#4f46e5" />
          </View>
          <Text className="text-slate-500 font-medium text-sm">{user?.email}</Text>
        </View>

        {/* Profile Navigation Hub */}
        <View className="mb-8 bg-white rounded-3xl shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
          <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row items-center justify-between px-5 py-4 border-b border-slate-50 active:bg-slate-50">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-indigo-50 items-center justify-center mr-4">
                <Feather name="calendar" size={18} color="#4f46e5" />
              </View>
              <Text className="text-slate-800 font-extrabold text-base">My Bookings</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#cbd5e1" />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => Alert.alert('Coming Soon', 'Global Guest Management is currently in Beta.')} className="flex-row items-center justify-between px-5 py-4 border-b border-slate-50 active:bg-slate-50">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center mr-4">
                <Feather name="users" size={18} color="#10b981" />
              </View>
              <Text className="text-slate-800 font-extrabold text-base">Master Guest List</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#cbd5e1" />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => Alert.alert('Billing', 'All your event payments are completely up to date!')} className="flex-row items-center justify-between px-5 py-4 active:bg-slate-50">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-orange-50 items-center justify-center mr-4">
                <Feather name="credit-card" size={18} color="#f59e0b" />
              </View>
              <Text className="text-slate-800 font-extrabold text-base">Payment History</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#cbd5e1" />
          </TouchableOpacity>
        </View>

        <Text className="text-slate-900 font-extrabold text-lg mb-4 ml-1">Account Settings</Text>

        <View className="mb-6">
          <Text className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-2 ml-1">Full Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="John Doe"
            placeholderTextColor="#cbd5e1"
            className="bg-white px-4 py-4 rounded-2xl border border-slate-200 text-slate-900 font-medium text-base shadow-sm shadow-slate-100"
          />
        </View>

        <View className="mb-6">
          <Text className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-2 ml-1">Phone Number</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="+91 98765 43210"
            keyboardType="phone-pad"
            placeholderTextColor="#cbd5e1"
            className="bg-white px-4 py-4 rounded-2xl border border-slate-200 text-slate-900 font-medium text-base shadow-sm shadow-slate-100"
          />
        </View>
        
        <View className="mb-10">
          <Text className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-2 ml-1">Default Planning Location</Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="Mumbai, Maharashtra"
            placeholderTextColor="#cbd5e1"
            className="bg-white px-4 py-4 rounded-2xl border border-slate-200 text-slate-900 font-medium text-base shadow-sm shadow-slate-100"
          />
        </View>

        <TouchableOpacity 
          onPress={saveProfile}
          disabled={saving}
          className="w-full bg-indigo-600 py-4 rounded-2xl flex-row justify-center items-center shadow-lg shadow-indigo-600/30 active:scale-95 transition-all mb-4"
        >
          {saving ? <ActivityIndicator color="white" /> : (
             <Text className="text-white font-black tracking-wide text-base">Save Preferences</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={handleSignOut}
          className="w-full bg-red-50 py-4 rounded-2xl flex-row justify-center items-center border border-red-100 active:bg-red-100 transition-all"
        >
          <Feather name="log-out" size={18} color="#ef4444" />
          <Text className="text-red-500 font-bold ml-2 text-base">Sign Out Natively</Text>
        </TouchableOpacity>
        
      </ScrollView>
    </View>
  );
}
