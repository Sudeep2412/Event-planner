import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { filterOptions } from '../data/dummyData';

interface FilterScreenProps {
  onBack: () => void;
  onShowVendors: (selectedTypes: string[]) => void;
  occasionId: string;
}

export default function FilterScreen({ onBack, onShowVendors, occasionId }: FilterScreenProps) {
  const availableFilters = filterOptions.filter(f => f.occasionIds.includes(occasionId));
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const toggleVenueType = (id: string) => {
    setSelectedTypes(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleShowVendors = () => {
    onShowVendors(selectedTypes);
  };

  const occasionTitle = occasionId.charAt(0).toUpperCase() + occasionId.slice(1);

  return (
    <View className="flex-1 bg-[#fcfaff] pt-12">
      {/* Header */}
      <View className="px-4 py-4 border-b border-gray-100 flex-row items-center bg-white z-10">
        <TouchableOpacity onPress={onBack} className="p-2 mr-2">
          <Feather name="arrow-left" size={24} color="#334155" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">{occasionTitle} Details</Text>
      </View>

      <ScrollView className="flex-1 px-5 pt-8" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Question */}
        <View className="mb-8 mt-2">
          <Text className="text-3xl font-extrabold leading-tight text-gray-900 tracking-tight">
            What are you looking for?
          </Text>
          <Text className="text-base text-gray-500 mt-2">
            Select one or more options to discover tailored vendors for your {occasionTitle.toLowerCase()}.
          </Text>
        </View>

        {/* Options */}
        <View className="flex-col pb-10">
          {availableFilters.length === 0 && (
            <Text className="text-gray-500 italic">No specific filters for this occasion. Skip to see all vendors!</Text>
          )}
          {availableFilters.map((opt) => {
            const isActive = selectedTypes.includes(opt.id);
            return (
              <TouchableOpacity
                key={opt.id}
                activeOpacity={0.8}
                onPress={() => toggleVenueType(opt.id)}
                className={`p-5 mb-4 flex-row items-center justify-between rounded-2xl border-2 bg-white shadow-sm ` + (isActive ? 'border-primary bg-primary/5' : 'border-gray-100')}
              >
                <View className="flex-row items-center">
                  <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 shadow-sm ` + (isActive ? 'bg-primary' : 'bg-purple-50')}>
                    <Feather name={opt.icon as any} size={22} color={isActive ? "white" : "#6a21a6"} />
                  </View>
                  <Text className={`font-semibold text-lg ` + (isActive ? 'text-primary' : 'text-gray-800')}>
                    {opt.name}
                  </Text>
                </View>

                {/* Checkbox Representation */}
                <View className={`w-6 h-6 rounded-md border-2 items-center justify-center ` + (isActive ? 'border-primary bg-primary' : 'border-gray-300')}>
                  {isActive && <Feather name="check" size={16} color="white" />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer Nav */}
      <View className="absolute bottom-0 w-full p-5 bg-white border-t border-gray-100 pb-8 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleShowVendors}
          className="w-full bg-primary py-4 rounded-xl items-center shadow-lg"
        >
          <Text className="text-white font-bold text-lg">Show Vendors</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
