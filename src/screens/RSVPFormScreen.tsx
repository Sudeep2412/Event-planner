import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Platform, ActivityIndicator, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

interface SubEvent {
  id: string;
  name: string;
  meal_type: string;
  date: string;
  start_time: string;
  end_time: string;
  sort_order: number;
}

interface SubEventChoice {
  sub_event_id: string;
  attending: boolean;
  person_count: number;
  veg_count: number;
  nonveg_count: number;
  driver_count: number;
  driver_meal_pref: string;
  has_driver: boolean;
}

const MEAL_ICONS: Record<string, string> = { breakfast: '🌅', lunch: '☀️', dinner: '🌙' };

export default function RSVPFormScreen({ route, navigation }: any) {
  const { eventId } = route?.params || {};
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [subEvents, setSubEvents] = useState<SubEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Guest Details
  const [guestName, setGuestName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [sameAsMobile, setSameAsMobile] = useState(true);

  // Sub-event choices
  const [choices, setChoices] = useState<Record<string, SubEventChoice>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadEventData();
  }, []);

  useEffect(() => {
    if (sameAsMobile) {
      setWhatsappNumber(mobileNumber);
    }
  }, [sameAsMobile, mobileNumber]);

  const loadEventData = async () => {
    try {
      // Fetch event info
      const { data: event, error: eventError } = await supabase.from('events').select('title, date, location').eq('id', eventId).single();
      if (eventError || !event) {
        setEventTitle('');
        return;
      }
      
      setEventTitle(event.title || 'Event');
      setEventDate(event.date || '');

      // Fetch sub-events
      const { data: subs, error } = await supabase
        .from('sub_events')
        .select('*')
        .eq('event_id', eventId)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      if (subs && subs.length > 0) {
        setSubEvents(subs);
        // Initialize choices
        const initial: Record<string, SubEventChoice> = {};
        subs.forEach(se => {
          initial[se.id] = {
            sub_event_id: se.id,
            attending: false,
            person_count: 1,
            veg_count: 1,
            nonveg_count: 0,
            driver_count: 0,
            driver_meal_pref: 'veg',
            has_driver: false,
          };
        });
        setChoices(initial);
      }
    } catch (err: any) {
      console.log('Error loading event:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateChoice = (subEventId: string, field: string, value: any) => {
    setChoices(prev => {
      const updated = { ...prev };
      const choice = { ...updated[subEventId], [field]: value };

      // Auto-sync veg + nonveg = person_count
      if (field === 'person_count') {
        const total = value;
        if (choice.veg_count + choice.nonveg_count !== total) {
          choice.veg_count = total;
          choice.nonveg_count = 0;
        }
      }
      if (field === 'veg_count') {
        choice.nonveg_count = Math.max(0, choice.person_count - value);
      }
      if (field === 'nonveg_count') {
        choice.veg_count = Math.max(0, choice.person_count - value);
      }

      updated[subEventId] = choice;
      return updated;
    });
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${m} ${ampm}`;
  };

  const submitRSVP = async () => {
    if (!guestName.trim()) return alertMsg('Missing Name', 'Please enter your full name.');
    if (!mobileNumber.trim()) return alertMsg('Missing Number', 'Please enter your mobile number.');
    if (!whatsappNumber.trim()) return alertMsg('Missing WhatsApp', 'Please enter your WhatsApp number.');

    const attending = Object.values(choices).filter(c => c.attending);
    if (attending.length === 0) return alertMsg('No Functions Selected', 'Please select at least one function you will attend.');

    // Validate counts
    for (const c of attending) {
      if (c.person_count < 1) return alertMsg('Invalid Count', 'Person count must be at least 1 for each selected function.');
      if (c.veg_count + c.nonveg_count !== c.person_count) {
        return alertMsg('Meal Count Mismatch', `Veg (${c.veg_count}) + Non-Veg (${c.nonveg_count}) must equal total persons (${c.person_count}).`);
      }
    }

    setSubmitting(true);
    try {
      // Insert RSVP response
      const { data: rsvp, error: rsvpError } = await supabase
        .from('rsvp_responses')
        .insert({
          event_id: eventId,
          guest_name: guestName.trim(),
          mobile_number: mobileNumber.trim(),
          whatsapp_number: whatsappNumber.trim(),
        })
        .select()
        .single();

      if (rsvpError) throw rsvpError;

      // Insert sub-event choices
      const choiceRows = attending.map(c => ({
        rsvp_id: rsvp.id,
        sub_event_id: c.sub_event_id,
        person_count: c.person_count,
        veg_count: c.veg_count,
        nonveg_count: c.nonveg_count,
        driver_count: c.has_driver ? c.driver_count : 0,
        driver_meal_pref: c.driver_meal_pref,
        qr_hash: `RSVP-${c.sub_event_id.substring(0, 6)}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      }));

      const { data: insertedChoices, error: choiceError } = await supabase
        .from('rsvp_sub_event_choices')
        .insert(choiceRows)
        .select();

      if (choiceError) throw choiceError;

      // Also add to attendees table for backwards compatibility
      await supabase.from('attendees').insert({
        event_id: eventId,
        name: guestName.trim(),
        phone: mobileNumber.trim(),
        whatsapp_number: whatsappNumber.trim(),
        rsvp_id: rsvp.id,
        qr_hash: `QR-${rsvp.id.substring(0, 8)}`,
        status: 'pending',
      });

      // Navigate to confirmation with all generated QR data
      navigation.replace('RSVPConfirmation', {
        guestName: guestName.trim(),
        eventTitle,
        choices: insertedChoices,
        subEvents: subEvents.filter(se => attending.some(a => a.sub_event_id === se.id)),
      });
    } catch (err: any) {
      alertMsg('RSVP Error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const alertMsg = (title: string, message: string) => {
    if (Platform.OS === 'web') window.alert(`${title}: ${message}`);
    else Alert.alert(title, message);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#FAFAFA] justify-center items-center">
        <ActivityIndicator size="large" color="#0f172a" />
        <Text className="text-slate-500 font-bold mt-4">Loading invitation...</Text>
      </View>
    );
  }

  if (!eventTitle) {
    return (
      <View className="flex-1 bg-[#FAFAFA] justify-center items-center px-8">
        <View className="w-24 h-24 bg-red-50 rounded-full items-center justify-center mb-6">
          <Feather name="x-circle" size={40} color="#ef4444" />
        </View>
        <Text className="text-3xl text-slate-900 font-black text-center mb-2 tracking-tight">Event Not Found</Text>
        <Text className="text-slate-500 text-center font-medium leading-relaxed">
          The invitation link you clicked is either expired or invalid. Please request a new link from the event planner.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#FAFAFA] pt-12">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>

        {/* Invitation Header */}
        <View className="mx-6 mt-4 mb-6 bg-white rounded-[32px] p-8 border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] items-center overflow-hidden relative">
          <View className="absolute -right-16 -top-16 w-48 h-48 bg-emerald-50 rounded-full opacity-60" />
          <View className="absolute -left-10 -bottom-10 w-32 h-32 bg-indigo-50 rounded-full opacity-50" />

          <View className="w-14 h-14 bg-slate-900 rounded-2xl items-center justify-center mb-4 shadow-lg z-10">
            <Feather name="mail" size={24} color="white" />
          </View>
          <Text className="text-slate-900 text-3xl font-black text-center tracking-tight z-10">{eventTitle}</Text>
          <Text className="text-slate-500 font-bold mt-2 text-sm z-10">📅 {eventDate}</Text>

          {/* Serve Smart Badge */}
          <View className="mt-4 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-2 flex-row items-center z-10">
            <Text className="text-sm mr-1.5">🌿</Text>
            <Text className="text-emerald-700 text-xs font-black tracking-wide">Serve Smart — Zero Waste</Text>
          </View>
        </View>

        {/* Guest Details Section */}
        <View className="mx-6 mb-6">
          <Text className="text-lg font-black text-slate-900 mb-4 tracking-tight">Your Details</Text>

          <View className="mb-4">
            <Text className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Full Name</Text>
            <TextInput
              value={guestName}
              onChangeText={setGuestName}
              placeholder="Enter your full name"
              placeholderTextColor="#94a3b8"
              className="bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 font-bold shadow-sm"
            />
          </View>

          <View className="mb-4">
            <Text className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">📱 Mobile Number</Text>
            <View className="flex-row items-center bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <Text className="text-slate-500 font-bold pl-4 pr-2">+91</Text>
              <TextInput
                value={mobileNumber}
                onChangeText={setMobileNumber}
                placeholder="98765 43210"
                keyboardType="phone-pad"
                placeholderTextColor="#94a3b8"
                className="flex-1 px-2 py-3.5 text-slate-900 font-bold"
              />
            </View>
          </View>

          <View className="mb-3">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">💬 WhatsApp Number</Text>
              <View className="flex-row items-center">
                <Text className="text-xs text-slate-500 font-medium mr-2">Same as mobile</Text>
                <Switch
                  value={sameAsMobile}
                  onValueChange={setSameAsMobile}
                  trackColor={{ false: '#e2e8f0', true: '#86efac' }}
                  thumbColor={sameAsMobile ? '#059669' : '#94a3b8'}
                />
              </View>
            </View>
            {!sameAsMobile && (
              <View className="flex-row items-center bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <Text className="text-slate-500 font-bold pl-4 pr-2">+91</Text>
                <TextInput
                  value={whatsappNumber}
                  onChangeText={setWhatsappNumber}
                  placeholder="98765 43210"
                  keyboardType="phone-pad"
                  placeholderTextColor="#94a3b8"
                  className="flex-1 px-2 py-3.5 text-slate-900 font-bold"
                />
              </View>
            )}
          </View>
        </View>

        {/* Function Selection */}
        <View className="mx-6 mb-4">
          <Text className="text-lg font-black text-slate-900 mb-1 tracking-tight">Select Functions</Text>
          <Text className="text-sm text-slate-500 font-medium mb-5">Choose the events you will attend and specify your meal preferences.</Text>

          {subEvents.map(se => {
            const choice = choices[se.id];
            if (!choice) return null;

            return (
              <View
                key={se.id}
                className={`mb-5 rounded-3xl border overflow-hidden shadow-sm ${choice.attending
                  ? 'bg-white border-emerald-200 shadow-[0_4px_16px_rgba(5,150,105,0.08)]'
                  : 'bg-slate-50 border-slate-200 opacity-70'
                }`}
              >
                {/* Function Header */}
                <TouchableOpacity
                  onPress={() => updateChoice(se.id, 'attending', !choice.attending)}
                  className="flex-row items-center justify-between p-5"
                  activeOpacity={0.8}
                >
                  <View className="flex-row items-center flex-1 mr-3">
                    <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${choice.attending ? 'bg-emerald-100' : 'bg-slate-200'}`}>
                      <Text className="text-xl">{MEAL_ICONS[se.meal_type] || '🍽️'}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-slate-900 font-black text-base">{se.name}</Text>
                      <Text className="text-slate-500 text-xs font-bold mt-1">
                        {se.date} · {formatTime(se.start_time)} - {formatTime(se.end_time)}
                      </Text>
                    </View>
                  </View>
                  <View className={`w-8 h-8 rounded-full border-2 items-center justify-center ${choice.attending
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'border-slate-300'
                  }`}>
                    {choice.attending && <Feather name="check" size={16} color="white" />}
                  </View>
                </TouchableOpacity>

                {/* Expanded Details */}
                {choice.attending && (
                  <View className="px-5 pb-5 border-t border-slate-100 pt-4">
                    {/* Person Count */}
                    <View className="flex-row items-center justify-between mb-5">
                      <Text className="text-slate-700 font-bold text-sm">Number of Persons</Text>
                      <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                        <TouchableOpacity
                          onPress={() => updateChoice(se.id, 'person_count', Math.max(1, choice.person_count - 1))}
                          className="px-4 py-2.5"
                        >
                          <Feather name="minus" size={16} color="#0f172a" />
                        </TouchableOpacity>
                        <Text className="text-slate-900 font-black text-lg px-4 min-w-[44px] text-center">{choice.person_count}</Text>
                        <TouchableOpacity
                          onPress={() => updateChoice(se.id, 'person_count', choice.person_count + 1)}
                          className="px-4 py-2.5"
                        >
                          <Feather name="plus" size={16} color="#0f172a" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Meal Preference */}
                    <View className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-4">
                      <Text className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Meal Preference</Text>
                      <View className="flex-row justify-between gap-x-3">
                        <View className="flex-1">
                          <Text className="text-emerald-700 font-bold text-xs mb-2 text-center">🥬 Veg</Text>
                          <View className="flex-row items-center justify-center bg-white border border-slate-200 rounded-xl overflow-hidden">
                            <TouchableOpacity
                              onPress={() => updateChoice(se.id, 'veg_count', Math.max(0, choice.veg_count - 1))}
                              className="px-3 py-2"
                            >
                              <Feather name="minus" size={14} color="#64748b" />
                            </TouchableOpacity>
                            <Text className="text-slate-900 font-black text-base px-3">{choice.veg_count}</Text>
                            <TouchableOpacity
                              onPress={() => updateChoice(se.id, 'veg_count', Math.min(choice.person_count, choice.veg_count + 1))}
                              className="px-3 py-2"
                            >
                              <Feather name="plus" size={14} color="#64748b" />
                            </TouchableOpacity>
                          </View>
                        </View>
                        <View className="flex-1">
                          <Text className="text-red-600 font-bold text-xs mb-2 text-center">🍗 Non-Veg</Text>
                          <View className="flex-row items-center justify-center bg-white border border-slate-200 rounded-xl overflow-hidden">
                            <TouchableOpacity
                              onPress={() => updateChoice(se.id, 'nonveg_count', Math.max(0, choice.nonveg_count - 1))}
                              className="px-3 py-2"
                            >
                              <Feather name="minus" size={14} color="#64748b" />
                            </TouchableOpacity>
                            <Text className="text-slate-900 font-black text-base px-3">{choice.nonveg_count}</Text>
                            <TouchableOpacity
                              onPress={() => updateChoice(se.id, 'nonveg_count', Math.min(choice.person_count, choice.nonveg_count + 1))}
                              className="px-3 py-2"
                            >
                              <Feather name="plus" size={14} color="#64748b" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                      {(choice.veg_count + choice.nonveg_count !== choice.person_count) && (
                        <Text className="text-red-500 text-xs font-bold mt-2 text-center">
                          ⚠️ Veg ({choice.veg_count}) + Non-Veg ({choice.nonveg_count}) must equal {choice.person_count}
                        </Text>
                      )}
                    </View>

                    {/* Driver Section */}
                    <View className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center">
                          <Text className="text-sm mr-2">🚗</Text>
                          <Text className="text-slate-700 font-bold text-sm">Bringing a driver?</Text>
                        </View>
                        <Switch
                          value={choice.has_driver}
                          onValueChange={(val) => updateChoice(se.id, 'has_driver', val)}
                          trackColor={{ false: '#e2e8f0', true: '#86efac' }}
                          thumbColor={choice.has_driver ? '#059669' : '#94a3b8'}
                        />
                      </View>
                      {choice.has_driver && (
                        <View>
                          <View className="flex-row items-center justify-between mb-3">
                            <Text className="text-slate-600 font-medium text-sm">No. of drivers</Text>
                            <View className="flex-row items-center bg-white border border-slate-200 rounded-lg overflow-hidden">
                              <TouchableOpacity
                                onPress={() => updateChoice(se.id, 'driver_count', Math.max(1, choice.driver_count - 1))}
                                className="px-3 py-1.5"
                              >
                                <Feather name="minus" size={12} color="#64748b" />
                              </TouchableOpacity>
                              <Text className="text-slate-900 font-bold px-3">{choice.driver_count || 1}</Text>
                              <TouchableOpacity
                                onPress={() => updateChoice(se.id, 'driver_count', (choice.driver_count || 1) + 1)}
                                className="px-3 py-1.5"
                              >
                                <Feather name="plus" size={12} color="#64748b" />
                              </TouchableOpacity>
                            </View>
                          </View>
                          <View className="flex-row gap-x-2">
                            <TouchableOpacity
                              onPress={() => updateChoice(se.id, 'driver_meal_pref', 'veg')}
                              className={`flex-1 py-2.5 rounded-lg border items-center ${choice.driver_meal_pref === 'veg' ? 'bg-emerald-100 border-emerald-300' : 'bg-white border-slate-200'}`}
                            >
                              <Text className={`font-bold text-xs ${choice.driver_meal_pref === 'veg' ? 'text-emerald-700' : 'text-slate-500'}`}>🥬 Veg</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => updateChoice(se.id, 'driver_meal_pref', 'nonveg')}
                              className={`flex-1 py-2.5 rounded-lg border items-center ${choice.driver_meal_pref === 'nonveg' ? 'bg-red-100 border-red-300' : 'bg-white border-slate-200'}`}
                            >
                              <Text className={`font-bold text-xs ${choice.driver_meal_pref === 'nonveg' ? 'text-red-700' : 'text-slate-500'}`}>🍗 Non-Veg</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Footer Message */}
        <View className="mx-6 mb-4 items-center">
          <Text className="text-slate-400 text-xs font-medium text-center leading-5">
            Your choices help us plan meals precisely and reduce food waste 🌿{"\n"}
            Every plate planned, no meal wasted.
          </Text>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View className="absolute bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-xl border-t border-slate-100 pb-10 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <TouchableOpacity
          onPress={submitRSVP}
          disabled={submitting}
          className="w-full bg-emerald-600 py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-emerald-600/30"
        >
          {submitting ? <ActivityIndicator color="white" /> : (
            <>
              <Feather name="check-circle" size={20} color="white" />
              <Text className="text-white font-extrabold text-base ml-3 tracking-wide">Confirm RSVP</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
