import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function FilterScreen({ onBack, onDiscoveryReady, occasionId }: any) {
  const occasionTitle = occasionId ? occasionId.charAt(0).toUpperCase() + occasionId.slice(1) : 'Event';
  
  const [title, setTitle] = useState(`${occasionTitle} Celebration`);
  const [date, setDate] = useState('2026-12-15');
  const [budget, setBudget] = useState('500000');
  const [loading, setLoading] = useState(false);

  const handleCreateEvent = async () => {
    const safeTitle = title.trim();
    if (!safeTitle || !date.trim() || !budget.trim()) {
      return Alert.alert("Missing Details", "Please fill out all fields to continue.");
    }
    
    const parsedBudget = parseFloat(budget.replace(/,/g, ''));
    if (isNaN(parsedBudget) || parsedBudget <= 0) {
      return Alert.alert("Invalid Budget", "Please enter a valid numerical budget (e.g., 500000).");
    }

    const eventDate = new Date(date);
    const today = new Date();
    today.setHours(0,0,0,0);
    
    if (isNaN(eventDate.getTime())) {
      return Alert.alert("Invalid Date Structure", "Please format the date as YYYY-MM-DD. Example: 2026-12-15.");
    }
    if (eventDate < today) {
      return Alert.alert("Time Travel Detected", "You cannot plan an event in the past. Please select a future date.");
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authentication error. Please log in again.");

      // Ensure the user profile exists before creating an event (solves FK 409 Conflict)
      await supabase.from('profiles').upsert({ id: user.id, role: 'planner' });

      const { data, error } = await supabase
        .from('events')
        .insert({
          organizer_id: user.id,
          title: safeTitle,
          location: 'Mumbai', // Defaulting for MVP
          type: occasionTitle,
          date,
          total_budget: parsedBudget
        })
        .select()
        .single();
        
      if (error) throw error;

      const eventType = occasionTitle;
      onDiscoveryReady(eventType, parsedBudget, data.id); // Passing payload to navigation
    } catch (err: any) {
      Alert.alert('Error creating event', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#fcfaff] pt-12">
      <View className="px-4 py-4 border-b border-slate-100 flex-row items-center bg-white z-10">
        <TouchableOpacity onPress={onBack} className="p-2 mr-2 bg-slate-50 rounded-full">
          <Feather name="arrow-left" size={20} color="#334155" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-900">Event Builder</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="mb-8 mt-2">
          <Text className="text-3xl font-extrabold leading-tight text-slate-900 tracking-tight">
            Configure your {occasionTitle.toLowerCase()}
          </Text>
          <Text className="text-base text-slate-500 mt-2">
            Let's set up the foundational details for your event so we can find the perfect vendors and manage your budget.
          </Text>
        </View>

        <View className="space-y-6">
          <View>
            <Text className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Event Title</Text>
            <TextInput
              className="w-full bg-white px-5 py-4 rounded-2xl border border-slate-200 text-slate-900 font-bold shadow-sm"
              value={title}
              onChangeText={setTitle}
            />
          </View>
          
          <View className="mt-4">
            <Text className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Date (YYYY-MM-DD)</Text>
            <TextInput
              className="w-full bg-white px-5 py-4 rounded-2xl border border-slate-200 text-slate-900 font-bold shadow-sm"
              value={date}
              onChangeText={setDate}
            />
            {/* Muhurat Engine VIP Feature */}
            <View className="mt-4 bg-amber-50/60 p-4 rounded-2xl border border-amber-100">
               <Text className="text-xs font-black text-amber-900 uppercase tracking-widest mb-3">Auspicious Muhurats 🌟</Text>
               <View className="flex-row flex-wrap gap-2">
                 <TouchableOpacity onPress={() => setDate('2026-11-24')} className="bg-white px-4 py-2.5 rounded-xl border border-amber-200 shadow-sm"><Text className="text-amber-800 font-bold text-xs">Nov 24</Text></TouchableOpacity>
                 <TouchableOpacity onPress={() => setDate('2026-12-05')} className="bg-white px-4 py-2.5 rounded-xl border border-amber-200 shadow-sm"><Text className="text-amber-800 font-bold text-xs">Dec 05</Text></TouchableOpacity>
                 <TouchableOpacity onPress={() => setDate('2026-12-15')} className="bg-white px-4 py-2.5 rounded-xl border-amber-500 bg-amber-500 shadow-sm"><Text className="text-white font-bold text-xs">Dec 15 (Premium)</Text></TouchableOpacity>
               </View>
            </View>
          </View>

          <View className="mt-4">
            <Text className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Estimated Budget (₹)</Text>
            <TextInput
              className="w-full bg-white px-5 py-4 rounded-2xl border border-slate-200 text-slate-900 font-bold shadow-sm"
              value={budget}
              onChangeText={setBudget}
              keyboardType="numeric"
            />
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-0 w-full p-6 bg-white border-t border-slate-100 pb-10 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleCreateEvent}
          disabled={loading}
          className="w-full bg-[#1A1A1A] py-4 rounded-2xl items-center shadow-lg flex-row justify-center"
        >
          {loading ? <ActivityIndicator color="#fff" /> : (
            <>
              <Text className="text-white font-bold text-lg mr-2">Create & Discover Vendors</Text>
              <Feather name="arrow-right" size={20} color="white" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
