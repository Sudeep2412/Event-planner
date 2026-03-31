import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image, Modal, Alert } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import * as Location from 'expo-location';
import QRCode from 'react-native-qrcode-svg';

export default function DiscoveryDashboard({ route, navigation }: any) {
  const { eventType = 'Event', budget = 0, eventId } = route.params || {};
  const [vendors, setVendors] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Searching local venues...");
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Modal State
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [reservationQR, setReservationQR] = useState<string | null>(null);
  const [reserving, setReserving] = useState(false);

  useEffect(() => {
    fetchScrapedData();
  }, [eventType, eventId]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (loading) {
      const steps = ["Source vendor directory...", "Expanding search radius...", "Finalizing elite picks..."];
      let step = 0;
      interval = setInterval(() => {
        step = (step + 1) % steps.length;
        setLoadingText(steps[step]);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const fetchScrapedData = async () => {
    setLoading(true);
    try {
      let lat = 19.0760;
      let lng = 72.8777; 
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        lat = loc.coords.latitude;
        lng = loc.coords.longitude;
      } else {
        Alert.alert("Location Services Disabled", "Using default central coordinates (Mumbai) to find vendors. Please enable GPS for hyper-local results.");
      }

      const { data, error } = await supabase.functions.invoke('vendor-scraper', {
        body: { latitude: lat, longitude: lng, eventType }
      });

      if (error) throw error;
      setVendors(data?.vendors || []);
      if (data?.categories) setCategories(data.categories);
    } catch (err: any) {
      Alert.alert("Discovery Error", "Could not scrape vendors near you.");
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async () => {
    if (!selectedVendor) return;
    setReserving(true);
    try {
      const qrHash = `RES-${selectedVendor.id.substring(0, 6)}-${Date.now()}`;
      
      if (eventId) {
        await supabase.from('vendors_cache').upsert({
          id: selectedVendor.id, name: selectedVendor.name, type: selectedVendor.type, price_range: selectedVendor.price_range, source_url: selectedVendor.source_url, geo_point: selectedVendor.geo_point
        });

        const { data: existing } = await supabase.from('reservations')
          .select('id, qr_hash').eq('event_id', eventId).eq('vendor_id', selectedVendor.id).maybeSingle();

        if (existing) {
          if (existing.qr_hash) {
             setReservationQR(existing.qr_hash);
             setReserving(false);
             return;
          } else {
            const { error } = await supabase.from('reservations').update({ status: 'pending', qr_hash: qrHash }).eq('id', existing.id);
            if (error) throw error;
          }
        } else {
          const { error } = await supabase.from('reservations').insert({
            event_id: eventId,
            vendor_id: selectedVendor.id,
            status: 'pending',
            qr_hash: qrHash
          });
          if (error) throw error;
        }
      }
      
      setReservationQR(qrHash);
    } catch (err: any) {
      Alert.alert("Reservation Failed", err.message);
    } finally {
      setReserving(false);
    }
  };

  const closeQRModal = () => {
    setReservationQR(null);
    setSelectedVendor(null);
  };

  const displayedVendors = activeCategory === 'All' ? vendors : vendors.filter(v => v.type === activeCategory);

  return (
    <View className="flex-1 bg-slate-50 pt-12">
      <View className="px-5 py-4 flex-row items-center justify-between bg-white shadow-sm z-10 border-b border-slate-100">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-slate-50 rounded-full border border-slate-100">
          <Feather name="arrow-left" size={20} color="#0f172a" />
        </TouchableOpacity>
        <View className="items-center">
          <Text className="text-lg font-black text-slate-900 capitalize tracking-tight">{eventType} Directory</Text>
          <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Budget: ₹{budget.toLocaleString('en-IN')}</Text>
        </View>
        <TouchableOpacity onPress={fetchScrapedData} className="p-2 bg-slate-50 rounded-full border border-slate-100">
          <Feather name="refresh-cw" size={20} color="#0f172a" />
        </TouchableOpacity>
      </View>

      <View className="bg-white border-b border-slate-100 z-10 py-3">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
          {categories.map(cat => (
            <TouchableOpacity 
              key={cat} 
              onPress={() => setActiveCategory(cat)}
              className={`mr-3 px-5 py-2.5 rounded-full border shadow-sm ${activeCategory === cat ? 'bg-[#1A1A1A] border-[#1A1A1A]' : 'bg-white border-slate-200'}`}
            >
              <Text className={`font-bold text-sm capitalize ${activeCategory === cat ? 'text-white' : 'text-slate-600'}`}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView className="flex-1 px-5 pt-5 pb-20" showsVerticalScrollIndicator={false}>
        {loading ? (
          <View className="items-center justify-center pt-32">
            <ActivityIndicator size="large" color="#1A1A1A" />
            <Text className="text-slate-500 font-bold mt-4 animate-pulse">{loadingText}</Text>
          </View>
        ) : displayedVendors.length === 0 ? (
          <View className="items-center justify-center pt-32">
             <Feather name="search" size={48} color="#cbd5e1" />
             <Text className="text-slate-500 font-bold mt-4">No matching {activeCategory} found.</Text>
          </View>
        ) : (
          displayedVendors.map((vendor) => (
            <View key={vendor.id} className="bg-white rounded-[24px] overflow-hidden mb-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-100 relative">
              <View className="h-56 relative bg-slate-100">
                {vendor.image_url && <Image source={{ uri: vendor.image_url }} className="w-full h-full" resizeMode="cover" />}
                <View className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 flex-row items-center rounded-lg shadow-sm">
                  <Ionicons name="star" size={14} color="#f59e0b" />
                  <Text className="text-sm font-black text-slate-900 ml-1.5">{vendor.rating || '4.8'}</Text>
                </View>
                <View className="absolute top-3 right-3 bg-[#1A1A1A]/90 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                  <Text className="text-white text-xs font-bold capitalize">{vendor.type}</Text>
                </View>
              </View>

              <View className="p-6">
                <Text className="text-xl font-black text-slate-900 mb-1 leading-tight">{vendor.name}</Text>
                <Text className="text-slate-500 font-bold text-sm mb-4">{vendor.price_range}</Text>
                
                { vendor.tags && vendor.tags.length > 0 && (
                  <View className="flex-row flex-wrap gap-2 mb-5">
                    {vendor.tags.map((tag: string, index: number) => (
                      <View key={index} className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-md">
                        <Text className="text-slate-600 text-[10px] font-bold tracking-widest uppercase">{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <TouchableOpacity 
                  onPress={() => setSelectedVendor(vendor)}
                  className="w-full bg-[#1A1A1A] py-3.5 rounded-xl flex-row items-center justify-center active:bg-black shadow-lg shadow-black/20"
                >
                  <Text className="text-white font-extrabold text-sm mr-2.5">Secure Booking</Text>
                  <Feather name="arrow-right" size={16} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Dynamic Reservation Modal */}
      <Modal visible={!!selectedVendor} animationType="slide" transparent={true} onRequestClose={closeQRModal}>
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white flex-1 mt-32 rounded-t-[40px] px-6 pt-8 pb-12 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border-t border-slate-200">
            {reservationQR ? (
              <View className="items-center pt-8">
                 <View className="w-16 h-1 bg-slate-200 rounded-full mb-10" />
                 <View className="w-16 h-16 bg-slate-900 rounded-full items-center justify-center mb-6 shadow-xl">
                   <Feather name="check" size={32} color="white" />
                 </View>
                 <Text className="text-3xl font-black text-slate-900 mb-2 text-center tracking-tight">Booking Secured</Text>
                 <Text className="text-slate-500 font-medium mb-10 text-center px-4 leading-relaxed">Present this encrypted code upon arrival at {selectedVendor?.name} to verify your clearance.</Text>
                 
                 <View className="p-6 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] rounded-[32px] border border-slate-100">
                    <QRCode value={reservationQR} size={200} color="#0f172a" />
                 </View>
                 
                 <Text className="text-xs font-bold tracking-widest text-slate-400 mt-6 uppercase">{reservationQR}</Text>

                 <View className="flex-1 justify-end w-full mb-4">
                   <TouchableOpacity onPress={closeQRModal} className="w-full bg-[#1A1A1A] py-4.5 rounded-2xl items-center shadow-lg active:scale-95 transition-all">
                     <Text className="text-white font-extrabold text-lg">Back to Dashboard</Text>
                   </TouchableOpacity>
                 </View>
              </View>
            ) : (
              <View className="items-center flex-1">
                <View className="flex-row justify-between w-full items-center mb-8">
                  <View className="w-10 h-10" />
                  <View className="w-16 h-1 bg-slate-200 rounded-full" />
                  <TouchableOpacity onPress={closeQRModal} className="w-10 h-10 bg-slate-50 items-center justify-center rounded-full border border-slate-100">
                    <Feather name="x" size={20} color="#0f172a" />
                  </TouchableOpacity>
                </View>
                
                <Text className="text-2xl font-black text-slate-900 mb-2 leading-tight text-center px-4">{selectedVendor?.name}</Text>
                <Text className="text-slate-500 font-bold text-sm mb-8 uppercase tracking-widest">{selectedVendor?.price_range}</Text>
                
                <View className="mb-8 w-full px-2 space-y-5">
                  <View className="flex-row items-center mb-4">
                    <View className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 items-center justify-center mr-4"><Feather name="map-pin" size={18} color="#0f172a" /></View>
                    <Text className="text-slate-700 font-medium flex-1 text-sm leading-relaxed">{selectedVendor?.address}</Text>
                  </View>
                  <View className="flex-row items-center mb-4">
                    <View className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 items-center justify-center mr-4"><Feather name="phone" size={18} color="#0f172a" /></View>
                    <Text className="text-slate-700 font-medium flex-1 text-sm">{selectedVendor?.phone}</Text>
                  </View>
                  <View className="flex-row items-center mb-6">
                    <View className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 items-center justify-center mr-4"><Feather name="clock" size={18} color="#0f172a" /></View>
                    <Text className="text-slate-700 font-medium flex-1 text-sm">{selectedVendor?.opening_hours}</Text>
                  </View>

                  <View className="flex-row flex-wrap gap-2">
                    {selectedVendor?.tags?.map((tag: string, i: number) => (
                      <View key={i} className="bg-white border border-slate-200 px-3 py-1.5 rounded-md shadow-sm">
                        <Text className="text-slate-600 text-[10px] font-bold tracking-widest uppercase">{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View className="flex-1 justify-end w-full mb-4">
                  <TouchableOpacity 
                    onPress={handleReserve} 
                    disabled={reserving} 
                    className="w-full bg-[#1A1A1A] py-4.5 rounded-2xl flex-row items-center justify-center shadow-xl shadow-black/20"
                  >
                    {reserving ? <ActivityIndicator color="white" /> : (
                      <>
                        <Text className="text-white font-black text-lg mr-3 tracking-wide">Confirm Security Clearance</Text>
                        <Feather name="shield" size={20} color="white" />
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
