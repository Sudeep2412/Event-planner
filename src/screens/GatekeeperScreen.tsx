import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { supabase } from '../lib/supabase';
import { Feather } from '@expo/vector-icons';

interface SubEvent {
  id: string;
  name: string;
  meal_type: string;
  start_time: string;
  end_time: string;
}

const MEAL_ICONS: Record<string, string> = { breakfast: '🌅', lunch: '☀️', dinner: '🌙' };

export default function GatekeeperScreen({ route, navigation }: any) {
  const { eventId } = route?.params || {};
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);

  // Sub-event selection for per-function validation
  const [subEvents, setSubEvents] = useState<SubEvent[]>([]);
  const [activeSubEventId, setActiveSubEventId] = useState<string | null>(null);
  const [showSubEventPicker, setShowSubEventPicker] = useState(false);

  // Scan result display
  const [scanResult, setScanResult] = useState<{ type: 'success' | 'warning' | 'error'; title: string; message: string } | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
    loadSubEvents();
  }, []);

  const loadSubEvents = async () => {
    if (!eventId) return;
    const { data } = await supabase
      .from('sub_events')
      .select('id, name, meal_type, start_time, end_time')
      .eq('event_id', eventId)
      .order('sort_order', { ascending: true });

    if (data && data.length > 0) {
      setSubEvents(data);
      setActiveSubEventId(data[0].id);
    }
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${m} ${ampm}`;
  };

  const getActiveSubEvent = () => subEvents.find(se => se.id === activeSubEventId);

  const handleBarCodeScanned = async ({ type, data }: any) => {
    setScanned(true);
    setScanResult(null);

    try {
      if (!eventId) {
        setScanResult({ type: 'error', title: 'Configuration Error', message: 'No active Event ID passed to scanner.' });
        return;
      }

      // Check if it's an RSVP-based QR (new system)
      if (data.startsWith('RSVP-')) {
        // Look up in rsvp_sub_event_choices
        const { data: choice, error } = await supabase
          .from('rsvp_sub_event_choices')
          .select('*, rsvp_responses(guest_name, mobile_number), sub_events(name, event_id)')
          .eq('qr_hash', data)
          .single();

        if (error || !choice) {
          setScanResult({ type: 'error', title: 'Invalid Pass', message: 'This gate pass QR code is not recognized in the system.' });
          return;
        }

        // Verify event ownership
        if (choice.sub_events?.event_id !== eventId) {
          setScanResult({ type: 'error', title: 'Wrong Event', message: 'This pass belongs to a different event.' });
          return;
        }

        // Verify sub-event if gatekeeper has selected one
        if (activeSubEventId && choice.sub_event_id !== activeSubEventId) {
          const activeFunc = getActiveSubEvent();
          setScanResult({
            type: 'error',
            title: 'Wrong Function',
            message: `This pass is for "${choice.sub_events?.name}" but you are scanning for "${activeFunc?.name || 'Unknown'}".`,
          });
          return;
        }

        // Check if already scanned
        if (choice.scanned_at) {
          const scanTime = new Date(choice.scanned_at);
          const timeStr = scanTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setScanResult({
            type: 'warning',
            title: 'Already Scanned',
            message: `${choice.rsvp_responses?.guest_name || 'Guest'} was already scanned at ${timeStr}.`,
          });
          return;
        }

        // Mark as scanned
        const { error: updateError } = await supabase
          .from('rsvp_sub_event_choices')
          .update({ scanned_at: new Date().toISOString() })
          .eq('id', choice.id);

        if (updateError) throw updateError;

        const guestName = choice.rsvp_responses?.guest_name || 'Guest';
        const funcName = choice.sub_events?.name || 'Function';
        setScanResult({
          type: 'success',
          title: `Welcome, ${guestName}!`,
          message: `✅ Valid for ${funcName}\n👥 ${choice.person_count} Guests (${choice.veg_count} Veg, ${choice.nonveg_count} Non-Veg)${choice.driver_count > 0 ? `\n🚗 ${choice.driver_count} Driver(s)` : ''}`,
        });

      } else if (data.startsWith('RES-')) {
        // Legacy: Reservation QR
        const { data: reservation, error } = await supabase
          .from('reservations')
          .select('*, vendors_cache(name)')
          .eq('qr_hash', data)
          .eq('event_id', eventId)
          .single();

        if (error || !reservation) {
          setScanResult({ type: 'error', title: 'Invalid Booking', message: 'This Reservation QR code is not recognized.' });
          return;
        }

        if (reservation.status === 'confirmed') {
          setScanResult({ type: 'warning', title: 'Already Confirmed', message: `Booking for ${reservation.vendors_cache?.name || 'this vendor'} is already processed.` });
          return;
        }

        await supabase.from('reservations').update({ status: 'confirmed' }).eq('id', reservation.id);
        setScanResult({ type: 'success', title: 'Clearance Verified', message: `Vendor booking confirmed for ${reservation.vendors_cache?.name || 'this vendor'}!` });

      } else {
        // Legacy: Attendee QR
        const { data: guest, error } = await supabase
          .from('attendees')
          .select('*')
          .eq('qr_hash', data)
          .eq('event_id', eventId)
          .single();

        if (error || !guest) {
          setScanResult({ type: 'error', title: 'Invalid Ticket', message: 'This Attendee QR code is not recognized.' });
          return;
        }

        if (guest.status === 'checked_in') {
          setScanResult({ type: 'warning', title: 'Already Checked In', message: `${guest.name} has already entered.` });
          return;
        }

        await supabase.from('attendees').update({ status: 'checked_in' }).eq('id', guest.id);
        setScanResult({ type: 'success', title: 'Access Granted', message: `Welcome to the event, ${guest.name}!` });
      }
    } catch (err: any) {
      setScanResult({ type: 'error', title: 'Error', message: err.message });
    }
  };

  if (hasPermission === null) {
    return <View className="flex-1 bg-black justify-center items-center"><Text className="text-white">Requesting camera permission...</Text></View>;
  }
  if (hasPermission === false) {
    return <View className="flex-1 bg-black justify-center items-center"><Text className="text-white">No access to camera</Text></View>;
  }

  const resultColors = {
    success: { bg: 'bg-emerald-500', border: 'border-emerald-400', icon: 'check-circle' as const },
    warning: { bg: 'bg-amber-500', border: 'border-amber-400', icon: 'alert-triangle' as const },
    error: { bg: 'bg-red-500', border: 'border-red-400', icon: 'x-circle' as const },
  };

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        enableTorch={torch}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      >
        <View className="flex-1 bg-black/50 justify-center items-center relative">

          {/* Top Controls */}
          <View className="absolute top-12 left-6 z-10">
            <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
              <Feather name="x" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <View className="absolute top-12 right-6 z-10">
            <TouchableOpacity onPress={() => setTorch(!torch)} className={`w-12 h-12 rounded-full items-center justify-center shadow-lg ${torch ? 'bg-amber-400' : 'bg-white/20'}`}>
              <Feather name={torch ? "zap" : "zap-off"} size={20} color={torch ? "#000" : "white"} />
            </TouchableOpacity>
          </View>

          {/* Function Selector */}
          {subEvents.length > 0 && (
            <View className="absolute top-28 left-0 right-0 px-6 z-10">
              <TouchableOpacity
                onPress={() => setShowSubEventPicker(!showSubEventPicker)}
                className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3 flex-row items-center justify-between"
              >
                <View className="flex-row items-center">
                  <Text className="text-lg mr-2">{MEAL_ICONS[getActiveSubEvent()?.meal_type || 'dinner']}</Text>
                  <View>
                    <Text className="text-white font-black text-sm">{getActiveSubEvent()?.name || 'Select Function'}</Text>
                    <Text className="text-white/60 text-xs font-bold">{formatTime(getActiveSubEvent()?.start_time || '')} - {formatTime(getActiveSubEvent()?.end_time || '')}</Text>
                  </View>
                </View>
                <Feather name={showSubEventPicker ? "chevron-up" : "chevron-down"} size={18} color="white" />
              </TouchableOpacity>

              {/* Dropdown */}
              {showSubEventPicker && (
                <View className="mt-2 bg-white/95 backdrop-blur-xl rounded-2xl border border-white/30 overflow-hidden shadow-2xl">
                  {subEvents.map(se => (
                    <TouchableOpacity
                      key={se.id}
                      onPress={() => { setActiveSubEventId(se.id); setShowSubEventPicker(false); }}
                      className={`flex-row items-center px-5 py-3.5 border-b border-slate-100 ${se.id === activeSubEventId ? 'bg-slate-100' : ''}`}
                    >
                      <Text className="text-lg mr-3">{MEAL_ICONS[se.meal_type]}</Text>
                      <View className="flex-1">
                        <Text className="text-slate-900 font-bold text-sm">{se.name}</Text>
                        <Text className="text-slate-500 text-xs">{formatTime(se.start_time)} - {formatTime(se.end_time)}</Text>
                      </View>
                      {se.id === activeSubEventId && <Feather name="check" size={16} color="#059669" />}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Title */}
          <View className="absolute top-24 items-center" style={{ top: subEvents.length > 0 ? undefined : 96, bottom: subEvents.length > 0 ? undefined : undefined }}>
            {subEvents.length === 0 && (
              <>
                <Text className="text-white font-black text-2xl tracking-widest uppercase mb-1">Gatekeeper</Text>
                <Text className="text-white/80 font-medium text-sm">Align QR code within the frame</Text>
              </>
            )}
          </View>

          {/* Scanner Frame */}
          {!scanResult && (
            <View className="w-64 h-64 border-2 border-white/20 items-center justify-center bg-transparent mt-10">
              <View className="w-full h-full border-4 border-transparent border-t-[#34d399] border-l-[#34d399] rounded-tl-3xl absolute top-0 left-0" style={{ width: 40, height: 40 }} />
              <View className="w-full h-full border-4 border-transparent border-t-[#34d399] border-r-[#34d399] rounded-tr-3xl absolute top-0 right-0" style={{ width: 40, height: 40 }} />
              <View className="w-full h-full border-4 border-transparent border-b-[#34d399] border-l-[#34d399] rounded-bl-3xl absolute bottom-0 left-0" style={{ width: 40, height: 40 }} />
              <View className="w-full h-full border-4 border-transparent border-b-[#34d399] border-r-[#34d399] rounded-br-3xl absolute bottom-0 right-0" style={{ width: 40, height: 40 }} />
            </View>
          )}

          {/* Scan Result Overlay */}
          {scanResult && (
            <View className="absolute bottom-0 left-0 right-0 px-6 pb-12">
              <View className={`${resultColors[scanResult.type].bg} rounded-3xl p-6 shadow-2xl border ${resultColors[scanResult.type].border}`}>
                <View className="flex-row items-start mb-3">
                  <Feather name={resultColors[scanResult.type].icon} size={28} color="white" />
                  <Text className="text-white font-black text-xl ml-3 flex-1">{scanResult.title}</Text>
                </View>
                <Text className="text-white/90 font-medium text-sm leading-6 mb-5">{scanResult.message}</Text>
                <TouchableOpacity
                  onPress={() => { setScanned(false); setScanResult(null); }}
                  className="bg-white/20 py-3 rounded-xl items-center border border-white/20"
                >
                  <Text className="text-white font-bold">Scan Next</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Awaiting Scan */}
          {!scanResult && (
            <View className="absolute bottom-16 bg-white/10 px-6 py-3 rounded-full border border-white/10 backdrop-blur-md">
              <Text className="text-white font-bold tracking-widest uppercase text-xs">Awaiting Scan...</Text>
            </View>
          )}

        </View>
      </CameraView>
    </View>
  );
}
