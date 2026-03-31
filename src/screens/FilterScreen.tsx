import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../lib/supabase';

const MUHURATS = [
  { date: '2026-11-24', label: 'Nov 24', tag: 'Auspicious' },
  { date: '2026-12-05', label: 'Dec 05', tag: 'Auspicious' },
  { date: '2026-12-15', label: 'Dec 15', tag: 'Premium', premium: true },
];

export default function FilterScreen({ onBack, onDiscoveryReady, occasionId }: any) {
  const occasionTitle = occasionId ? occasionId.charAt(0).toUpperCase() + occasionId.slice(1) : 'Event';
  
  const [title, setTitle] = useState(`${occasionTitle} Celebration`);
  const [date, setDate] = useState('2026-12-15');
  const [budget, setBudget] = useState('500000');
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const getPickerDate = () => {
    const parts = date.split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }
    return new Date();
  };

  const handleCreateEvent = async () => {
    const safeTitle = title.trim();
    if (!safeTitle || !date.trim() || !budget.trim()) {
      return alertOrConsole("Missing Details", "Please fill out all fields to continue.");
    }
    
    const parsedBudget = parseFloat(budget.replace(/,/g, ''));
    if (isNaN(parsedBudget) || parsedBudget <= 0) {
      return alertOrConsole("Invalid Budget", "Please enter a valid numerical budget (e.g., 500000).");
    }

    const [year, month, day] = date.split('-');
    if (!year || !month || !day || year.length !== 4 || month.length !== 2 || day.length !== 2) {
      return alertOrConsole("Invalid Format", "Please format the date exactly as YYYY-MM-DD.");
    }

    const eventDate = new Date(parseInt(year, 10), parseInt(month, 10)-1, parseInt(day, 10));
    const today = new Date();
    today.setHours(0,0,0,0);
    
    if (isNaN(eventDate.getTime())) {
      return alertOrConsole("Invalid Date Structure", "The date provided could not be parsed.");
    }
    if (eventDate < today) {
      return alertOrConsole("Time Travel Detected", "You cannot plan an event in the past. Please select a future date.");
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authentication error. Please log in again.");

      await supabase.from('profiles').upsert({ id: user.id, role: 'planner' });

      const { data, error } = await supabase
        .from('events')
        .insert({
          organizer_id: user.id,
          title: safeTitle,
          location: 'Mumbai', 
          type: occasionTitle,
          date,
          total_budget: parsedBudget
        })
        .select()
        .single();
        
      if (error) throw error;

      onDiscoveryReady(occasionTitle, parsedBudget, data.id); 
    } catch (err: any) {
      alertOrConsole('Error creating event', err.message);
    } finally {
      setLoading(false);
    }
  };

  const alertOrConsole = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  return (
    <View className="flex-1 bg-[#FAFAFA] pt-12">
      <View className="px-6 py-5 flex-row items-center border-b border-slate-100 bg-white z-10 shadow-sm">
        <TouchableOpacity onPress={onBack} className="p-2 mr-3 bg-slate-50 border border-slate-100 rounded-full">
          <Feather name="arrow-left" size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-slate-900 tracking-tight">Event Builder</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-8 bg-[#FAFAFA]" contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View className="mb-10">
          <Text className="text-[34px] font-black leading-tight text-slate-900 tracking-tight">
            Configure your {occasionTitle.toLowerCase()}
          </Text>
          <Text className="text-base text-slate-500 mt-2 font-medium">
            Let's establish the foundational parameters so we can source the perfect vendors for your elite experience.
          </Text>
        </View>

        <View className="space-y-6">
          <View>
            <Text className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2.5 ml-1">Event Title</Text>
            <TextInput
              className="w-full bg-white px-5 py-4 rounded-xl border border-slate-200 text-slate-900 font-bold shadow-sm"
              value={title}
              onChangeText={setTitle}
            />
          </View>
          
          <View className="mt-6">
            <Text className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2.5 ml-1">Proposed Date</Text>
            {Platform.OS === 'web' ? (
              <TextInput
                className="w-full bg-white px-5 py-4 rounded-xl border border-slate-200 text-slate-900 font-bold shadow-sm"
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
              />
            ) : (
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="w-full bg-white px-5 py-4 rounded-xl border border-slate-200 shadow-sm flex-row items-center justify-between"
              >
                <Text className="text-slate-900 font-bold text-base">{date}</Text>
                <Feather name="calendar" size={20} color="#94a3b8" />
              </TouchableOpacity>
            )}

            {showDatePicker && Platform.OS !== 'web' && (
              <DateTimePicker
                value={getPickerDate()}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (event.type === 'set' && selectedDate) {
                    const year = selectedDate.getFullYear();
                    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                    const day = String(selectedDate.getDate()).padStart(2, '0');
                    setDate(`${year}-${month}-${day}`);
                  } else if (event.type === 'dismissed') {
                    setShowDatePicker(false);
                  }
                }}
              />
            )}
            
            {/* Muhurat Engine VIP Feature */}
            <View className="mt-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
               <View className="flex-row items-center mb-4">
                 <Feather name="star" size={16} color="#0f172a" className="mr-2" />
                 <Text className="text-sm font-black text-slate-900 tracking-wider">Auspicious Dates (Muhurats)</Text>
               </View>
               <View className="flex-row flex-wrap gap-3">
                 {MUHURATS.map(m => {
                   const isSelected = date === m.date;
                   if (m.premium) {
                     return (
                       <TouchableOpacity key={m.date} onPress={() => setDate(m.date)} className={`flex-row items-center px-4 py-3 rounded-xl border shadow-sm ${isSelected ? 'bg-slate-900 border-slate-900' : 'bg-amber-50 border-amber-200/50'}`}>
                         <Text className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-slate-900'}`}>{m.label}</Text>
                         <View className={`ml-2 px-1.5 py-0.5 rounded ${isSelected ? 'bg-white/20' : 'bg-amber-100'}`}><Text className={`text-[10px] font-black uppercase tracking-wider ${isSelected ? 'text-white' : 'text-amber-700'}`}>{m.tag}</Text></View>
                       </TouchableOpacity>
                     );
                   }
                   return (
                     <TouchableOpacity key={m.date} onPress={() => setDate(m.date)} className={`flex-row items-center px-4 py-3 rounded-xl border shadow-sm ${isSelected ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-200'}`}>
                       <Text className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-slate-900'}`}>{m.label}</Text>
                       <View className={`ml-2 px-1.5 py-0.5 rounded ${isSelected ? 'bg-white/20' : 'bg-slate-100'}`}><Text className={`text-[10px] font-black uppercase tracking-wider ${isSelected ? 'text-white' : 'text-slate-500'}`}>{m.tag}</Text></View>
                     </TouchableOpacity>
                   );
                 })}
               </View>
            </View>
          </View>

          <View className="mt-6">
            <Text className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2.5 ml-1">Estimated Budget (₹)</Text>
            <View className="flex-row items-center bg-white px-5 py-4 rounded-xl border border-slate-200 shadow-sm">
                <Text className="text-slate-400 font-bold mr-2">₹</Text>
                <TextInput
                className="flex-1 text-slate-900 font-bold"
                value={budget}
                onChangeText={setBudget}
                keyboardType="numeric"
                />
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-slate-100 pb-10 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleCreateEvent}
          disabled={loading}
          className="w-full bg-[#1A1A1A] py-4 rounded-xl flex-row items-center justify-center shadow-lg active:scale-[98%] transition-all"
        >
          {loading ? <ActivityIndicator color="#fff" /> : (
            <>
              <Text className="text-white font-extrabold text-base mr-3 tracking-wide">Continue to Vendor Match</Text>
              <Feather name="arrow-right" size={20} color="white" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
