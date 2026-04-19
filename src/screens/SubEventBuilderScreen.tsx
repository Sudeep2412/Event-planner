import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Platform, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

// Tamil Nadu Wedding Function Templates (English labels)
const WEDDING_TEMPLATES = [
  { name: 'Nichayathartham (Engagement)', meal_type: 'dinner', start_time: '18:00', end_time: '21:00', sort_order: 1 },
  { name: 'Mehendi & Haldi', meal_type: 'lunch', start_time: '11:00', end_time: '14:00', sort_order: 2 },
  { name: 'Sangeet Night', meal_type: 'dinner', start_time: '19:00', end_time: '23:00', sort_order: 3 },
  { name: 'Muhurtham (Wedding Ceremony)', meal_type: 'breakfast', start_time: '06:00', end_time: '10:00', sort_order: 4 },
  { name: 'Wedding Lunch', meal_type: 'lunch', start_time: '12:00', end_time: '15:00', sort_order: 5 },
  { name: 'Reception', meal_type: 'dinner', start_time: '18:00', end_time: '22:00', sort_order: 6 },
];

const TAMIL_HINDU_WEDDING_TEMPLATES = [
  { name: 'Nichayathartham & Reception', meal_type: 'dinner', start_time: '18:00', end_time: '21:30', sort_order: 1 },
  { name: 'Muhurtham', meal_type: 'breakfast', start_time: '06:00', end_time: '10:30', sort_order: 2 },
  { name: 'Kalyana Virundhu (Wedding Feast)', meal_type: 'lunch', start_time: '11:30', end_time: '15:00', sort_order: 3 },
  { name: 'Nalangu & Games', meal_type: 'dinner', start_time: '16:00', end_time: '19:30', sort_order: 4 },
];

const MUSLIM_WEDDING_TEMPLATES = [
  { name: 'Mehendi & Haldi', meal_type: 'dinner', start_time: '18:00', end_time: '22:00', sort_order: 1 },
  { name: 'Nikah', meal_type: 'lunch', start_time: '11:00', end_time: '14:00', sort_order: 2 },
  { name: 'Walima (Reception)', meal_type: 'dinner', start_time: '19:00', end_time: '23:30', sort_order: 3 },
];

const CHRISTIAN_WEDDING_TEMPLATES = [
  { name: 'Betrothal', meal_type: 'dinner', start_time: '18:30', end_time: '21:30', sort_order: 1 },
  { name: 'Holy Matrimony', meal_type: 'breakfast', start_time: '09:00', end_time: '11:30', sort_order: 2 },
  { name: 'Grand Reception', meal_type: 'lunch', start_time: '12:30', end_time: '16:00', sort_order: 3 },
];

const BIRTHDAY_TEMPLATES = [
  { name: 'Birthday Party', meal_type: 'dinner', start_time: '18:00', end_time: '22:00', sort_order: 1 },
];

const CORPORATE_TEMPLATES = [
  { name: 'Conference Session', meal_type: 'lunch', start_time: '09:00', end_time: '17:00', sort_order: 1 },
  { name: 'Networking Dinner', meal_type: 'dinner', start_time: '19:00', end_time: '22:00', sort_order: 2 },
];

interface SubEvent {
  id?: string;
  name: string;
  meal_type: string;
  date: string;
  start_time: string;
  end_time: string;
  sort_order: number;
}

const MEAL_OPTIONS = ['breakfast', 'lunch', 'dinner'];
const MEAL_ICONS: Record<string, string> = { breakfast: '🌅', lunch: '☀️', dinner: '🌙' };

