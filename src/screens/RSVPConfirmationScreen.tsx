import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, Linking, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Feather } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const MEAL_ICONS: Record<string, string> = { breakfast: '🌅', lunch: '☀️', dinner: '🌙' };

export default function RSVPConfirmationScreen({ route, navigation }: any) {
  const { guestName = 'Guest', eventTitle = 'Event', choices = [], subEvents = [] } = route?.params || {};

  const formatTime = (time: string) => {
    if (!time) return '';
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${m} ${ampm}`;
  };

  const getSubEventForChoice = (choice: any) => {
    return subEvents.find((se: any) => se.id === choice.sub_event_id) || {};
  };

  const qrRefs = useRef<Record<string, any>>({});

  const downloadQR = (hash: string, seName: string) => {
    const qrRef = qrRefs.current[hash];
    if (!qrRef) return Alert.alert("Error", "QR not fully loaded. Try again.");

    qrRef.getDataURL(async (base64Data: string) => {
      try {
        if (Platform.OS === 'web') {
          const a = document.createElement('a');
          a.href = `data:image/png;base64,${base64Data}`;
          a.download = `GatePass-${seName}.png`;
          a.click();
        } else {
          const fileUri = FileSystem.documentDirectory + `${hash}.png`;
          await FileSystem.writeAsStringAsync(fileUri, base64Data, {
            encoding: FileSystem.EncodingType.Base64,
          });
          const canShare = await Sharing.isAvailableAsync();
          if (canShare) {
            await Sharing.shareAsync(fileUri, {
              dialogTitle: `Save or Share ${seName} Pass`,
              mimeType: 'image/png'
            });
          } else {
            Alert.alert("Sharing Unavailable", "Unable to share on this device.");
          }
        }
      } catch (err) {
        console.warn(err);
        Alert.alert("Error", "Failed to save the image.");
      }
    });
  };

  const shareAllPasses = async () => {
    const passLines = choices.map((c: any) => {
      const se = getSubEventForChoice(c);
      return `📋 ${se.name || 'Function'}\n   📅 ${se.date} | ⏰ ${formatTime(se.start_time)} - ${formatTime(se.end_time)}\n   👥 ${c.person_count} persons | 🥬 ${c.veg_count} Veg | 🍗 ${c.nonveg_count} Non-Veg\n   🎫 Pass: ${c.qr_hash}`;
    }).join('\n\n');

    const message = `🎉 *${eventTitle}* — RSVP Confirmed!\n\nGuest: ${guestName}\n\n${passLines}\n\n🌿 Serve Smart — Zero Waste Celebrations\nEvery plate planned, no meal wasted.`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

    try {
      if (Platform.OS === 'web') {
        window.open(whatsappUrl, '_blank');
      } else {
        const canOpen = await Linking.canOpenURL(whatsappUrl);
        if (canOpen) {
          await Linking.openURL(whatsappUrl);
        } else {
          Alert.alert('WhatsApp Unavailable', 'Could not open WhatsApp. Your passes are saved.');
        }
      }
    } catch (err) {
      console.log('Share error:', err);
    }
  };

  return (
    <View className="flex-1 bg-slate-900">
      {/* Header */}
      <View className="pt-14 pb-6 px-6 items-center">
        <View className="w-16 h-16 bg-emerald-500 rounded-full items-center justify-center mb-4 shadow-xl">
          <Feather name="check" size={32} color="white" />
        </View>
        <Text className="text-3xl font-black text-white text-center tracking-tight">RSVP Confirmed!</Text>
        <Text className="text-white/60 font-medium mt-2 text-center">{guestName} — {eventTitle}</Text>
      </View>

      {/* Pass Cards */}
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Serve Smart Badge */}
        <View className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex-row items-center mb-6">
          <Text className="text-xl mr-3">🌿</Text>
          <View className="flex-1">
            <Text className="text-emerald-400 font-black text-sm">Serve Smart — Zero Waste Celebrations</Text>
            <Text className="text-emerald-400/70 text-xs font-medium mt-0.5">Every plate planned, no meal wasted.</Text>
          </View>
        </View>

        <Text className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4">Your Gate Passes ({choices.length})</Text>

        {choices.map((choice: any, index: number) => {
          const se = getSubEventForChoice(choice);
          return (
            <View key={choice.id || index} className="bg-white rounded-[28px] mb-5 overflow-hidden shadow-2xl">
              {/* Ticket Top */}
              <View className="p-6 pb-4">
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center flex-1 mr-3">
                    <View className="w-11 h-11 bg-slate-100 rounded-xl items-center justify-center mr-3">
                      <Text className="text-lg">{MEAL_ICONS[se.meal_type] || '🍽️'}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-slate-900 font-black text-lg leading-tight">{se.name || 'Function'}</Text>
                      <Text className="text-slate-500 text-xs font-bold mt-1">{se.date}</Text>
                    </View>
                  </View>
                  <View className="bg-slate-900 px-3 py-1.5 rounded-lg">
                    <Text className="text-white text-[10px] font-black uppercase tracking-widest">Pass #{index + 1}</Text>
                  </View>
                </View>

                {/* Details Grid */}
                <View className="flex-row flex-wrap gap-y-3 mb-4">
                  <View className="w-1/2">
                    <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Time</Text>
                    <Text className="text-slate-800 font-bold text-sm mt-0.5">{formatTime(se.start_time)} - {formatTime(se.end_time)}</Text>
                  </View>
                  <View className="w-1/2">
                    <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Persons</Text>
                    <Text className="text-slate-800 font-bold text-sm mt-0.5">{choice.person_count} {choice.person_count === 1 ? 'Guest' : 'Guests'}</Text>
                  </View>
                  <View className="w-1/2">
                    <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Veg Meals</Text>
                    <Text className="text-emerald-600 font-bold text-sm mt-0.5">🥬 {choice.veg_count}</Text>
                  </View>
                  <View className="w-1/2">
                    <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Non-Veg Meals</Text>
                    <Text className="text-red-600 font-bold text-sm mt-0.5">🍗 {choice.nonveg_count}</Text>
                  </View>
                  {choice.driver_count > 0 && (
                    <View className="w-full">
                      <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Driver Meals</Text>
                      <Text className="text-slate-800 font-bold text-sm mt-0.5">🚗 {choice.driver_count} ({choice.driver_meal_pref === 'veg' ? 'Veg' : 'Non-Veg'})</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Dashed Divider with holes */}
              <View className="relative h-6 flex-row items-center">
                <View className="absolute left-[-12px] w-6 h-6 bg-slate-900 rounded-full" />
                <View className="flex-1 border-t border-dashed border-slate-200 mx-5" />
                <View className="absolute right-[-12px] w-6 h-6 bg-slate-900 rounded-full" />
              </View>

              {/* QR Code Section */}
              <View className="p-6 pt-4 items-center">
                <View className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                  <QRCode
                    value={choice.qr_hash || 'INVALID'}
                    size={160}
                    color="#0f172a"
                    backgroundColor="white"
                    getRef={(c) => { if (c && choice.qr_hash) qrRefs.current[choice.qr_hash] = c; }}
                  />
                </View>
                <Text className="text-slate-400 text-[10px] font-bold tracking-widest mt-3 uppercase">{choice.qr_hash}</Text>
                <Text className="text-slate-500 text-xs font-medium mt-2 text-center mb-3">
                  Present this QR at the venue gate for {se.name || 'this function'}
                </Text>
                <TouchableOpacity 
                   onPress={() => downloadQR(choice.qr_hash, se.name || 'Function')}
                   className="flex-row items-center bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl mt-1 active:bg-emerald-100"
                >
                  <Feather name="download" size={16} color="#059669" />
                  <Text className="text-emerald-700 font-bold ml-2 text-sm">Save Pass as Image</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Bottom Actions */}
      <View className="absolute bottom-0 left-0 right-0 p-6 pb-10 bg-slate-900/95 backdrop-blur-xl border-t border-white/5">
        <TouchableOpacity
          onPress={shareAllPasses}
          className="w-full bg-[#25D366] py-4 rounded-2xl flex-row justify-center items-center shadow-lg shadow-[#25D366]/30 active:scale-95 transition-all"
        >
          <Feather name="message-circle" size={20} color="white" />
          <Text className="text-white font-extrabold text-base ml-3">Share All Passes on WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
