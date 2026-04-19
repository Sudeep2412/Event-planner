import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

interface SubEventStats {
  sub_event_id: string;
  name: string;
  meal_type: string;
  date: string;
  start_time: string;
  end_time: string;
  total_persons: number;
  veg_count: number;
  nonveg_count: number;
  driver_count: number;
  driver_veg: number;
  driver_nonveg: number;
  rsvp_count: number;
}

const MEAL_ICONS: Record<string, string> = { breakfast: '🌅', lunch: '☀️', dinner: '🌙' };
const MEAL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  breakfast: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  lunch: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  dinner: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
};

export default function FoodAnalyticsScreen({ route, navigation }: any) {
  const { eventId } = route?.params || {};
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SubEventStats[]>([]);
  const [totalInvited, setTotalInvited] = useState(0);
  const [totalResponded, setTotalResponded] = useState(0);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch sub-events
      const { data: subEvents } = await supabase
        .from('sub_events')
        .select('*')
        .eq('event_id', eventId)
        .order('sort_order', { ascending: true });

      if (!subEvents || subEvents.length === 0) {
        setStats([]);
        setLoading(false);
        return;
      }

      // Fetch all RSVP responses for this event
      const { data: rsvps } = await supabase
        .from('rsvp_responses')
        .select('id')
        .eq('event_id', eventId);

      setTotalResponded(rsvps?.length || 0);

      // Fetch attendees count
      const { data: attendees } = await supabase
        .from('attendees')
        .select('id')
        .eq('event_id', eventId);

      setTotalInvited(attendees?.length || 0);

      // Fetch all choices grouped by sub_event
      const subEventIds = subEvents.map(se => se.id);
      const { data: choices } = await supabase
        .from('rsvp_sub_event_choices')
        .select('*')
        .in('sub_event_id', subEventIds);

      // Aggregate stats per sub-event
      const aggregated: SubEventStats[] = subEvents.map(se => {
        const seChoices = (choices || []).filter(c => c.sub_event_id === se.id);
        return {
          sub_event_id: se.id,
          name: se.name,
          meal_type: se.meal_type,
          date: se.date,
          start_time: se.start_time,
          end_time: se.end_time,
          total_persons: seChoices.reduce((sum, c) => sum + (c.person_count || 0), 0),
          veg_count: seChoices.reduce((sum, c) => sum + (c.veg_count || 0), 0),
          nonveg_count: seChoices.reduce((sum, c) => sum + (c.nonveg_count || 0), 0),
          driver_count: seChoices.reduce((sum, c) => sum + (c.driver_count || 0), 0),
          driver_veg: seChoices.filter(c => c.driver_meal_pref === 'veg').reduce((sum, c) => sum + (c.driver_count || 0), 0),
          driver_nonveg: seChoices.filter(c => c.driver_meal_pref === 'nonveg').reduce((sum, c) => sum + (c.driver_count || 0), 0),
          rsvp_count: seChoices.length,
        };
      });

      setStats(aggregated);
    } catch (err: any) {
      console.log('Analytics error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${m} ${ampm}`;
  };

  // Aggregate totals
  const totalVeg = stats.reduce((s, st) => s + st.veg_count, 0);
  const totalNonveg = stats.reduce((s, st) => s + st.nonveg_count, 0);
  const totalDrivers = stats.reduce((s, st) => s + st.driver_count, 0);
  const totalPersons = stats.reduce((s, st) => s + st.total_persons, 0);

  // Smart recommendation: 10% buffer
  const recommendedMeals = Math.ceil(totalPersons * 1.1);
  const traditionalEstimate = totalInvited > 0 ? Math.ceil(totalInvited * 0.75) : totalPersons * 2;
  const potentialSavings = Math.max(0, traditionalEstimate - recommendedMeals);

  if (loading) {
    return (
      <View className="flex-1 bg-[#FAFAFA] justify-center items-center">
        <ActivityIndicator size="large" color="#0f172a" />
        <Text className="text-slate-500 font-bold mt-4">Loading analytics...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#FAFAFA] pt-12">
      {/* Header */}
      <View className="px-6 py-5 flex-row items-center border-b border-slate-100 bg-white z-10 shadow-sm">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 mr-3 bg-slate-50 border border-slate-100 rounded-full">
          <Feather name="arrow-left" size={20} color="#0f172a" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-xl font-black text-slate-900 tracking-tight">Serve Smart Dashboard</Text>
          <Text className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-0.5">🌿 Zero Waste Celebrations</Text>
        </View>
        <TouchableOpacity onPress={fetchAnalytics} className="p-2 bg-slate-50 rounded-full border border-slate-100">
          <Feather name="refresh-cw" size={18} color="#0f172a" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* Summary Cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 8 }}>
          {/* Total Guests */}
          <View className="w-36 mr-4 bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
            <View className="w-10 h-10 bg-indigo-100 rounded-xl items-center justify-center mb-3">
              <Feather name="users" size={18} color="#4f46e5" />
            </View>
            <Text className="text-3xl font-black text-slate-900">{totalPersons}</Text>
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Confirmed</Text>
          </View>

          {/* Veg */}
          <View className="w-36 mr-4 bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm">
            <View className="w-10 h-10 bg-emerald-100 rounded-xl items-center justify-center mb-3">
              <Text className="text-lg">🥬</Text>
            </View>
            <Text className="text-3xl font-black text-emerald-600">{totalVeg}</Text>
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Veg Meals</Text>
          </View>

          {/* Non-Veg */}
          <View className="w-36 mr-4 bg-white rounded-3xl p-5 border border-red-100 shadow-sm">
            <View className="w-10 h-10 bg-red-100 rounded-xl items-center justify-center mb-3">
              <Text className="text-lg">🍗</Text>
            </View>
            <Text className="text-3xl font-black text-red-600">{totalNonveg}</Text>
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Non-Veg</Text>
          </View>

          {/* Drivers */}
          <View className="w-36 mr-4 bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
            <View className="w-10 h-10 bg-slate-100 rounded-xl items-center justify-center mb-3">
              <Text className="text-lg">🚗</Text>
            </View>
            <Text className="text-3xl font-black text-slate-900">{totalDrivers}</Text>
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Drivers</Text>
          </View>
        </ScrollView>

        {/* RSVP Progress */}
        <View className="mx-6 mt-4 mb-6 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm font-black text-slate-900">RSVP Response Rate</Text>
            <Text className="text-sm font-bold text-indigo-600">{totalResponded} / {totalInvited || totalResponded} responded</Text>
          </View>
          <View className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <View
              className="h-full bg-indigo-500 rounded-full"
              style={{ width: `${totalInvited > 0 ? Math.min(100, (totalResponded / totalInvited) * 100) : 100}%` }}
            />
          </View>
        </View>

        {/* Per-Function Breakdown */}
        <Text className="px-6 text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Function-wise Breakdown</Text>

        {stats.length === 0 ? (
          <View className="mx-6 bg-white rounded-3xl p-10 border border-slate-100 items-center">
            <Feather name="bar-chart-2" size={48} color="#cbd5e1" />
            <Text className="text-slate-500 font-bold mt-4 text-center">No functions configured yet.{"\n"}Add sub-events first.</Text>
          </View>
        ) : (
          stats.map((st, index) => {
            const colors = MEAL_COLORS[st.meal_type] || MEAL_COLORS.dinner;
            const totalMeals = st.veg_count + st.nonveg_count;
            const vegPercent = totalMeals > 0 ? Math.round((st.veg_count / totalMeals) * 100) : 0;

            return (
              <View key={st.sub_event_id} className="mx-6 mb-4 bg-white rounded-3xl border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.04)] overflow-hidden">
                {/* Function Header */}
                <View className="p-5 pb-4 flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1 mr-3">
                    <View className="w-11 h-11 bg-slate-900 rounded-xl items-center justify-center mr-3">
                      <Text className="text-lg">{MEAL_ICONS[st.meal_type] || '🍽️'}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-slate-900 font-black text-base">{st.name}</Text>
                      <Text className="text-slate-500 text-xs font-bold mt-0.5">{st.date} · {formatTime(st.start_time)} - {formatTime(st.end_time)}</Text>
                    </View>
                  </View>
                  <View className={`px-3 py-1.5 rounded-lg ${colors.bg} border ${colors.border}`}>
                    <Text className={`text-[10px] font-black uppercase tracking-widest ${colors.text}`}>{st.meal_type}</Text>
                  </View>
                </View>

                {/* Stats Grid */}
                <View className="px-5 pb-5">
                  <View className="flex-row mb-3 gap-x-3">
                    <View className="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Expected</Text>
                      <Text className="text-slate-900 font-black text-xl mt-1">{st.total_persons}</Text>
                      <Text className="text-slate-400 text-xs font-medium">{st.rsvp_count} RSVPs</Text>
                    </View>
                    <View className="flex-1 bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                      <Text className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest">Veg</Text>
                      <Text className="text-emerald-700 font-black text-xl mt-1">{st.veg_count}</Text>
                      <Text className="text-emerald-500 text-xs font-medium">{vegPercent}% of meals</Text>
                    </View>
                    <View className="flex-1 bg-red-50 rounded-xl p-3 border border-red-100">
                      <Text className="text-red-600 text-[10px] font-bold uppercase tracking-widest">Non-Veg</Text>
                      <Text className="text-red-700 font-black text-xl mt-1">{st.nonveg_count}</Text>
                      <Text className="text-red-500 text-xs font-medium">{100 - vegPercent}% of meals</Text>
                    </View>
                  </View>

                  {/* Veg vs Non-Veg Bar */}
                  <View className="h-3 bg-slate-100 rounded-full overflow-hidden flex-row mb-3">
                    <View className="h-full bg-emerald-400 rounded-l-full" style={{ width: `${vegPercent}%` }} />
                    <View className="h-full bg-red-400 rounded-r-full" style={{ width: `${100 - vegPercent}%` }} />
                  </View>

                  {/* Driver row */}
                  {st.driver_count > 0 && (
                    <View className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex-row items-center justify-between">
                      <Text className="text-slate-600 font-bold text-xs">🚗 Driver Meals</Text>
                      <Text className="text-slate-900 font-black text-sm">{st.driver_count} ({st.driver_veg} Veg, {st.driver_nonveg} Non-Veg)</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        )}

        {/* Food Waste Insight Panel */}
        {stats.length > 0 && (
          <View className="mx-6 mt-4 mb-6 bg-emerald-900 rounded-3xl p-6 overflow-hidden relative">
            <View className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-800 rounded-full opacity-50" />
            <View className="absolute -left-6 -bottom-6 w-24 h-24 bg-emerald-800 rounded-full opacity-40" />

            <View className="flex-row items-center mb-4 z-10">
              <Text className="text-2xl mr-3">🌿</Text>
              <Text className="text-emerald-100 font-black text-lg tracking-tight">Serve Smart Insights</Text>
            </View>

            <View className="z-10">
              <View className="flex-row justify-between mb-4">
                <View className="flex-1 mr-3">
                  <Text className="text-emerald-300/70 text-[10px] font-bold uppercase tracking-widest">Traditional Estimate</Text>
                  <Text className="text-white font-black text-2xl mt-1">{traditionalEstimate}</Text>
                  <Text className="text-emerald-300/60 text-xs font-medium">meals (guesswork)</Text>
                </View>
                <View className="flex-1 mr-3">
                  <Text className="text-emerald-300/70 text-[10px] font-bold uppercase tracking-widest">Smart Estimate</Text>
                  <Text className="text-emerald-400 font-black text-2xl mt-1">{recommendedMeals}</Text>
                  <Text className="text-emerald-300/60 text-xs font-medium">meals (RSVP + 10%)</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-emerald-300/70 text-[10px] font-bold uppercase tracking-widest">Savings</Text>
                  <Text className="text-emerald-300 font-black text-2xl mt-1">{potentialSavings}</Text>
                  <Text className="text-emerald-300/60 text-xs font-medium">meals saved</Text>
                </View>
              </View>

              <View className="bg-emerald-800/50 rounded-xl p-4 border border-emerald-700/30">
                <Text className="text-emerald-200 text-xs font-medium leading-5">
                  Based on {totalResponded} confirmed RSVPs, we recommend preparing for {recommendedMeals} meals (10% buffer).
                  This could save up to {potentialSavings} meals worth of food compared to traditional estimation.
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