export default function SubEventBuilderScreen({ route, navigation }: any) {
  const { eventId, eventType = 'Wedding', eventDate = '2026-12-15' } = route?.params || {};
  const [subEvents, setSubEvents] = useState<SubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadExistingSubEvents();
  }, []);

  const loadExistingSubEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('sub_events')
        .select('*')
        .eq('event_id', eventId)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setSubEvents(data.map(d => ({
          id: d.id,
          name: d.name,
          meal_type: d.meal_type,
          date: d.date,
          start_time: d.start_time,
          end_time: d.end_time,
          sort_order: d.sort_order,
        })));
      }
    } catch (err: any) {
      console.log('Error loading sub-events:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyTemplate = (template: typeof WEDDING_TEMPLATES) => {
    setSubEvents(template.map(t => ({
      ...t,
      date: eventDate,
    })));
  };

  const addCustomFunction = () => {
    setSubEvents(prev => [
      ...prev,
      {
        name: 'New Function',
        meal_type: 'dinner',
        date: eventDate,
        start_time: '18:00',
        end_time: '21:00',
        sort_order: prev.length + 1,
      },
    ]);
  };

  const updateSubEvent = (index: number, field: string, value: string) => {
    setSubEvents(prev => {
      const updated = [...prev];
      (updated[index] as any)[field] = value;
      return updated;
    });
  };

  const removeSubEvent = (index: number) => {
    setSubEvents(prev => prev.filter((_, i) => i !== index));
  };

  const saveAndContinue = async () => {
    if (subEvents.length === 0) {
      return alertMsg('No Functions', 'Please add at least one function to continue.');
    }

    setSaving(true);
    try {
      // Delete existing sub_events for this event (rebuild)
      await supabase.from('sub_events').delete().eq('event_id', eventId);

      // Insert all sub_events
      const rows = subEvents.map((se, idx) => ({
        event_id: eventId,
        name: se.name,
        meal_type: se.meal_type,
        date: se.date,
        start_time: se.start_time,
        end_time: se.end_time,
        sort_order: idx + 1,
      }));

      const { error } = await supabase.from('sub_events').insert(rows);
      if (error) throw error;

      // Navigate to GuestList with the event ID for invite sharing
      navigation.navigate('GuestList', { eventId, hasSubEvents: true });
    } catch (err: any) {
      alertMsg('Save Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const alertMsg = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const getTemplateForType = () => {
    const type = eventType.toLowerCase();
    if (type.includes('wedding')) return WEDDING_TEMPLATES;
    if (type.includes('birthday')) return BIRTHDAY_TEMPLATES;
    if (type.includes('corporate')) return CORPORATE_TEMPLATES;
    return WEDDING_TEMPLATES;
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#FAFAFA] justify-center items-center">
        <ActivityIndicator size="large" color="#0f172a" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#FAFAFA] pt-12">
      {/* Header */}
      <View className="px-6 py-5 flex-row items-center border-b border-slate-100 bg-white z-10 shadow-sm">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 mr-3 bg-slate-50 border border-slate-100 rounded-full">
          <Feather name="arrow-left" size={20} color="#0f172a" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-xl font-black text-slate-900 tracking-tight">Configure Functions</Text>
          <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Sub-Event Builder</Text>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        {/* Template Selector */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 ml-1">Quick Templates</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              onPress={() => applyTemplate(WEDDING_TEMPLATES)}
              className="mr-3 px-5 py-3 rounded-2xl bg-slate-900 border border-slate-900 shadow-sm"
            >
              <Text className="font-bold text-sm text-white">💍 Wedding</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => applyTemplate(TAMIL_HINDU_WEDDING_TEMPLATES)}
              className="mr-3 px-5 py-3 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm"
            >
              <Text className="font-bold text-sm text-amber-900">🪔 Tamil Hindu Wedding</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => applyTemplate(MUSLIM_WEDDING_TEMPLATES)}
              className="mr-3 px-5 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm"
            >
              <Text className="font-bold text-sm text-emerald-900">🕌 Muslim Wedding</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => applyTemplate(CHRISTIAN_WEDDING_TEMPLATES)}
              className="mr-3 px-5 py-3 rounded-2xl bg-sky-50 border border-sky-200 shadow-sm"
            >
              <Text className="font-bold text-sm text-sky-900">⛪ Christian Wedding</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => applyTemplate(BIRTHDAY_TEMPLATES)}
              className="mr-3 px-5 py-3 rounded-2xl bg-white border border-slate-200 shadow-sm"
            >
              <Text className="font-bold text-sm text-slate-700">🎂 Birthday</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => applyTemplate(CORPORATE_TEMPLATES)}
              className="mr-3 px-5 py-3 rounded-2xl bg-white border border-slate-200 shadow-sm"
            >
              <Text className="font-bold text-sm text-slate-700">💼 Corporate</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSubEvents([])}
              className="mr-3 px-5 py-3 rounded-2xl bg-white border border-slate-200 shadow-sm"
            >
              <Text className="font-bold text-sm text-slate-700">✨ Custom</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Serve Smart Branding */}
        <View className="mx-6 mb-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex-row items-center">
          <Text className="text-2xl mr-3">🌿</Text>
          <View className="flex-1">
            <Text className="text-emerald-800 font-black text-sm">Serve Smart — Zero Waste Celebrations</Text>
            <Text className="text-emerald-600 text-xs font-medium mt-0.5">Every plate planned, no meal wasted.</Text>
          </View>
        </View>

        {/* Sub-Event Cards */}
        {subEvents.length === 0 ? (
          <View className="mx-6 bg-white rounded-3xl p-10 border border-slate-100 shadow-sm items-center">
            <Feather name="plus-circle" size={48} color="#cbd5e1" />
            <Text className="text-slate-500 font-bold mt-4 text-center">No functions added yet.{"\n"}Use a template or add custom functions.</Text>
          </View>
        ) : (
          subEvents.map((se, index) => (
            <View key={index} className="mx-6 mb-5 bg-white rounded-3xl border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.04)] overflow-hidden">
              {/* Card Header */}
              <View className="flex-row items-center justify-between px-5 pt-5 pb-3">
                <View className="flex-row items-center flex-1 mr-3">
                  <View className="w-10 h-10 bg-slate-900 rounded-xl items-center justify-center mr-3">
                    <Text className="text-lg">{MEAL_ICONS[se.meal_type] || '🍽️'}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest">Function #{index + 1}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => removeSubEvent(index)} className="w-9 h-9 bg-red-50 rounded-full items-center justify-center border border-red-100">
                  <Feather name="trash-2" size={14} color="#ef4444" />
                </TouchableOpacity>
              </View>

              <View className="px-5 pb-5">
                {/* Function Name */}
                <Text className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-0.5">Function Name</Text>
                <TextInput
                  value={se.name}
                  onChangeText={(val) => updateSubEvent(index, 'name', val)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold mb-4"
                />

                {/* Meal Type Selector */}
                <Text className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-0.5">Meal Type</Text>
                <View className="flex-row mb-4 gap-x-2">
                  {MEAL_OPTIONS.map(meal => (
                    <TouchableOpacity
                      key={meal}
                      onPress={() => updateSubEvent(index, 'meal_type', meal)}
                      className={`flex-1 py-3 rounded-xl border items-center ${se.meal_type === meal ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-200'}`}
                    >
                      <Text className={`font-bold text-sm capitalize ${se.meal_type === meal ? 'text-white' : 'text-slate-600'}`}>
                        {MEAL_ICONS[meal]} {meal}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Date */}
                <Text className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-0.5">Date</Text>
                <TextInput
                  value={se.date}
                  onChangeText={(val) => updateSubEvent(index, 'date', val)}
                  placeholder="YYYY-MM-DD"
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold mb-4"
                />

                {/* Time Range */}
                <View className="flex-row gap-x-3">
                  <View className="flex-1">
                    <Text className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-0.5">Start Time</Text>
                    <TextInput
                      value={se.start_time}
                      onChangeText={(val) => updateSubEvent(index, 'start_time', val)}
                      placeholder="HH:MM"
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-0.5">End Time</Text>
                    <TextInput
                      value={se.end_time}
                      onChangeText={(val) => updateSubEvent(index, 'end_time', val)}
                      placeholder="HH:MM"
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold"
                    />
                  </View>
                </View>
              </View>
            </View>
          ))
        )}

        {/* Add Custom Function Button */}
        <TouchableOpacity
          onPress={addCustomFunction}
          className="mx-6 mt-2 mb-4 py-4 rounded-2xl border-2 border-dashed border-slate-300 items-center flex-row justify-center"
        >
          <Feather name="plus" size={18} color="#64748b" />
          <Text className="text-slate-500 font-bold ml-2">Add Custom Function</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom CTA */}
      <View className="absolute bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-xl border-t border-slate-100 pb-10 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <TouchableOpacity
          onPress={saveAndContinue}
          disabled={saving || subEvents.length === 0}
          className={`w-full py-4 rounded-2xl flex-row items-center justify-center shadow-lg ${subEvents.length === 0 ? 'bg-slate-300' : 'bg-slate-900'}`}
        >
          {saving ? <ActivityIndicator color="#fff" /> : (
            <>
              <Text className="text-white font-extrabold text-base mr-3 tracking-wide">Save & Generate Invite Link</Text>
              <Feather name="arrow-right" size={20} color="white" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
