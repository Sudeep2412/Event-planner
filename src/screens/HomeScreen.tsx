import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { occasions } from '../data/dummyData';

interface HomeScreenProps {
  onSelectOccasion: (id: string, location: string) => void;
}

export default function HomeScreen({ onSelectOccasion }: HomeScreenProps) {
  const [location, setLocation] = useState('');
  return (
    <View className="flex-1 bg-[#fcfaff]">
      {/* Header */}
      <View className="bg-white/80 p-4 border-b border-slate-100 mt-12 flex-row items-center">
        <View className="relative w-full">
          <View className="absolute z-10 left-3 top-3">
            <Feather name="map-pin" size={18} color="#6a21a6" />
          </View>
          <TextInput
            className="w-full bg-slate-100 rounded-xl pl-10 pr-4 py-3 text-slate-800 text-sm font-medium"
            placeholder="Where is the event? (e.g., Downtown)"
            placeholderTextColor="#64748b"
            value={location}
            onChangeText={setLocation}
          />
        </View>
      </View>

      <ScrollView className="flex-1 px-5 pt-8 pb-32">
        {/* Hero Section */}
        <View className="mb-10">
          <Text className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Let's plan your{'\n'}<Text className="text-primary">perfect</Text> event
          </Text>
          <Text className="mt-3 text-slate-500 text-base font-medium">
            Select an occasion to get started with your journey and discover curated vendors.
          </Text>
        </View>

        {/* Occasion Selection */}
        <View>
          <Text className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
            Choose Occasion
          </Text>
          <View className="flex-col">
            {occasions.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                onPress={() => onSelectOccasion(item.id, location)}
                className="w-full bg-white p-5 rounded-2xl mb-4 flex-row items-center border border-slate-100 shadow-sm active:scale-[0.98] transition-all"
              >
                <View className="w-14 h-14 bg-primary/10 rounded-full items-center justify-center mr-4">
                  <Feather name={item.icon as any} size={24} color="#6a21a6" />
                </View>
                <View className="flex-1">
                  <Text className="font-extrabold text-slate-900 text-lg">{item.name}</Text>
                  <Text className="text-slate-500 text-xs mt-0.5">{item.description}</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#cbd5e1" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Tip */}
        <View className="mt-4 p-4 bg-purple-50 rounded-2xl border border-purple-100 flex-row">
          <Feather name="info" size={20} color="#6a21a6" className="mt-1" />
          <View className="ml-3 flex-1">
            <Text className="font-bold text-primary text-sm">Need Help?</Text>
            <Text className="text-xs text-slate-600 mt-1">
              Our expert planners are available 24/7 to help you curate your special day.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Nav */}
      <View className="absolute bottom-0 w-full bg-white border-t border-slate-100 px-6 py-4 pb-8 flex-row justify-between items-center shadow-lg">
        <TouchableOpacity className="items-center">
          <Feather name="home" size={24} color="#6a21a6" />
          <Text className="text-[10px] font-bold text-primary mt-1">Home</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <Feather name="calendar" size={24} color="#94a3b8" />
          <Text className="text-[10px] font-medium text-slate-400 mt-1">Events</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <Feather name="user" size={24} color="#94a3b8" />
          <Text className="text-[10px] font-medium text-slate-400 mt-1">Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
