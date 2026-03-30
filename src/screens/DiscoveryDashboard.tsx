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
      const steps = ["Searching local venues...", "Expanding search radius...", "Finalizing top picks..."];
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
        // Cache the vendor explicitly incase Edge function generated it ephemerally without upside
        await supabase.from('vendors_cache').upsert({
          id: selectedVendor.id, name: selectedVendor.name, type: selectedVendor.type, price_range: selectedVendor.price_range, source_url: selectedVendor.source_url, geo_point: selectedVendor.geo_point
        });

        const { data: existing } = await supabase.from('reservations')
          .select('id').eq('event_id', eventId).eq('vendor_id', selectedVendor.id).maybeSingle();

        if (existing) {
          const { error } = await supabase.from('reservations').update({ status: 'pending' }).eq('id', existing.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('reservations').insert({
            event_id: eventId,
            vendor_id: selectedVendor.id,
            status: 'pending'
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
      {/* Header */}
      <View className="px-5 py-4 flex-row items-center justify-between bg-white shadow-sm z-10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-slate-50 rounded-full">
          <Feather name="arrow-left" size={20} color="#0f172a" />
        </TouchableOpacity>
        <View className="items-center">
          <Text className="text-lg font-extrabold text-slate-900 capitalize">{eventType} Vendors</Text>
          <Text className="text-xs font-bold text-slate-400">Budget: ₹{budget.toLocaleString('en-IN')}</Text>
        </View>
        <TouchableOpacity onPress={fetchScrapedData} className="p-2 bg-indigo-50 rounded-full">
          <Feather name="refresh-cw" size={20} color="#4f46e5" />
        </TouchableOpacity>
      </View>

      {/* Categories Toolbar */}
      <View className="bg-white border-b border-slate-100 z-10 py-3">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
          {categories.map(cat => (
            <TouchableOpacity 
              key={cat} 
              onPress={() => setActiveCategory(cat)}
              className={`mr-3 px-5 py-2.5 rounded-full border ${activeCategory === cat ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-200'}`}
            >
              <Text className={`font-bold text-sm capitalize ${activeCategory === cat ? 'text-white' : 'text-slate-600'}`}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView className="flex-1 px-5 pt-5 pb-20" showsVerticalScrollIndicator={false}>
        {loading ? (
          <View className="items-center justify-center pt-32">
            <ActivityIndicator size="large" color="#4f46e5" />
            <Text className="text-slate-500 font-bold mt-4 animate-pulse">{loadingText}</Text>
          </View>
        ) : displayedVendors.length === 0 ? (
          <View className="items-center justify-center pt-32">
             <Feather name="search" size={48} color="#cbd5e1" />
             <Text className="text-slate-500 font-bold mt-4">No matching {activeCategory} found.</Text>
          </View>
        ) : (
          displayedVendors.map((vendor) => (
            <View key={vendor.id} className="bg-white rounded-3xl overflow-hidden mb-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100">
              <View className="h-56 relative bg-slate-200">
                {vendor.image_url && <Image source={{ uri: vendor.image_url }} className="w-full h-full" resizeMode="cover" />}
                <View className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-1 flex-row items-center rounded-lg shadow-sm">
                  <Ionicons name="star" size={14} color="#f59e0b" />
                  <Text className="text-sm font-black text-slate-900 ml-1.5">{vendor.rating || '4.8'}</Text>
                </View>
                <View className="absolute top-3 right-3 bg-slate-900/80 px-3 py-1 rounded-full">
                  <Text className="text-white text-xs font-bold capitalize">{vendor.type}</Text>
                </View>
              </View>

              <View className="p-5">
                <Text className="text-xl font-black text-slate-900 mb-1">{vendor.name}</Text>
                <Text className="text-primary font-black text-base mb-3">{vendor.price_range}</Text>
                
                { vendor.tags && vendor.tags.length > 0 && (
                  <View className="flex-row flex-wrap gap-2 mb-4">
                    {vendor.tags.map((tag: string, index: number) => (
                      <View key={index} className="bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
                        <Text className="text-emerald-700 text-xs font-bold tracking-tight">{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <TouchableOpacity 
                  onPress={() => setSelectedVendor(vendor)}
                  className="w-full bg-slate-900 py-3.5 rounded-xl flex-row items-center justify-center active:bg-slate-800"
                >
                  <Text className="text-white font-bold text-sm mr-2">Reserve {vendor.type.charAt(0).toUpperCase() + vendor.type.slice(1)}</Text>
                  <Feather name="shield" size={16} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Dynamic Reservation Modal */}
      <Modal visible={!!selectedVendor} animationType="slide" transparent={true} onRequestClose={closeQRModal}>
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-[40px] px-6 pt-8 pb-12 shadow-2xl">
            {reservationQR ? (
              <View className="items-center">
                 <View className="w-16 h-1 bg-slate-200 rounded-full mb-8" />
                 <Text className="text-2xl font-black text-emerald-600 mb-2 text-center">Reservation Confirmed!</Text>
                 <Text className="text-slate-500 font-medium mb-8 text-center px-4">Present this QR code to {selectedVendor?.name} for your booking verification.</Text>
                 
                 <View className="p-6 bg-white shadow-xl rounded-[32px] border border-slate-100">
                    <QRCode value={reservationQR} size={200} color="#0f172a" />
                 </View>
                 
                 <Text className="text-xs font-bold tracking-widest text-slate-400 mt-6 uppercase">{reservationQR}</Text>

                 <TouchableOpacity onPress={closeQRModal} className="mt-8 w-full bg-slate-900 py-4 rounded-2xl items-center">
                   <Text className="text-white font-bold text-lg">Continue Discovering</Text>
                 </TouchableOpacity>
              </View>
            ) : (
              <View className="items-center">
                <View className="w-16 h-1 bg-slate-200 rounded-full mb-6" />
                <Text className="text-2xl font-black text-slate-900 mb-1 leading-tight text-center">{selectedVendor?.name}</Text>
                <Text className="text-primary font-bold text-sm mb-6">{selectedVendor?.price_range}</Text>
                
                {/* Deep Metadata Layout */}
                <View className="mb-8 w-full px-2">
                  <View className="flex-row items-center mb-4">
                    <View className="w-10 h-10 rounded-full bg-indigo-50 items-center justify-center mr-4"><Feather name="map-pin" size={16} color="#4f46e5" /></View>
                    <Text className="text-slate-700 font-medium flex-1 text-sm">{selectedVendor?.address}</Text>
                  </View>
                  <View className="flex-row items-center mb-4">
                    <View className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center mr-4"><Feather name="phone" size={16} color="#059669" /></View>
                    <Text className="text-slate-700 font-medium flex-1 text-sm">{selectedVendor?.phone}</Text>
                  </View>
                  <View className="flex-row items-center mb-5">
                    <View className="w-10 h-10 rounded-full bg-amber-50 items-center justify-center mr-4"><Feather name="clock" size={16} color="#d97706" /></View>
                    <Text className="text-slate-700 font-medium flex-1 text-sm">{selectedVendor?.opening_hours}</Text>
                  </View>

                  <View className="flex-row flex-wrap gap-2">
                    {selectedVendor?.tags?.map((tag: string, i: number) => (
                      <View key={i} className="bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full">
                        <Text className="text-slate-600 text-xs font-bold tracking-tight">{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Final Reservation Confirmation Header */}
                <Text className="text-slate-500 text-center font-bold text-xs uppercase tracking-widest mb-4">Secure this booking for {eventType}</Text>
                
                <View className="flex-row gap-4 w-full">
                  <TouchableOpacity onPress={closeQRModal} className="flex-1 bg-slate-100 py-4 rounded-xl items-center">
                    <Text className="text-slate-700 font-bold">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleReserve} disabled={reserving} className="flex-[2] bg-primary py-4 rounded-xl flex-row items-center justify-center shadow-lg shadow-primary/30">
                    {reserving ? <ActivityIndicator color="white" /> : (
                      <>
                        <Text className="text-white font-extrabold text-lg mr-2">Confirm Booking</Text>
                        <Feather name="check-circle" size={20} color="white" />
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
