import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Animated, Easing, Dimensions, FlatList, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

const occasions = [
  { id: 'wedding', name: 'Wedding', icon: 'heart', description: 'Curated venues & decor' },
  { id: 'corporate', name: 'Corporate', icon: 'briefcase', description: 'Professional workspaces' },
  { id: 'birthday', name: 'Birthday', icon: 'gift', description: 'Fun & energetic vibes' },
  { id: 'party', name: 'Party', icon: 'music', description: 'DJs, clubs & catering' },
];

export default function HomeScreen({ onSelectOccasion, onVendorSelect, navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [userName, setUserName] = useState('Planner');
  const [totalBudget, setTotalBudget] = useState(25000);
  const [budgetSpent, setBudgetSpent] = useState(0);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  
  // Multi-Event Concurrency Architecture
  const [events, setEvents] = useState<any[]>([]);
  const [activeEventIndex, setActiveEventIndex] = useState(0);
  const [topVendors, setTopVendors] = useState<any[]>([]);
  const [eventMetrics, setEventMetrics] = useState<Record<string, { venueName: string | null; venueAddress: string | null; vendorCount: number; rsvps: number; totalRsvps: number; }>>({});
  const screenWidth = Platform.OS === 'web' ? Math.min(Dimensions.get('window').width, 400) : Dimensions.get('window').width;

  // Animation Values
  const scrollY = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Dynamic Greeting Logic
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // Trigger budget animation on mount
  // Trigger massive multi-event refresh & budget animation
  const fetchEventStats = async (ev: any) => {
    setActiveEventId(ev.id);
    setTotalBudget(ev.total_budget || 0);
    
    // Reservations (Vendors & Venues)
    const { data: reserves } = await supabase.from('reservations').select('vendor_id').eq('event_id', ev.id).neq('status', 'rejected');
    let spent = 0;
    let vendorCount = 0;
    let venueName: string | null = null;
    let venueAddress: string | null = null;

    if (reserves && reserves.length > 0) {
      const vIds = reserves.map((r: any) => r.vendor_id);
      vendorCount = vIds.length;
      const { data: vendorData } = await supabase.from('vendors_cache').select('name, address, type, price_range').in('id', vIds);
      vendorData?.forEach(v => {
        if (v.type === 'venues') {
          venueName = v.name;
          venueAddress = v.address;
        }
        const match = v.price_range?.match(/[\d,]+/);
        if (match) spent += parseInt(match[0].replace(/,/g, ''));
      });
    }

    // Attendees (RSVPs)
    const { data: attendees } = await supabase.from('attendees').select('status').eq('event_id', ev.id);
    let rsvpCount = 0;
    let totalRsvps = 0;
    if (attendees) {
      totalRsvps = attendees.length;
      rsvpCount = attendees.filter(a => a.status === 'arrived' || a.status === 'checked_in').length;
    }

    setEventMetrics(prev => ({ ...prev, [ev.id]: { venueName, venueAddress, vendorCount, rsvps: rsvpCount, totalRsvps } }));
    setBudgetSpent(spent);
    const safeTotal = ev.total_budget > 0 ? ev.total_budget : 1;
    Animated.timing(progressAnim, {toValue: Math.min(spent / safeTotal, 1), duration: 1500, easing: Easing.out(Easing.cubic), useNativeDriver: false}).start();
  };

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        if (user.email) setUserName(user.email.split('@')[0].replace(/[^a-zA-Z]/g, ''));
        
        const { data: vCache } = await supabase.from('vendors_cache').select('*').limit(6);
        if (vCache) setTopVendors(vCache);
        
        const { data: userEvents } = await supabase.from('events').select('*').eq('organizer_id', user.id).order('date', { ascending: true });
        if (userEvents && userEvents.length > 0) {
          setEvents(userEvents);
          // Only fetch stats for the currently active index to avoid UI jumping
          const curIndex = activeEventIndex < userEvents.length ? activeEventIndex : 0;
          fetchEventStats(userEvents[curIndex]);
        } else {
          setEvents([]);
          setTotalBudget(25000);
          setBudgetSpent(0);
          Animated.timing(progressAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
        }
      };
      init();
    }, [activeEventIndex])
  );

  // Bind Supabase Real-time Listeners for instant Budget updating
  useEffect(() => {
    if (!activeEventId) return;
    
    const channel = supabase.channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations', filter: `event_id=eq.${activeEventId}` }, (payload) => {
         // Auto-calculate budget traces seamlessly across all logged nodes
         if (events[activeEventIndex]) fetchEventStats(events[activeEventIndex]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeEventId, activeEventIndex, events]);

  // Split genuine database vendors for Masonry Layout
  const leftColumnVendors = topVendors.filter((_, index) => index % 2 === 0);
  const rightColumnVendors = topVendors.filter((_, index) => index % 2 !== 0);

  // Animated Header Styles
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60, 100],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });
  
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [-50, 0],
    extrapolate: 'clamp',
  });

  return (
    <View className="flex-1 bg-white">
      
      {/* STICKY MINI-HEADER (Fades in on scroll) 
        Note: For a true iOS frosted glass effect, replace this View with <BlurView intensity={80} tint="light"> from 'expo-blur'
      */}
      <Animated.View 
        style={{ opacity: headerOpacity, transform: [{ translateY: headerTranslateY }] }}
        className="absolute top-0 w-full z-50 bg-white/95 border-b border-slate-100 px-6 py-4 pt-12 flex-row justify-between items-center"
      >
        <Text className="text-lg font-black text-slate-900">{userName}'s Planner</Text>
        <TouchableOpacity onPress={() => supabase.auth.signOut()} className="w-8 h-8 rounded-full overflow-hidden border border-red-200 justify-center items-center bg-red-50">
          <Feather name="log-out" size={14} color="#ef4444" />
        </TouchableOpacity>
      </Animated.View>

      <Animated.ScrollView 
        showsVerticalScrollIndicator={false} 
        className="pt-6 pb-24"
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
      >
        
        {/* Header: Personalized Greeting */}
        <View className="px-6 flex-row justify-between items-center mb-6 pt-6">
          <View>
            <Text className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-1">{greeting}</Text>
            <Text className="text-3xl font-black text-slate-900 tracking-tight">{userName}'s Planner</Text>
          </View>
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.navigate('Gatekeeper', { eventId: activeEventId })} className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-100 shadow-sm justify-center items-center bg-white mr-3">
              <Feather name="maximize" size={20} color="#0f172a" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')} className="w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-100 shadow-sm justify-center items-center bg-indigo-50">
              <Feather name="user" size={20} color="#4f46e5" />
            </TouchableOpacity>
          </View>
        </View>

        {/* The "Command Center" Widget */}
        <View className="mb-8">
          {events.length === 0 ? (
            <View className="px-6">
              <View className="bg-white rounded-[32px] p-8 py-12 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-100 overflow-hidden items-center relative">
                <View className="absolute -right-20 -top-20 w-64 h-64 bg-slate-50 rounded-full blur-3xl opacity-50" />
                <View className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-50/50 rounded-full blur-2xl opacity-50" />
                <View className="w-16 h-16 bg-slate-50 rounded-full items-center justify-center mb-5 border border-slate-100 shadow-sm">
                  <Feather name="calendar" size={28} color="#0f172a" />
                </View>
                <Text className="text-slate-900 text-2xl font-black mb-2 text-center tracking-tight">Zero Active Plans</Text>
                <Text className="text-slate-500 text-center font-medium px-4 leading-relaxed">Let's craft an unparalleled experience. Tap an occasion below to build your itinerary.</Text>
              </View>
            </View>
          ) : (
            <>
              <FlatList
                data={events}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                snapToInterval={screenWidth}
                decelerationRate="fast"
                onMomentumScrollEnd={(e) => {
                  const newIndex = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
                  if (newIndex !== activeEventIndex) setActiveEventIndex(newIndex);
                }}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => {
                  const metrics = eventMetrics[item.id] || { venueName: null, venueAddress: null, vendorCount: 0, rsvps: 0, totalRsvps: 0 };
                  const days = Math.ceil((new Date(item.date).getTime() - new Date().getTime()) / 86400000);
                  
                  return (
                    <View style={{ width: screenWidth }} className="px-6">
                      <View className="bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-100 overflow-hidden relative">
                        <View className="absolute -right-20 -top-20 w-64 h-64 bg-slate-50 rounded-full blur-3xl opacity-50" />
                        
                        <View className="flex-row justify-between items-start mb-6 z-10">
                          <View className="flex-1 mr-4">
                            <View className="flex-row items-center mb-3">
                              <View className="bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 mr-3">
                                <Text className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Active Plan</Text>
                              </View>
                            </View>
                            <Text className="text-slate-900 text-3xl font-black leading-tight" numberOfLines={2}>
                              {item.title || 'Untitled'}
                            </Text>
                            <Text className="text-indigo-600 text-sm font-bold mt-2">
                              {metrics.venueName ? `📍 ${metrics.venueName}, ${metrics.venueAddress || item.location}` : '📍 Tap to select a venue'}
                            </Text>
                          </View>

                          {/* Day Counter Matrix */}
                          <View className="items-center bg-slate-900 px-4 py-3 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
                            <Text className="text-white text-2xl font-black">{days < 0 ? '0' : days}</Text>
                            <Text className="text-white/60 text-[10px] uppercase font-bold tracking-wider">{days < 0 ? 'Done' : 'Days'}</Text>
                          </View>
                        </View>

                        {/* Live KPI Stats */}
                        <View className="flex-row justify-between items-center mb-5 px-1 pb-4 border-b border-slate-100">
                           <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider">Vendors: <Text className="text-slate-900">{metrics.vendorCount}/8 Booked</Text></Text>
                           <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider">RSVPs: <Text className="text-indigo-600">{metrics.rsvps}/{metrics.totalRsvps}</Text></Text>
                        </View>

                        {/* Button Hierarchy Refactor */}
                        <TouchableOpacity 
                          className="w-full bg-[#1A1A1A] py-4 rounded-xl items-center flex-row justify-center shadow-lg active:scale-95 transition-all mb-3"
                          onPress={() => navigation.navigate('DiscoveryDashboard', { eventId: item.id, eventType: item.type || item.title || 'Event', budget: item.total_budget || 0 })}
                        >
                          <Text className="text-white font-extrabold text-base">Manage Event</Text>
                        </TouchableOpacity>
                        
                        <View className="flex-row justify-between gap-x-3">
                          <TouchableOpacity 
                            className="flex-1 bg-white py-3.5 rounded-xl border border-slate-200 shadow-sm items-center flex-row justify-center active:bg-slate-50"
                            onPress={() => navigation.navigate('GuestList', { eventId: item.id })}
                          >
                            <Feather name="users" size={16} color="#0f172a" />
                            <Text className="text-slate-900 font-bold ml-2">Invite</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            className="flex-1 bg-emerald-50 py-3.5 rounded-xl border border-emerald-100 shadow-sm items-center flex-row justify-center active:bg-emerald-100"
                            onPress={() => navigation.navigate('Gatekeeper', { eventId: item.id })}
                          >
                            <Feather name="maximize" size={16} color="#059669" />
                            <Text className="text-emerald-700 font-bold ml-2 text-xs uppercase tracking-wide">Scanner</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  );
                }}
              />
              
              {/* Paging Dots Component */}
              {events.length > 1 && (
                <View className="flex-row justify-center items-center mt-4 gap-x-2">
                  {events.map((_, idx) => (
                    <View 
                      key={idx} 
                      className={`h-2 rounded-full transition-all ${idx === activeEventIndex ? 'w-6 bg-primary' : 'w-2 bg-slate-300'}`} 
                    />
                  ))}
                </View>
              )}
            </>
          )}
        </View>

        {/* Search Bar & Anticipation Chip */}
        <View className="px-6 mb-8">
          <View className="flex-row items-center bg-white rounded-2xl px-4 py-3.5 border border-slate-200 shadow-[0_4px_12px_rgba(0,0,0,0.03)] z-10">
            <Feather name="search" size={20} color="#94a3b8" />
            <TextInput
              placeholder="Search Location or Vendor..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-3 text-slate-900 font-bold text-base"
            />
          </View>
          
          {/* Pick up where you left off chip */}
          <TouchableOpacity 
            className="self-start mt-3 ml-1 flex-row items-center bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100"
            onPress={() => navigation.navigate('DiscoveryDashboard', { eventId: activeEventId, eventType: events[activeEventIndex]?.type || 'Event', budget: events[activeEventIndex]?.total_budget || 0 })}
          >
            <Feather name="clock" size={12} color="#4f46e5" />
            <Text className="text-indigo-700 text-xs font-bold ml-1.5">Continue searching for Vendors</Text>
            <Feather name="chevron-right" size={14} color="#4f46e5" className="ml-1" />
          </TouchableOpacity>
        </View>

        {/* Occasions Horizontal Scroll */}
        <View className="mb-10">
          <Text className="px-6 text-xl font-extrabold text-slate-900 mb-5">What are we planning?</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}>
            {occasions.map(occ => (
              <TouchableOpacity 
                key={occ.id} 
                activeOpacity={0.8}
                onPress={() => onSelectOccasion(occ.id, searchQuery)} 
                className="items-center"
              >
                <View className="w-16 h-16 rounded-3xl bg-white items-center justify-center mb-2 border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
                  <Feather name={occ.icon as any} size={24} color="#6a21a6" />
                </View>
                <Text className="text-slate-700 font-bold text-xs">{occ.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Masonry Inspiration Grid */}
        <View className="px-6 mb-6">
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-xl font-extrabold text-slate-900">Highest Rated</Text>
            <TouchableOpacity onPress={() => navigation.navigate('DiscoveryDashboard', { eventId: activeEventId, eventType: events[activeEventIndex]?.type || 'Event', budget: events[activeEventIndex]?.total_budget || 0 })}>
                <Text className="text-primary font-bold text-sm">Explore Board</Text>
            </TouchableOpacity>
          </View>
          
          <View className="flex-row justify-between">
            {/* Left Column */}
            <View className="w-[48%] flex-col gap-y-4">
              {leftColumnVendors.map((vendor, index) => (
                <TouchableOpacity 
                  key={vendor.id} 
                  activeOpacity={0.9}
                  onPress={() => onVendorSelect(vendor.id)} 
                  // Alternate heights to create the masonry staggered effect
                  className={`bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm ${index % 2 === 0 ? 'h-64' : 'h-48'}`}
                >
                  <Image source={{ uri: vendor.image_url || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=500' }} className="w-full h-full absolute" resizeMode="cover" />
                  <View className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  <View className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg flex-row items-center">
                    <Ionicons name="star" size={10} color="#f59e0b" />
                    <Text className="text-[10px] font-black text-slate-900 ml-1">{vendor.rating}</Text>
                  </View>
                  
                  <View className="absolute bottom-0 w-full p-3">
                    <Text className="font-extrabold text-white text-sm mb-0.5" numberOfLines={2}>{vendor.name}</Text>
                    <Text className="text-white/80 font-bold text-xs">{vendor.price_range?.split(' ')[0] || 'Contact'}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Right Column (Starts with a short card to stagger) */}
            <View className="w-[48%] flex-col gap-y-4">
              {rightColumnVendors.map((vendor, index) => (
                <TouchableOpacity 
                  key={vendor.id} 
                  activeOpacity={0.9}
                  onPress={() => onVendorSelect(vendor.id)} 
                  className={`bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm ${index % 2 === 0 ? 'h-48' : 'h-64'}`}
                >
                  <Image source={{ uri: vendor.image_url || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=500' }} className="w-full h-full absolute" resizeMode="cover" />
                  <View className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  <View className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg flex-row items-center">
                    <Ionicons name="star" size={10} color="#f59e0b" />
                    <Text className="text-[10px] font-black text-slate-900 ml-1">{vendor.rating}</Text>
                  </View>
                  
                  <View className="absolute bottom-0 w-full p-3">
                    <Text className="font-extrabold text-white text-sm mb-0.5" numberOfLines={2}>{vendor.name}</Text>
                    <Text className="text-white/80 font-bold text-xs">{vendor.price_range?.split(' ')[0] || 'Contact'}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

      </Animated.ScrollView>
    </View>
  );
}