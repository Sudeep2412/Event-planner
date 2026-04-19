import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Platform, TextInput, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts';
import { supabase } from '../lib/supabase';

export default function GuestListScreen({ route, navigation }: any) {
  const { eventId = 'mock-event-id', hasSubEvents = false } = route?.params || {};
  const [contacts, setContacts] = useState<Contacts.Contact[]>([]);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [rsvpResponses, setRsvpResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'contacts' | 'invited'>('contacts');
  
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');

  useEffect(() => {
    fetchAttendees();
    fetchRsvpResponses();
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({ fields: [Contacts.Fields.PhoneNumbers] });
        if (data.length > 0) setContacts(data.filter(c => c.phoneNumbers && c.phoneNumbers.length > 0));
      }
      setLoading(false);
    })();
  }, []);

  const fetchAttendees = async () => {
    const { data } = await supabase.from('attendees').select('*').eq('event_id', eventId);
    if (data) setAttendees(data);
  };

  const fetchRsvpResponses = async () => {
    const { data } = await supabase
      .from('rsvp_responses')
      .select('*, rsvp_sub_event_choices(id, sub_event_id, person_count, veg_count, nonveg_count, scanned_at)')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });
    if (data) setRsvpResponses(data);
  };

  const inviteSingleGuest = async (contactName: string, contactPhone: string) => {
    try {
      // 1. Log guest to database
      const guestKey = `QR-${Math.random().toString(36).substring(2, 10)}-${Date.now()}`;
      const guestObj = { event_id: eventId, name: contactName, phone: contactPhone, qr_hash: guestKey, status: 'pending' };
      await supabase.from('attendees').insert([guestObj]);
      await fetchAttendees();

      // 2. Draft the highly personalized RSVP WhatsApp message
      const rawPhone = contactPhone.replace(/[^0-9]/g, '');
      const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
      
      // Dynamically auto-detect URL based on environment (Vercel/Netlify vs Localhost)
      const baseUrl = Platform.OS === 'web' 
        ? window.location.origin 
        : 'https://eventmasterpro.com'; // Production default for native app deep-links
        
      const rsvpUrl = `${baseUrl}/rsvp/${eventId}`;
        
      const message = `🎉 You're officially invited!\n\nHi ${contactName},\nPlease RSVP to our upcoming event and select the functions your family will be attending. 📋\n\nAccess your Guest Form here:\n${rsvpUrl}\n\n🌿 Serve Smart — Zero Waste Celebrations`;
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

      // 3. Directly Launch WhatsApp
      if (Platform.OS === 'web') {
        window.open(whatsappUrl, '_blank');
      } else {
        const canOpen = await Linking.canOpenURL(whatsappUrl);
        if (canOpen) await Linking.openURL(whatsappUrl);
        else Alert.alert('WhatsApp Unavailable', 'Could not seamlessly open WhatsApp.');
      }
    } catch (err: any) {
      if (Platform.OS === 'web') window.alert('Error: ' + err.message);
      else Alert.alert('Error', err.message);
    }
  };

  const totalRsvps = rsvpResponses.length;
  const totalPersons = rsvpResponses.reduce((sum, r) => sum + (r.rsvp_sub_event_choices?.reduce((s: number, c: any) => s + (c.person_count || 0), 0) || 0), 0);

  return (
    <View className="flex-1 bg-[#FAFAFA] pt-12">
      {/* Structural Header */}
      <View className="px-6 py-4 flex-row items-center justify-between border-b border-slate-100 bg-white">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-3 bg-slate-50 rounded-full active:bg-slate-100 transition-all">
          <Feather name="arrow-left" size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-slate-900 tracking-tight">Direct Invites</Text>
        <TouchableOpacity onPress={() => navigation.navigate('FoodAnalytics', { eventId })} className="p-3 bg-emerald-50 rounded-full border border-emerald-100 active:bg-emerald-100 transition-all">
          <Feather name="bar-chart-2" size={18} color="#059669" />
        </TouchableOpacity>
      </View>

      {/* Segmented Controller */}
      <View className="flex-row mx-6 mt-6 mb-2 bg-slate-100 p-1.5 rounded-2xl">
        <TouchableOpacity
          onPress={() => setActiveTab('contacts')}
          className={`flex-1 py-3 rounded-xl items-center shadow-sm ${activeTab === 'contacts' ? 'bg-white' : 'bg-transparent'}`}
        >
          <Text className={`font-black text-sm ${activeTab === 'contacts' ? 'text-slate-900' : 'text-slate-500'}`}>Contact Book</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('invited')}
          className={`flex-1 py-3 rounded-xl items-center shadow-sm ${activeTab === 'invited' ? 'bg-white' : 'bg-transparent'}`}
        >
          <Text className={`font-black text-sm ${activeTab === 'invited' ? 'text-slate-900' : 'text-slate-500'}`}>Invited Guests & Status</Text>
        </TouchableOpacity>
      </View>

      {/* Main Form Content */}
      {activeTab === 'contacts' ? (
        <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
          
          {/* Manual Entry Component */}
          <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3">Add Custom Contact</Text>
          <View className="bg-white rounded-2xl p-4 shadow-sm border border-slate-50 mb-6">
            <View className="flex-row">
              <TextInput 
                value={manualName} onChangeText={setManualName} 
                placeholder="Name" className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm mr-2 font-medium" 
                placeholderTextColor="#94a3b8"
              />
              <TextInput 
                value={manualPhone} onChangeText={setManualPhone} 
                placeholder="Phone" keyboardType="phone-pad" className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-medium" 
                placeholderTextColor="#94a3b8"
              />
            </View>
            <TouchableOpacity 
              onPress={() => {
                if (manualName && manualPhone) {
                  inviteSingleGuest(manualName, manualPhone);
                  setManualName(''); setManualPhone('');
                } else {
                  if (Platform.OS === 'web') window.alert("Please provide name and phone.");
                  else Alert.alert("Missing Details", "Please provide name and phone.");
                }
              }}
              className="mt-3 bg-slate-900 justify-center items-center py-3.5 rounded-xl active:scale-[98%] transition-all flex-row"
            >
              <Feather name="message-circle" size={16} color="white" />
              <Text className="text-white font-bold ml-2 text-sm tracking-wide">Direct WhatsApp Invite</Text>
            </TouchableOpacity>
          </View>

          <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">Device Phonebook</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#059669" className="mt-10" />
          ) : contacts.length === 0 ? (
            <View className="items-center justify-center mt-16 px-4">
              <View className="bg-slate-100 p-6 rounded-full mb-4">
                <Feather name="users" size={32} color="#94a3b8" />
              </View>
              <Text className="text-slate-600 font-bold text-center">No Mobile Contacts Found</Text>
            </View>
          ) : (
            contacts.map(c => {
              const name = c.name || 'Unknown';
              const phone = c.phoneNumbers?.[0]?.number || '';
              const alreadyInvited = attendees.find(a => a.phone === phone);

              return (
                <View key={(c as any).id} className="bg-white px-5 py-4 rounded-2xl mb-3 flex-row items-center justify-between shadow-sm border border-slate-50">
                  <View className="flex-1 mr-3">
                    <Text className="text-slate-900 font-black text-[15px]">{name}</Text>
                    <Text className="text-slate-500 font-medium text-xs mt-1">{phone}</Text>
                  </View>
                  
                  {alreadyInvited ? (
                    <View className="bg-green-50 px-3 py-1.5 rounded-xl border border-green-100 flex-row items-center">
                      <Feather name="check" size={12} color="#16a34a" />
                      <Text className="text-green-700 text-[10px] font-black uppercase tracking-widest ml-1">Invited</Text>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      onPress={() => inviteSingleGuest(name, phone)}
                      className="bg-[#25D366] px-4 py-2.5 rounded-xl shadow-md shadow-[#25D366]/20 flex-row items-center active:scale-95 transition-transform"
                    >
                      <Feather name="message-circle" size={16} color="white" />
                      <Text className="text-white font-black text-xs ml-2 tracking-wide uppercase">Send form</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>
      ) : (
        <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
          <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">
            ROSTER MASTER TRACKING ({attendees.length} INVITED / {totalRsvps} FORMS ISSUED)
          </Text>
          {attendees.length === 0 ? (
            <View className="items-center justify-center mt-16 px-4">
              <View className="bg-slate-100 p-6 rounded-full mb-4">
                <Feather name="clipboard" size={32} color="#94a3b8" />
              </View>
              <Text className="text-slate-600 font-bold text-center">No guests invited yet.</Text>
            </View>
          ) : (
            attendees.map(guest => {
              const matchedRsvp = rsvpResponses.find(r => r.mobile_number === guest.phone || r.whatsapp_number === guest.phone);
              const isCheckedIn = guest.status === 'checked_in';

              return (
                <View key={guest.id} className="bg-white p-5 rounded-3xl mb-4 border border-slate-50 shadow-sm">
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="font-black text-slate-900 text-lg">{guest.name}</Text>
                      <Text className="text-slate-500 text-xs mt-1 font-medium">{guest.phone}</Text>
                    </View>
                    <TouchableOpacity 
                       onPress={() => sendDirectWhatsApp(guest.phone, guest.name)}
                       className="w-10 h-10 rounded-full bg-[#25D366]/10 items-center justify-center border border-[#25D366]/20 active:scale-95 transition-transform"
                    >
                      <Feather name="message-circle" size={18} color="#16a34a" />
                    </TouchableOpacity>
                  </View>

                  {/* Dual Status Metrics */}
                  <View className="flex-row items-center mt-6 gap-x-2">
                    {/* Form Status */}
                    <View className="flex-1">
                      <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Guest Form</Text>
                      {matchedRsvp ? (
                        <View className="bg-indigo-50 border border-indigo-100 py-1.5 px-3 rounded-xl flex-row items-center self-start">
                          <Feather name="check-circle" size={12} color="#4f46e5" />
                          <Text className="text-indigo-700 text-xs font-bold ml-1.5 uppercase tracking-wide">Submitted</Text>
                        </View>
                      ) : (
                        <View className="bg-amber-50 border border-amber-100 py-1.5 px-3 rounded-xl flex-row items-center self-start">
                          <Feather name="clock" size={12} color="#d97706" />
                          <Text className="text-amber-700 text-xs font-bold ml-1.5 uppercase tracking-wide">Pending</Text>
                        </View>
                      )}
                    </View>

                    {/* Arrival Status */}
                    <View className="flex-1">
                      <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Venue Arrival</Text>
                      {isCheckedIn ? (
                        <View className="bg-green-50 border border-green-200 py-1.5 px-3 rounded-xl flex-row items-center self-start shadow-[0_2px_10px_rgba(34,197,94,0.15)]">
                          <Feather name="shield" size={12} color="#16a34a" />
                          <Text className="text-green-700 text-xs font-bold ml-1.5 uppercase tracking-wide">Inside Venue</Text>
                        </View>
                      ) : (
                        <View className="bg-slate-50 border border-slate-200 py-1.5 px-3 rounded-xl flex-row items-center self-start">
                          <Feather name="map-pin" size={12} color="#64748b" />
                          <Text className="text-slate-500 text-xs font-bold ml-1.5 uppercase tracking-wide">Not Arrived</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
}
