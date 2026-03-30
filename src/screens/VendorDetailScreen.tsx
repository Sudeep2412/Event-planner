import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

const { width } = Dimensions.get('window');

export default function VendorDetailScreen({ vendorId, eventId, isSaved, toggleSave, onBack }: any) {
  const [displayVendor, setDisplayVendor] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const loadVendor = async () => {
      const { data } = await supabase.from('vendors_cache').select('*').eq('id', vendorId).single();
      if (data) {
        setDisplayVendor({
          id: data.id,
          name: data.name,
          rating: data.rating || 4.7,
          distance: '0.2 km away', // In a full prod app, execute Haversine against user coords
          priceRange: data.price_range || 'Contact for Price',
          about: 'This premium vendor profile was authentically bridged from global mapping APIs.',
          amenities: [{ icon: 'check', text: 'Verified Node' }],
          imageUrls: data.image_url ? [data.image_url] : ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=500']
        });
      } else {
        setDisplayVendor({
          id: vendorId, name: 'Vendor Offline', rating: 0, distance: 'N/A', 
          priceRange: '-', about: 'Vendor disconnected from local cache.', imageUrls: []
        });
      }
      setFetching(false);
    };
    loadVendor();
  }, [vendorId]);

  const reserveVendor = async () => {
    if (!eventId) {
      Alert.alert("Missing Event", "Please create an event first before reserving vendors.");
      return;
    }
    
    setLoading(true);
    try {
      const { data: existing } = await supabase.from('reservations')
        .select('id').eq('event_id', eventId).eq('vendor_id', vendorId).maybeSingle();

      if (existing) {
        const { error } = await supabase.from('reservations').update({ status: 'pending' }).eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('reservations').insert({
          event_id: eventId,
          vendor_id: vendorId,
          status: 'pending'
        });
        if (error) throw error;
      }
      Alert.alert("Reservation Sent!", `Your request has been sent to ${displayVendor.name}. They will review and approve shortly.`);
      onBack();
    } catch (err: any) {
      Alert.alert("Reservation Failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching || !displayVendor) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#6a21a6" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 pb-28" showsVerticalScrollIndicator={false}>
        
        <View className="relative h-96">
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
            {displayVendor.imageUrls.map((url: string, i: number) => (
              <Image key={i} source={{ uri: url }} style={{ width, height: 384 }} resizeMode="cover" />
            ))}
          </ScrollView>
          <View className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-black/60 to-transparent" />
          
          <View className="absolute top-12 w-full px-5 flex-row justify-between items-center z-10">
            <TouchableOpacity onPress={onBack} className="w-10 h-10 bg-white/30 backdrop-blur-md rounded-full items-center justify-center border border-white/20">
              <Feather name="arrow-left" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleSave} className="w-10 h-10 bg-white/30 backdrop-blur-md rounded-full items-center justify-center border border-white/20">
              <Ionicons name={isSaved ? "heart" : "heart-outline"} size={22} color={isSaved ? "#ef4444" : "white"} />
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-6 pt-8 bg-white rounded-t-[40px] -mt-10">
          
          <View className="mb-6 flex-row justify-between items-start">
            <View className="flex-1 pr-4">
              <Text className="text-3xl font-black text-slate-900 leading-tight mb-2">{displayVendor.name}</Text>
              <View className="flex-row items-center">
                <View className="flex-row items-center bg-amber-50 px-2 py-1 rounded-lg mr-3">
                  <Ionicons name="star" size={14} color="#d97706" />
                  <Text className="text-xs font-black text-amber-700 ml-1">{displayVendor.rating} (128)</Text>
                </View>
                <View className="flex-row items-center">
                  <Feather name="map-pin" size={14} color="#64748b" />
                  <Text className="text-slate-500 text-sm font-medium ml-1.5">{displayVendor.distance}</Text>
                </View>
              </View>
            </View>
          </View>

          <View className="bg-slate-50 rounded-3xl p-5 border border-slate-100 flex-row justify-between items-center mb-8">
            <View>
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Pricing Starts At</Text>
              <Text className="text-2xl font-black text-primary">{displayVendor.priceRange.split(' ')[0]}</Text>
            </View>
            {(displayVendor as any).venueFee && (
              <View className="items-end">
                <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Venue Fee</Text>
                <Text className="text-lg font-bold text-slate-900">{(displayVendor as any).venueFee}</Text>
              </View>
            )}
          </View>

          <View className="mb-8">
            <Text className="text-xl font-extrabold text-slate-900 mb-3">The Experience</Text>
            <Text className="text-slate-600 text-[15px] leading-relaxed font-medium">{displayVendor.about}</Text>
          </View>

          <View className="mb-8">
            <Text className="text-xl font-extrabold text-slate-900 mb-4">Highlights & Amenities</Text>
            <View className="flex-row flex-wrap justify-between gap-y-3">
              {displayVendor.amenities.map((amenity: any, idx: number) => (
                <View key={idx} className="w-[48%] flex-row items-center p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                  <View className="w-8 h-8 bg-indigo-50 rounded-full items-center justify-center mr-3">
                    <Feather name={amenity.icon as any} size={16} color="#4f46e5" />
                  </View>
                  <Text className="flex-1 text-sm font-bold text-slate-700">{amenity.text}</Text>
                </View>
              ))}
            </View>
          </View>

        </View>
      </ScrollView>

      {/* Floating CTA */}
      <View className="absolute bottom-0 w-full bg-white/95 backdrop-blur-md border-t border-slate-100 px-6 py-4 pb-8 flex-row items-center shadow-[0_-10px_40px_rgba(0,0,0,0.08)]">
        <TouchableOpacity className="w-14 h-14 border-2 border-slate-200 rounded-2xl items-center justify-center mr-3 bg-white active:bg-slate-50">
          <Feather name="calendar" size={24} color="#0f172a" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={reserveVendor}
          disabled={loading}
          className="flex-1 bg-slate-900 h-14 rounded-2xl flex-row items-center justify-center shadow-lg active:scale-[0.98] transition-all"
        >
          {loading ? <ActivityIndicator color="#fff" /> : (
            <>
              <Text className="text-white font-extrabold text-lg mr-2">Lock in Reservation</Text>
              <Feather name="shield" size={18} color="white" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}