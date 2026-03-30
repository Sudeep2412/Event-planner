import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Linking, Share, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts';
import { supabase } from '../lib/supabase';

export default function GuestListScreen({ route, navigation }: any) {
  const { eventId = 'mock-event-id' } = route?.params || {};
  const [contacts, setContacts] = useState<Contacts.Contact[]>([]);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');

  useEffect(() => {
    fetchAttendees();
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers],
        });
        if (data.length > 0) {
          setContacts(data.filter(c => c.phoneNumbers && c.phoneNumbers.length > 0));
        }
      }
      setLoading(false);
    })();
  }, []);

  const fetchAttendees = async () => {
    const { data } = await supabase.from('attendees').select('*').eq('event_id', eventId);
    if (data) setAttendees(data);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const inviteSelected = async () => {
    if (selectedIds.length === 0) return;
    setSending(true);
    
    try {
      const guestsToInvite = selectedIds.map(id => {
        const c = contacts.find(contact => (contact as any).id === id);
        return {
          event_id: eventId,
          name: c?.name || 'Guest',
          phone: c?.phoneNumbers?.[0].number || '',
          qr_hash: `QR-${Math.random().toString(36).substring(2, 10)}-${Date.now()}`,
          status: 'pending'
        };
      });

      const { error } = await supabase.from('attendees').insert(guestsToInvite);
      if (error) throw error;
      
      await fetchAttendees();
      // Extract Venue Specifics Native Payload
      let venueText = "our event";
      let locationText = "the venue";
      
      const { data: res } = await supabase.from('reservations').select('vendor_id').eq('event_id', eventId);
      if (res && res.length > 0) {
        const vendorIds = res.map(r => r.vendor_id);
        const { data: venues } = await supabase.from('vendors_cache')
          .select('name, address')
          .in('id', vendorIds)
          .eq('type', 'venues')
          .limit(1);
          
        if (venues && venues.length > 0) {
          venueText = venues[0].name;
          locationText = venues[0].address || venues[0].name;
        }
      }

      // Visual QR Transport Array Lock
      if (guestsToInvite.length === 1) {
        navigation.replace('Ticket', { 
          qrHash: guestsToInvite[0].qr_hash, 
          eventName: venueText !== 'our event' ? venueText : 'VIP Invitation', 
          guestName: guestsToInvite[0].name 
        });
      } else {
        const message = `You're officially invited to ${venueText}!\n📍 Location: ${locationText}\n\nPresent your VIP EventMaster Ticket at the door: https://eventmaster.pro/e/${eventId}`;
        await Share.share({ message, title: 'Event Invitation' });
        setSelectedIds([]);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <View className="flex-1 bg-white pt-12">
      <View className="px-5 py-3 flex-row items-center justify-between border-b border-slate-100">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-slate-50 rounded-full">
          <Feather name="arrow-left" size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text className="text-lg font-extrabold text-slate-900">Guest Management</Text>
        <View className="w-10" />
      </View>

      <View className="px-5 py-4 border-b border-slate-100 bg-slate-50">
        <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Add Custom Contact</Text>
        <View className="flex-row">
          <TextInput 
            value={manualName} onChangeText={setManualName} 
            placeholder="Name" className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm mr-2" 
          />
          <TextInput 
            value={manualPhone} onChangeText={setManualPhone} 
            placeholder="Phone Number" keyboardType="phone-pad" className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm mr-2" 
          />
          <TouchableOpacity 
            onPress={() => {
              if (manualName && manualPhone) {
                const newContact = { id: `manual-${Date.now()}`, name: manualName, phoneNumbers: [{ number: manualPhone }] };
                setContacts([newContact as any, ...contacts]);
                setSelectedIds([...selectedIds, newContact.id]);
                setManualName(''); setManualPhone('');
              } else {
                Alert.alert("Missing Details", "Please enter both Name and Phone natively.");
              }
            }}
            className="bg-indigo-600 rounded-lg justify-center px-4 shadow shadow-indigo-200"
          >
            <Feather name="plus" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-5 pt-5 mb-24">
        {attendees.length > 0 && (
          <View className="mb-8">
            <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Live Arrival Status</Text>
            {attendees.map(guest => (
              <View key={guest.id} className="flex-row items-center justify-between py-3 border-b border-slate-50">
                <View>
                  <Text className="font-bold text-slate-800 text-base">{guest.name}</Text>
                  <Text className="text-slate-500 text-xs mt-1">{guest.phone}</Text>
                </View>
                <View className={`px-3 py-1 rounded-full ${guest.status === 'checked_in' ? 'bg-green-100' : 'bg-amber-100'}`}>
                  <Text className={`text-xs font-bold uppercase tracking-wider ${guest.status === 'checked_in' ? 'text-green-700' : 'text-amber-700'}`}>
                    {guest.status === 'checked_in' ? 'Arrived' : 'Pending'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 mt-2">Device Contacts</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#4f46e5" className="mt-10" />
        ) : contacts.length === 0 ? (
          <View className="items-center justify-center mt-10">
            <Feather name="users" size={48} color="#cbd5e1" />
            <Text className="text-slate-500 font-bold mt-4 text-center">No contacts found.{"\n"}Use the manual entry above.</Text>
          </View>
        ) : (
          contacts.map(contact => {
            const isAlreadyInvited = attendees.some(a => a.phone === contact.phoneNumbers?.[0]?.number);
            if (isAlreadyInvited) return null;
            
            return (
            <TouchableOpacity 
              key={(contact as any).id} 
              onPress={() => toggleSelect((contact as any).id)}
              className="flex-row items-center justify-between py-3 border-b border-slate-50"
            >
              <View>
                <Text className="font-bold text-slate-800 text-base">{contact.name}</Text>
                <Text className="text-slate-500 text-xs mt-1">{contact.phoneNumbers?.[0].number}</Text>
              </View>
              <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${selectedIds.includes((contact as any).id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                {selectedIds.includes((contact as any).id) && <Feather name="check" size={14} color="white" />}
              </View>
            </TouchableOpacity>
          )}))
        }
      </ScrollView>

      <View className="absolute bottom-0 w-full p-6 bg-white border-t border-slate-100 pb-10 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <TouchableOpacity
          onPress={inviteSelected}
          disabled={sending || selectedIds.length === 0}
          className={`w-full py-4 rounded-2xl items-center flex-row justify-center ${selectedIds.length === 0 ? 'bg-slate-300' : 'bg-slate-900'}`}
        >
          {sending ? <ActivityIndicator color="#fff" /> : (
             <Text className="text-white font-bold text-lg">Send Invites ({selectedIds.length})</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
