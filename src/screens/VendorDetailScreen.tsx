import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Dimensions, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { vendors } from '../data/dummyData';

const { width } = Dimensions.get('window');

interface VendorDetailScreenProps {
  onBack: () => void;
  vendorId: string;
}

export default function VendorDetailScreen({ onBack, vendorId }: VendorDetailScreenProps) {
  const vendor = vendors.find(v => v.id === vendorId);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!vendor) return null;

  return (
    <View className="flex-1 bg-[#fdfaff]">
      <ScrollView className="flex-1 pb-24" showsVerticalScrollIndicator={false}>
        {/* Carousel Header */}
        <View className="relative h-64 bg-slate-200">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const slide = Math.round(e.nativeEvent.contentOffset.x / Math.min(width, 400));
              setActiveImageIndex(slide);
            }}
            scrollEventThrottle={16}
          >
            {vendor.imageUrls.map((url, i) => (
              <Image
                key={i}
                source={{ uri: url }}
                style={{ width: Math.min(width, 400), height: 256 }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          {/* Floating Back Button */}
          <TouchableOpacity
            onPress={onBack}
            className="absolute top-12 left-4 bg-white/90 p-2 rounded-full shadow-md z-10"
          >
            <Feather name="arrow-left" size={24} color="#334155" />
          </TouchableOpacity>

          {/* Dots */}
          <View className="absolute bottom-4 w-full flex-row justify-center space-x-1.5">
            {vendor.imageUrls.map((_, i) => (
              <View
                key={i}
                className={`w-2 h-2 rounded-full ${i === activeImageIndex ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </View>
        </View>

        <View className="px-5 pt-6">
          {/* Identity Section */}
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1 pr-4">
              <Text className="text-2xl font-extrabold text-slate-900 leading-tight">
                {vendor.name}
              </Text>
              <View className="flex-row items-center mt-2">
                <Feather name="map-pin" size={14} color="#6a21a6" />
                <Text className="text-slate-500 text-sm font-medium ml-1">
                  Greenwich Village, New York
                </Text>
              </View>
            </View>
            <TouchableOpacity className="p-2">
              <Feather name="share-2" size={24} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Pricing Highlight Card */}
          <View className="flex-row bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6">
            <View className="flex-1 border-r border-slate-100 pr-2">
              <Text className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                {vendor.categoryId === 'venues' ? 'Pricing (approx)' : 'Starting Price'}
              </Text>
              <Text className="text-lg font-bold text-primary mt-1">
                {vendor.priceRange}
              </Text>
            </View>
            {vendor.venueFee && (
              <View className="flex-1 pl-4">
                <Text className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Venue Fee / Minimum
                </Text>
                <Text className="text-lg font-bold text-slate-900 mt-1">
                  {vendor.venueFee}
                </Text>
              </View>
            )}
          </View>

          {/* About Section */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-slate-900 mb-2">About this vendor</Text>
            <Text className="text-slate-600 leading-relaxed text-[15px]">
              {vendor.about}
            </Text>
          </View>

          {/* Key Amenities */}
          <View className="flex-row flex-wrap justify-between mb-8">
            {vendor.amenities.map((amenity, idx) => (
              <View
                key={idx}
                className="w-[48%] flex-row items-center p-3 bg-slate-50 rounded-xl mb-3"
              >
                <Feather name={amenity.icon as any} size={20} color="#475569" />
                <Text className="text-xs font-semibold text-slate-700 ml-2">
                  {amenity.text}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Footer */}
      <View className="absolute bottom-0 w-full bg-white border-t border-slate-100 p-4 pb-8 flex-row items-center justify-between z-50 shadow-lg">
        <View className="flex-1">
          <Text className="text-[10px] text-slate-500 font-bold uppercase">Starting from</Text>
          <Text className="text-xl font-extrabold text-slate-900 leading-tight text-primary">
            {vendor.priceRange.split(' - ')[0].split(' /')[0]}
            <Text className="text-sm font-normal text-slate-400">
              {vendor.priceRange.includes('/') ? ` /${vendor.priceRange.split('/')[1]}` : ''}
            </Text>
          </Text>
        </View>
        <TouchableOpacity 
          onPress={() => Alert.alert("Contact Request Sent", `${vendor.name} has received your contact request and will bring you a customized quote shortly.`)}
          className="flex-[2] bg-primary py-4 px-8 rounded-xl items-center shadow-lg active:opacity-90 active:scale-95 transition-all"
        >
          <Text className="text-white font-bold text-lg">Contact Vendor</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
