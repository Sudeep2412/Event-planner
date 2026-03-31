import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Platform, Alert, Linking } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Feather } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function TicketScreen({ route, navigation }: any) {
  const { qrHash = 'MOCK-HASH-123', eventName = 'VIP Event', guestName = 'Valued Guest' } = route?.params || {};
  const qrRef = useRef<any>(null);

  const shareTicket = async () => {
    const ticketUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qrHash}&margin=20`;
    const textMessage = `🎫 *EventMaster VIP PASS* 🎫\n\nYou're invited to *${eventName}*!\nGuest Name: ${guestName}\nYour invitation QR link: ${ticketUrl}\n\nPlease present this QR link natively at the venue gate for instant scanning access.`;
    const universalUrl = `https://wa.me/?text=${encodeURIComponent(textMessage)}`;

    try {
      const canOpen = await Linking.canOpenURL(universalUrl);
      if (canOpen) {
        await Linking.openURL(universalUrl);
      } else {
        // Fallback for Web/Unsupported
        if (Platform.OS === 'web') {
           window.open(universalUrl, '_blank');
        } else {
           Alert.alert('No WhatsApp', 'Could not seamlessly route to WhatsApp Universal Link.');
        }
      }
    } catch (err) {
      console.log('Error opening Universal Web Link:', err);
    }
  };

  return (
    <View className="flex-1 bg-slate-900 justify-center items-center px-6">
      <TouchableOpacity 
        onPress={() => navigation.goBack()} 
        className="absolute top-12 left-6 w-10 h-10 bg-white/10 rounded-full items-center justify-center p-2"
      >
        <Feather name="x" size={24} color="white" />
      </TouchableOpacity>

      <View className="w-full bg-white rounded-[40px] p-8 items-center shadow-2xl">
        <View className="mb-8 items-center">
          <Text className="text-3xl font-black text-slate-900 text-center">{eventName}</Text>
          <Text className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-xs">VIP ADMIT ONE</Text>
        </View>

        <View className="p-4 bg-white shadow-sm border border-slate-100 rounded-3xl">
          <QRCode
            value={qrHash}
            size={220}
            color="#0f172a"
            backgroundColor="white"
            getRef={(c) => (qrRef.current = c)}
          />
        </View>

        <View className="mt-8 items-center w-full">
          <Text className="text-xl font-bold text-slate-800">{guestName}</Text>
          <Text className="text-slate-400 font-medium text-sm mt-1">{qrHash}</Text>
        </View>
        
        <View className="w-full border-t border-dashed border-slate-200 mt-8 pt-6">
          <Text className="text-center text-xs text-slate-400 font-medium pb-2">Please present this QR code at the entrance for scanning.</Text>
        </View>

        <TouchableOpacity 
          onPress={shareTicket}
          className="w-full bg-[#25D366] py-3.5 rounded-2xl flex-row justify-center items-center mt-2 shadow-lg shadow-[#25D366]/30 active:scale-95 transition-all"
        >
          <Feather name="message-circle" size={20} color="white" />
          <Text className="text-white font-bold text-lg ml-2">Send on WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
