import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { supabase } from '../lib/supabase';
import { Feather } from '@expo/vector-icons';

export default function GatekeeperScreen({ route, navigation }: any) {
  const { eventId } = route?.params || {};
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }: any) => {
    setScanned(true);
    
    try {
      if (!eventId) {
        Alert.alert('Configuration Error', 'No active Event ID passed to scanner.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
        return;
      }

      if (data.startsWith('RES-')) {
        const { data: reservation, error } = await supabase
          .from('reservations')
          .select('*, vendors_cache(name)')
          .eq('qr_hash', data)
          .eq('event_id', eventId)
          .single();
          
        if (error || !reservation) {
          Alert.alert('Invalid Booking', 'This Reservation QR code is not recognized.', [{ text: 'Scan Again', onPress: () => setScanned(false) }]);
          return;
        }
        
        if (reservation.status === 'confirmed') {
          Alert.alert('Already Confirmed', `The booking for ${reservation.vendors_cache?.name || 'this vendor'} is already fully processed.`, [{ text: 'Scan Again', onPress: () => setScanned(false) }]);
          return;
        }
        
        const { error: updateError } = await supabase.from('reservations').update({ status: 'confirmed' }).eq('id', reservation.id);
        if (updateError) throw updateError;
        
        Alert.alert('Clearance Verified', `Vendor booking confirmed for ${reservation.vendors_cache?.name || 'this vendor'}!`, [{ text: 'Scan Next', onPress: () => setScanned(false) }]);

      } else {
        const { data: guest, error } = await supabase
          .from('attendees')
          .select('*')
          .eq('qr_hash', data)
          .eq('event_id', eventId)
          .single();
          
        if (error || !guest) {
          Alert.alert('Invalid Ticket', 'This Attendee QR code is not recognized.', [
            { text: 'Scan Again', onPress: () => setScanned(false) }
          ]);
          return;
        }
        
        if (guest.status === 'checked_in') {
          Alert.alert('Already Checked In', `${guest.name} has already entered.`, [
            { text: 'Scan Again', onPress: () => setScanned(false) }
          ]);
          return;
        }
        
        const { error: updateError } = await supabase.from('attendees').update({ status: 'checked_in' }).eq('id', guest.id);
        if (updateError) throw updateError;
        
        Alert.alert('Access Granted', `Welcome to the event, ${guest.name}!`, [
          { text: 'Scan Next', onPress: () => setScanned(false) }
        ]);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message, [{ text: 'OK', onPress: () => setScanned(false) }]);
    }
  };

  if (hasPermission === null) {
    return <View className="flex-1 bg-black justify-center items-center"><Text className="text-white">Requesting camera permission...</Text></View>;
  }
  if (hasPermission === false) {
    return <View className="flex-1 bg-black justify-center items-center"><Text className="text-white">No access to permissions</Text></View>;
  }

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
          
          <View className="absolute top-24 items-center">
            <Text className="text-white font-black text-2xl tracking-widest uppercase mb-1">Gatekeeper</Text>
            <Text className="text-white/80 font-medium text-sm">Align QR code within the frame</Text>
          </View>

          <View className="w-64 h-64 border-2 border-white/20 items-center justify-center bg-transparent mt-10">
             <View className="w-full h-full border-4 border-transparent border-t-[#34d399] border-l-[#34d399] rounded-tl-3xl absolute top-0 left-0" style={{ width: 40, height: 40}} />
             <View className="w-full h-full border-4 border-transparent border-t-[#34d399] border-r-[#34d399] rounded-tr-3xl absolute top-0 right-0" style={{ width: 40, height: 40}} />
             <View className="w-full h-full border-4 border-transparent border-b-[#34d399] border-l-[#34d399] rounded-bl-3xl absolute bottom-0 left-0" style={{ width: 40, height: 40}} />
             <View className="w-full h-full border-4 border-transparent border-b-[#34d399] border-r-[#34d399] rounded-br-3xl absolute bottom-0 right-0" style={{ width: 40, height: 40}} />
          </View>
          
          <View className="absolute bottom-16 bg-white/10 px-6 py-3 rounded-full border border-white/10 backdrop-blur-md">
            <Text className="text-white font-bold tracking-widest uppercase text-xs">Awaiting Scan...</Text>
          </View>
          
        </View>
      </CameraView>
    </View>
  );
}
