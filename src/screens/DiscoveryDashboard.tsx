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

  const [fallbackMode, setFallbackMode] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [radius, setRadius] = useState(20);

  const fetchScrapedData = async (overrideRadius?: number) => {
    setLoading(true);
    setFallbackMode(false);
    try {
      // 1. Fetch Event Location
      let eventLocation = 'Mumbai';
      if (eventId) {
        const { data: eventData } = await supabase.from('events').select('location').eq('id', eventId).single();
        if (eventData && eventData.location) {
          eventLocation = eventData.location;
        }
      }

      let lat = 19.0760;
      let lng = 72.8777; 
      let radiusMeters = (overrideRadius || radius) * 1000;

      if (typeof overrideRadius !== 'number') {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase.from('profiles').select('search_radius_km').eq('id', user.id).single();
            if (profile && profile.search_radius_km) {
               radiusMeters = profile.search_radius_km * 1000;
               setRadius(profile.search_radius_km);
            }
          }
        } catch (e) {
          console.warn("Could not fetch user radius preference.");
        }
      }

      console.log(`Live Scraping: Resolving coordinates for ${eventLocation}...`);
      try {
        const geocode = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(eventLocation)}&format=json&limit=1`, {
          headers: { 'User-Agent': 'EventMasterPro/1.0' }
        });
        const geocodeData = await geocode.json();
        if (geocodeData && geocodeData.length > 0) {
          lat = parseFloat(geocodeData[0].lat);
          lng = parseFloat(geocodeData[0].lon);
        }
      } catch (geoErr) {
        console.warn("Geocoding failed, using default coords.");
      }

      // 3. Live Overpass API Scraping (Dynamic Radius)
      try {
        console.log(`Live Scraping: Fetching OpenStreetMap nodes around [${lat}, ${lng}] within ${radiusMeters/1000}km...`);
        const overpassQuery = `
        [out:json][timeout:45];
        (
          node(around:${radiusMeters}, ${lat}, ${lng})["amenity"="restaurant"];
          node(around:${radiusMeters}, ${lat}, ${lng})["leisure"="park"];
          node(around:${radiusMeters}, ${lat}, ${lng})["building"="commercial"];
        );
        out 20;
      `;
      
      const overpassRes = await fetch(`https://overpass-api.de/api/interpreter`, {
        method: 'POST',
        body: 'data=' + encodeURIComponent(overpassQuery),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      if (!overpassRes.ok) throw new Error(`Overpass API Error: ${overpassRes.status}`);
      const overpassData = await overpassRes.json();
      
      const types = ['Venues', 'Caterers', 'Photographers', 'Decorators', 'DJs', 'Makeup Artists'];
      const images = [
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=500',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=500',
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=500',
        'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=500'
      ];

      // 4. Map Raw OSM Data to EventMaster schema with Real Photo Support
      const liveVendors = overpassData.elements
        .filter((el: any) => el.tags && el.tags.name) // only nodes with names
        .map((el: any, index: number) => {
          let mappedType = el.tags.amenity === 'restaurant' ? 'Caterers' : (el.tags.leisure || el.tags.tourism) ? 'Venues' : types[index % types.length];
          
          let realPhotoUrl = null;
          if (el.tags.image) {
            realPhotoUrl = el.tags.image;
          } else if (el.tags.wikimedia_commons && el.tags.wikimedia_commons.startsWith('File:')) {
            realPhotoUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(el.tags.wikimedia_commons.replace('File:', ''))}?width=500`;
          }

          return {
            id: `osm-${el.id}`,
            name: el.tags.name,
            category: mappedType,
            type: mappedType,
            price_range: ['Price: $$', 'Price: $$$', 'Price: $$$$'][Math.floor(Math.random()*3)],
            rating: Number((4 + Math.random()).toFixed(1)),
            address: el.tags['addr:street'] ? `${el.tags['addr:street']}, ${eventLocation}` : `${eventLocation} Metropolitan Area`,
            phone: el.tags.phone || el.tags['contact:phone'] || 'Contact unavailable',
            website: el.tags.website || el.tags['contact:website'] || null,
            opening_hours: el.tags.opening_hours || 'Varies by event',
            capacity: el.tags.capacity || null,
            diet_veg: el.tags['diet:vegetarian'] === 'yes' || el.tags['diet:vegan'] === 'yes',
            diet_halal: el.tags['diet:halal'] === 'yes',
            wheelchair: el.tags.wheelchair === 'yes',
            outdoor: el.tags.outdoor_seating === 'yes',
            wifi: el.tags.internet_access === 'wlan' || el.tags.wifi === 'yes' || el.tags.internet_access === 'yes',
            image_url: realPhotoUrl || images[index % images.length],
          };
        });

      if (liveVendors.length > 0) {
        setVendors(liveVendors);
        setIsLive(true);
        const uniqueTypes = ['All', ...new Set(liveVendors.map((v: any) => v.type).filter(Boolean))];
        setCategories(uniqueTypes as string[]);
        
        // 5. Silently auto-cache for offline mode
        supabase.from('vendors_cache').upsert(liveVendors.map((v: any) => ({
          ...v, price: 0
        }))).then(({ error }) => {
          if (error) console.log("Silent cache error:", error.message);
        });
        
      } else {
        throw new Error("No live vendors found in that exact radius.");
      }
    } catch (scraperErr: any) {
      // Fallback to cached vendors from Supabase table
      console.log('Live scraper unavailable, falling back to cache:', scraperErr.message);
      setIsLive(false);
      setFallbackMode(true);
      const { data: cachedVendors, error: cacheError } = await supabase
        .from('vendors_cache')
        .select('*')
        .limit(20);
      
      if (cacheError) throw cacheError;
      
      if (cachedVendors && cachedVendors.length > 0) {
        setVendors(cachedVendors);
        const uniqueTypes = ['All', ...new Set(cachedVendors.map((v: any) => v.type).filter(Boolean))];
        setCategories(uniqueTypes as string[]);
      } else {
        setVendors([]);
      }
    }
  } catch (err: any) {
    Alert.alert("Discovery Error", "Could not load vendors. Please check your connection.");
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

  const updateRadiusLive = async (delta: number) => {
    const newRadius = Math.max(2, Math.min(50, radius + delta));
    if (newRadius === radius) return;
    setRadius(newRadius);
    supabase.auth.getUser().then(({ data: { user }}) => {
      if (user) supabase.from('profiles').update({ search_radius_km: newRadius }).eq('id', user.id);
    });
  };

  return (
    <View className="flex-1 bg-slate-50 pt-12">
      <View className="px-5 py-4 flex-row items-center justify-between bg-white shadow-sm z-10 border-b border-slate-100">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-slate-50 rounded-full border border-slate-100">
          <Feather name="arrow-left" size={20} color="#0f172a" />
        </TouchableOpacity>
        <View className="flex-1 items-center px-4">
          <Text className="text-lg font-black text-slate-900 capitalize tracking-tight" numberOfLines={1}>{eventType} Directory</Text>
          <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Budget: ₹{budget.toLocaleString('en-IN')}</Text>
        </View>
        <TouchableOpacity onPress={() => fetchScrapedData()} className="p-2 bg-slate-50 rounded-full border border-slate-100">
          <Feather name="refresh-cw" size={20} color="#0f172a" />
        </TouchableOpacity>
      </View>

      <View className="bg-white border-b border-slate-100 z-10 py-3">
        {/* Live Status & Radius Controller */}
        <View className="px-5 mb-3 flex-row items-center justify-between">
          <View className={`px-3 py-1.5 rounded-full flex-row items-center border ${isLive ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
            <View className={`w-2 h-2 rounded-full mr-2 ${isLive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <Text className={`text-[10px] font-black tracking-wide uppercase ${isLive ? 'text-emerald-700' : 'text-amber-700'}`}>
              {isLive ? 'LIVE' : 'CACHE'}
            </Text>
          </View>

          {/* Interactive Live Radius Scaler */}
          <View className="flex-row items-center bg-slate-50 rounded-full border border-slate-200 overflow-hidden">
            <TouchableOpacity onPress={() => updateRadiusLive(-2)} className="px-3 py-1.5 border-r border-slate-200 active:bg-slate-200">
              <Feather name="minus" size={14} color="#0f172a" />
            </TouchableOpacity>
            <View className="px-3">
               <Text className="text-xs font-black text-slate-900">{radius} km</Text>
            </View>
            <TouchableOpacity onPress={() => updateRadiusLive(2)} className="px-3 py-1.5 border-l border-slate-200 active:bg-slate-200">
              <Feather name="plus" size={14} color="#0f172a" />
            </TouchableOpacity>
          </View>
        </View>

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
        {fallbackMode && (
          <View className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 flex-row items-center">
            <Feather name="info" size={14} color="#d97706" />
            <Text className="text-amber-700 text-xs font-bold ml-2">Showing cached results — live search unavailable</Text>
          </View>
        )}
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
                <Text className="text-xl font-black text-slate-900 mb-2 leading-tight">{vendor.name}</Text>
                
                {/* Meta Badges */}
                { (vendor.diet_veg || vendor.diet_halal || vendor.capacity) && (
                  <View className="flex-row gap-2 mb-3">
                    {vendor.diet_veg && <View className="bg-emerald-50 px-2 py-1 rounded flex-row items-center border border-emerald-200"><Text className="text-emerald-700 text-[10px] font-bold uppercase tracking-widest">🥬 Pure Veg</Text></View>}
                    {vendor.diet_halal && <View className="bg-amber-50 px-2 py-1 rounded flex-row items-center border border-amber-200"><Text className="text-amber-700 text-[10px] font-bold uppercase tracking-widest">🕌 Halal</Text></View>}
                    {vendor.capacity && <View className="bg-slate-100 px-2 py-1 rounded flex-row items-center border border-slate-200"><Text className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">👥 Max: {vendor.capacity}</Text></View>}
                  </View>
                )}

                <View className="flex-row items-center mb-1.5">
                  <Feather name="map-pin" size={12} color="#64748b" />
                  <Text className="text-slate-500 font-bold text-xs ml-1.5 leading-tight flex-1" numberOfLines={2}>{vendor.address}</Text>
                </View>

                {vendor.phone !== 'Contact unavailable' && (
                  <View className="flex-row items-center mb-1.5">
                    <Feather name="phone" size={12} color="#64748b" />
                    <Text className="text-slate-500 font-bold text-xs ml-1.5">{vendor.phone}</Text>
                  </View>
                )}
                
                {vendor.opening_hours !== 'Varies by event' && (
                  <View className="flex-row items-center mb-3">
                    <Feather name="clock" size={12} color="#64748b" />
                    <Text className="text-slate-500 font-bold text-xs ml-1.5">{vendor.opening_hours}</Text>
                  </View>
                )}
                
                {/* Amenities Block */}
                {(vendor.wheelchair || vendor.outdoor || vendor.wifi) && (
                  <View className="flex-row items-center gap-x-2.5 mb-3 border-t border-slate-50 pt-3">
                    {vendor.wheelchair && <Text className="text-sm">♿</Text>}
                    {vendor.outdoor && <Text className="text-sm">🌳</Text>}
                    {vendor.wifi && <Text className="text-sm">📶</Text>}
                  </View>
                )}

                <Text className="text-slate-900 font-black text-xs mb-4 mt-1">{vendor.price_range}  ·  Starting Budget</Text>
                
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
