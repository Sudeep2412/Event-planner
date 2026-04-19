import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useColorScheme } from 'nativewind';

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  start_time: string;
  sort_order: number;
}

export default function TimelineBuilderScreen({ route, navigation }: any) {
  const { eventId } = route?.params || {};
  const { colorScheme } = useColorScheme();
  
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  
  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTime, setNewTime] = useState('09:00'); // simple HH:MM mock

  useEffect(() => {
    fetchTimeline();
  }, []);

  const fetchTimeline = async () => {
    try {
      const { data, error } = await supabase
        .from('timeline_events')
        .select('*')
        .eq('event_id', eventId)
        .order('start_time', { ascending: true }); // Chronological

      if (error) throw error;
      setEvents(data || []);
    } catch (err: any) {
      console.log('Error fetching timeline:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const addTimelineEvent = async () => {
    if (!newTitle || !newTime) {
      Alert.alert('Missing Info', 'Please provide a title and time.');
      return;
    }

    try {
      setLoading(true);
      // Construct a valid postgres time string (HH:MM:00)
      const timeStr = newTime.length === 5 ? `${newTime}:00` : newTime;

      const { data, error } = await supabase.from('timeline_events').insert({
        event_id: eventId,
        title: newTitle,
        description: newDesc,
        start_time: timeStr
      }).select().single();

      if (error) throw error;
      
      // Auto-sort on client
      const updated = [...events, data].sort((a, b) => a.start_time.localeCompare(b.start_time));
      setEvents(updated);
      
      setShowAddForm(false);
      setNewTitle('');
      setNewDesc('');
      setNewTime('09:00');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await supabase.from('timeline_events').delete().eq('id', id);
      setEvents(events.filter(e => e.id !== id));
    } catch (err: any) {
      console.log(err.message);
    }
  };

  const formatTimeUI = (time: string) => {
    if (!time) return '';
    try {
      const [h, m] = time.split(':');
      const hour = parseInt(h);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${displayHour}:${m} ${ampm}`;
    } catch (e) {
      return time;
    }
  };

  if (loading && events.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-[#FAFAFA] dark:bg-slate-900 transition-colors">
        <ActivityIndicator size="large" color="#d97706" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#FAFAFA] dark:bg-slate-950 pt-12 transition-colors">
      {/* Header */}
      <View className="px-6 py-5 flex-row items-center border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 shadow-sm transition-colors">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 mr-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full">
          <Feather name="arrow-left" size={20} color={colorScheme === 'dark' ? '#f8fafc' : '#0f172a'} />
        </TouchableOpacity>
        <View className="flex-1 flex-row items-center justify-between">
          <View>
            <Text className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Itinerary Builder</Text>
            <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">Chronological Matrix</Text>
          </View>
          <TouchableOpacity onPress={() => setShowAddForm(!showAddForm)} className="bg-amber-100 dark:bg-amber-900/40 w-10 h-10 rounded-full flex-row items-center justify-center">
             <Feather name={showAddForm ? "x" : "plus"} size={20} color={colorScheme === 'dark' ? '#fbbf24' : '#d97706'} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        {/* Add Form Dropdown */}
        {showAddForm && (
          <View className="m-6 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-none transition-colors">
            
            <Text className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">Event Title</Text>
            <TextInput value={newTitle} onChangeText={setNewTitle} placeholder="e.g. VIP Reception" placeholderTextColor={colorScheme === 'dark' ? '#475569' : '#cbd5e1'} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white mb-4" />
            
            <View className="flex-row gap-x-3 mb-4">
              <View className="flex-1">
                <Text className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2 ml-1">Time (24H)</Text>
                <TextInput value={newTime} onChangeText={setNewTime} placeholder="14:30" placeholderTextColor={colorScheme === 'dark' ? '#475569' : '#cbd5e1'} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white text-center tracking-widest" maxLength={5} />
              </View>
            </View>

            <Text className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">Description (Optional)</Text>
            <TextInput value={newDesc} onChangeText={setNewDesc} placeholder="Waiters must be ready with drinks." placeholderTextColor={colorScheme === 'dark' ? '#475569' : '#cbd5e1'} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 font-medium text-slate-900 dark:text-white mb-6" multiline style={{ minHeight: 80 }} />

            <TouchableOpacity onPress={addTimelineEvent} className="w-full bg-slate-900 dark:bg-amber-600 py-4 rounded-xl items-center shadow-lg active:scale-95 transition-all">
              <Text className="text-white font-black tracking-widest uppercase">Insert into Timeline</Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="px-8 pt-8">
          {events.length === 0 && !showAddForm ? (
            <View className="py-16 items-center justify-center">
              <Feather name="clock" size={48} color={colorScheme === 'dark' ? '#334155' : '#e2e8f0'} />
              <Text className="text-slate-400 dark:text-slate-500 font-bold mt-4 text-center">Your timeline is empty.{"\n"}Add your first event.</Text>
            </View>
          ) : (
            events.map((event, index) => {
              const isLast = index === events.length - 1;
              return (
                <View key={event.id} className="flex-row relative">
                  {/* Left Timeline Axis */}
                  <View className="w-16 items-center mr-4">
                    <Text className="text-slate-900 dark:text-white font-black text-sm">{formatTimeUI(event.start_time).split(' ')[0]}</Text>
                    <Text className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase">{formatTimeUI(event.start_time).split(' ')[1]}</Text>
                    
                    {/* Vertical Line */}
                    {!isLast && <View className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-800 my-2 rounded-full" />}
                  </View>

                  {/* Dot Marker */}
                  <View className="absolute left-[54px] top-1 w-3 h-3 rounded-full bg-amber-400 border-2 border-white dark:border-slate-950 z-10 shadow-sm" />

                  {/* Card Content */}
                  <View className="flex-1 pb-8">
                    <View className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
                      <View className="flex-row justify-between items-start">
                        <Text className="text-slate-900 dark:text-white font-black text-lg flex-1 mr-2">{event.title}</Text>
                        <TouchableOpacity onPress={() => deleteEvent(event.id)} className="p-1">
                          <Feather name="trash-2" size={14} color="#f87171" />
                        </TouchableOpacity>
                      </View>
                      
                      {event.description ? (
                         <Text className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-2 leading-relaxed">{event.description}</Text>
                      ) : null}
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

      </ScrollView>
    </View>
  );
}
