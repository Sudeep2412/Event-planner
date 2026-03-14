import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { categories, vendors } from '../data/dummyData';

interface MarketplaceScreenProps {
  onBack: () => void;
  onVendorSelect: (id: string) => void;
  occasionId: string;
  location: string;
  venueTypes: string[];
}

export default function MarketplaceScreen({ 
  onBack, 
  onVendorSelect,
  occasionId,
  location,
  venueTypes // Actually mapping to filterOptionIds
}: MarketplaceScreenProps) {
  
  const availableCategories = categories.filter(c => c.occasionIds.includes(occasionId));
  const [activeCategory, setActiveCategory] = useState<string>(availableCategories[0]?.id || '');

  // Reset category if occasion changes
  useEffect(() => {
    if (availableCategories.length > 0 && !availableCategories.find(c => c.id === activeCategory)) {
      setActiveCategory(availableCategories[0].id);
    }
  }, [occasionId]);

  // Filter logic
  const filteredVendors = vendors.filter(v => {
    const matchOccasion = v.occasionIds.includes(occasionId);
    // If user selected any filters in Screen 2, the vendor must have AT LEAST ONE matching filter (or no filters were selected)
    const matchFilters = venueTypes.length === 0 || v.filterOptionIds.some(f => venueTypes.includes(f));
    const matchLocation = location.trim() === '' || v.location.toLowerCase().includes(location.toLowerCase());
    const matchCategory = v.categoryId === activeCategory;
    
    return matchOccasion && matchFilters && matchLocation && matchCategory;
  });

  const displayLocation = location.trim() ? location : 'Downtown';
  const displayOccasion = occasionId.charAt(0).toUpperCase() + occasionId.slice(1);
  return (
    <View className="flex-1 bg-gray-50 pt-12">
      {/* Header */}
      <View className="px-4 py-4 bg-white/90 border-b border-gray-100 flex-row items-center justify-between z-10 shadow-sm">
        <TouchableOpacity onPress={onBack} className="p-2">
          <Feather name="arrow-left" size={24} color="#475569" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-800">{displayOccasion} in {displayLocation}</Text>
        <TouchableOpacity className="p-2">
          <Feather name="search" size={24} color="#475569" />
        </TouchableOpacity>
      </View>

      {/* Categories Horizontal Scroll */}
      <View className="bg-white py-4 shadow-sm z-0 border-b border-gray-100">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {availableCategories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setActiveCategory(cat.id)}
                className={`px-5 py-2.5 mr-3 rounded-full border border-transparent transition-all ${isActive ? 'bg-primary border-primary/20 shadow-sm shadow-primary/30 scale-[1.02]' : 'bg-gray-50 border-gray-200'}`}
              >
                <Text className={`text-sm font-bold tracking-wide ${isActive ? 'text-white' : 'text-gray-500'}`}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>

      {/* Main Vendor Feed */}
      <ScrollView className="flex-1 px-4 pt-4 mb-24" showsVerticalScrollIndicator={false}>
        {filteredVendors.length === 0 ? (
          <View className="flex-1 items-center justify-center pt-20">
            <Text className="text-lg text-gray-500 font-semibold">No vendors found for "{displayLocation}"</Text>
            <Text className="text-sm text-gray-400 mt-2">Try adjusting your filters.</Text>
          </View>
        ) : (
          filteredVendors.map((vendor) => (
            <TouchableOpacity
              key={vendor.id}
              activeOpacity={0.9}
              onPress={() => onVendorSelect(vendor.id)}
              className="bg-white border border-gray-100 rounded-2xl overflow-hidden mb-6 shadow-sm"
            >
            <View className="h-48 relative">
              <Image
                source={{ uri: vendor.imageUrls[0] }}
                className="w-full h-full"
                resizeMode="cover"
              />
              <View className="absolute top-3 right-3 bg-white/90 px-2 py-1 flex-row items-center rounded-lg shadow-sm">
                <Feather name="star" size={14} color="#facc15" className="mt-0.5" />
                <Text className="text-sm font-bold text-gray-800 ml-1">{vendor.rating}</Text>
              </View>
            </View>

            <View className="p-4">
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1 pr-2">
                  <Text className="text-xl font-extrabold text-gray-900 leading-tight mb-1">
                    {vendor.name}
                  </Text>
                  <Text className="text-sm font-semibold text-primary mb-1">
                    {vendor.priceRange}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <Feather name="map-pin" size={12} color="#94a3b8" />
                    <Text className="text-sm font-medium text-slate-500 ml-1">{vendor.distance} • {vendor.location}</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  onPress={() => Alert.alert("Inquiry Sent", `Your inquiry has been sent to ${vendor.name}. They will contact you shortly.`)}
                  className="bg-primary px-4 py-2.5 rounded-xl active:bg-primary-dark transition-all active:scale-95 shadow-sm shadow-primary/30"
                >
                  <Text className="text-white text-sm font-bold tracking-tight">Inquire</Text>
                </TouchableOpacity>
              </View>

              <Text className="text-sm text-gray-500 leading-relaxed mt-2" numberOfLines={2}>
                {vendor.description}
              </Text>
            </View>
          </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Bottom Floating Menu */}
      <View className="absolute bottom-0 w-full bg-white border-t border-gray-100 px-6 py-4 pb-8 flex-row justify-between items-center shadow-lg">
        <TouchableOpacity className="items-center">
          <Feather name="compass" size={24} color="#6a21a6" />
          <Text className="text-[10px] font-bold text-primary mt-1">Explore</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <Feather name="heart" size={24} color="#94a3b8" />
          <Text className="text-[10px] font-medium text-slate-400 mt-1">Saved</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center relative">
          <Feather name="message-circle" size={24} color="#94a3b8" />
          <View className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500" />
          <Text className="text-[10px] font-medium text-slate-400 mt-1">Messages</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <Feather name="user" size={24} color="#94a3b8" />
          <Text className="text-[10px] font-medium text-slate-400 mt-1">Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
