// // import React, { useState, useEffect } from 'react';
// // import { View, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
// // import { Feather } from '@expo/vector-icons';
// // import { categories, vendors } from '../data/dummyData';

// // interface MarketplaceScreenProps {
// //   onBack: () => void;
// //   onVendorSelect: (id: string) => void;
// //   occasionId: string;
// //   location: string;
// //   venueTypes: string[];
// // }

// // export default function MarketplaceScreen({ 
// //   onBack, 
// //   onVendorSelect,
// //   occasionId,
// //   location,
// //   venueTypes // Actually mapping to filterOptionIds
// // }: MarketplaceScreenProps) {
  
// //   const availableCategories = categories.filter(c => c.occasionIds.includes(occasionId));
// //   const [activeCategory, setActiveCategory] = useState<string>(availableCategories[0]?.id || '');

// //   // Reset category if occasion changes
// //   useEffect(() => {
// //     if (availableCategories.length > 0 && !availableCategories.find(c => c.id === activeCategory)) {
// //       setActiveCategory(availableCategories[0].id);
// //     }
// //   }, [occasionId]);

// //   // Filter logic
// //   const filteredVendors = vendors.filter(v => {
// //     const matchOccasion = v.occasionIds.includes(occasionId);
// //     // If user selected any filters in Screen 2, the vendor must have AT LEAST ONE matching filter (or no filters were selected)
// //     const matchFilters = venueTypes.length === 0 || v.filterOptionIds.some(f => venueTypes.includes(f));
// //     const matchLocation = location.trim() === '' || v.location.toLowerCase().includes(location.toLowerCase());
// //     const matchCategory = v.categoryId === activeCategory;
    
// //     return matchOccasion && matchFilters && matchLocation && matchCategory;
// //   });

// //   const displayLocation = location.trim() ? location : 'Downtown';
// //   const displayOccasion = occasionId.charAt(0).toUpperCase() + occasionId.slice(1);
// //   return (
// //     <View className="flex-1 bg-gray-50 pt-12">
// //       {/* Header */}
// //       <View className="px-4 py-4 bg-white/90 border-b border-gray-100 flex-row items-center justify-between z-10 shadow-sm">
// //         <TouchableOpacity onPress={onBack} className="p-2">
// //           <Feather name="arrow-left" size={24} color="#475569" />
// //         </TouchableOpacity>
// //         <Text className="text-lg font-bold text-gray-800">{displayOccasion} in {displayLocation}</Text>
// //         <TouchableOpacity className="p-2">
// //           <Feather name="search" size={24} color="#475569" />
// //         </TouchableOpacity>
// //       </View>

// //       {/* Categories Horizontal Scroll */}
// //       <View className="bg-white py-4 shadow-sm z-0 border-b border-gray-100">
// //         <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
// //           {availableCategories.map((cat) => {
// //             const isActive = activeCategory === cat.id;
// //             return (
// //               <TouchableOpacity
// //                 key={cat.id}
// //                 onPress={() => setActiveCategory(cat.id)}
// //                 className={`px-5 py-2.5 mr-3 rounded-full border border-transparent transition-all ${isActive ? 'bg-primary border-primary/20 shadow-sm shadow-primary/30 scale-[1.02]' : 'bg-gray-50 border-gray-200'}`}
// //               >
// //                 <Text className={`text-sm font-bold tracking-wide ${isActive ? 'text-white' : 'text-gray-500'}`}>
// //                   {cat.name}
// //                 </Text>
// //               </TouchableOpacity>
// //             )
// //           })}
// //         </ScrollView>
// //       </View>

// //       {/* Main Vendor Feed */}
// //       <ScrollView className="flex-1 px-4 pt-4 mb-24" showsVerticalScrollIndicator={false}>
// //         {filteredVendors.length === 0 ? (
// //           <View className="flex-1 items-center justify-center pt-20">
// //             <Text className="text-lg text-gray-500 font-semibold">No vendors found for "{displayLocation}"</Text>
// //             <Text className="text-sm text-gray-400 mt-2">Try adjusting your filters.</Text>
// //           </View>
// //         ) : (
// //           filteredVendors.map((vendor) => (
// //             <TouchableOpacity
// //               key={vendor.id}
// //               activeOpacity={0.9}
// //               onPress={() => onVendorSelect(vendor.id)}
// //               className="bg-white border border-gray-100 rounded-2xl overflow-hidden mb-6 shadow-sm"
// //             >
// //             <View className="h-48 relative">
// //               <Image
// //                 source={{ uri: vendor.imageUrls[0] }}
// //                 className="w-full h-full"
// //                 resizeMode="cover"
// //               />
// //               <View className="absolute top-3 right-3 bg-white/90 px-2 py-1 flex-row items-center rounded-lg shadow-sm">
// //                 <Feather name="star" size={14} color="#facc15" className="mt-0.5" />
// //                 <Text className="text-sm font-bold text-gray-800 ml-1">{vendor.rating}</Text>
// //               </View>
// //             </View>

// //             <View className="p-4">
// //               <View className="flex-row justify-between items-start mb-2">
// //                 <View className="flex-1 pr-2">
// //                   <Text className="text-xl font-extrabold text-gray-900 leading-tight mb-1">
// //                     {vendor.name}
// //                   </Text>
// //                   <Text className="text-sm font-semibold text-primary mb-1">
// //                     {vendor.priceRange}
// //                   </Text>
// //                   <View className="flex-row items-center mt-1">
// //                     <Feather name="map-pin" size={12} color="#94a3b8" />
// //                     <Text className="text-sm font-medium text-slate-500 ml-1">{vendor.distance} • {vendor.location}</Text>
// //                   </View>
// //                 </View>
// //                 <TouchableOpacity 
// //                   onPress={() => Alert.alert("Inquiry Sent", `Your inquiry has been sent to ${vendor.name}. They will contact you shortly.`)}
// //                   className="bg-primary px-4 py-2.5 rounded-xl active:bg-primary-dark transition-all active:scale-95 shadow-sm shadow-primary/30"
// //                 >
// //                   <Text className="text-white text-sm font-bold tracking-tight">Inquire</Text>
// //                 </TouchableOpacity>
// //               </View>

// //               <Text className="text-sm text-gray-500 leading-relaxed mt-2" numberOfLines={2}>
// //                 {vendor.description}
// //               </Text>
// //             </View>
// //           </TouchableOpacity>
// //           ))
// //         )}
// //       </ScrollView>

// //       {/* Bottom Floating Menu */}
// //       <View className="absolute bottom-0 w-full bg-white border-t border-gray-100 px-6 py-4 pb-8 flex-row justify-between items-center shadow-lg">
// //         <TouchableOpacity className="items-center">
// //           <Feather name="compass" size={24} color="#6a21a6" />
// //           <Text className="text-[10px] font-bold text-primary mt-1">Explore</Text>
// //         </TouchableOpacity>
// //         <TouchableOpacity className="items-center">
// //           <Feather name="heart" size={24} color="#94a3b8" />
// //           <Text className="text-[10px] font-medium text-slate-400 mt-1">Saved</Text>
// //         </TouchableOpacity>
// //         <TouchableOpacity className="items-center relative">
// //           <Feather name="message-circle" size={24} color="#94a3b8" />
// //           <View className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500" />
// //           <Text className="text-[10px] font-medium text-slate-400 mt-1">Messages</Text>
// //         </TouchableOpacity>
// //         <TouchableOpacity className="items-center">
// //           <Feather name="user" size={24} color="#94a3b8" />
// //           <Text className="text-[10px] font-medium text-slate-400 mt-1">Profile</Text>
// //         </TouchableOpacity>
// //       </View>
// //     </View>
// //   );
// // }


// import React, { useState, useEffect } from 'react';
// import { View, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
// import { Feather } from '@expo/vector-icons';
// import { categories, vendors } from '../data/dummyData';

// interface MarketplaceScreenProps {
//   onBack: () => void;
//   onVendorSelect: (id: string) => void;
//   occasionId: string;
//   location: string;
//   venueTypes: string[];
// }

// export default function MarketplaceScreen({ 
//   onBack, 
//   onVendorSelect,
//   occasionId,
//   location,
//   venueTypes 
// }: MarketplaceScreenProps) {
  
//   const availableCategories = categories.filter(c => c.occasionIds.includes(occasionId));
//   const [activeCategory, setActiveCategory] = useState<string>(availableCategories[0]?.id || '');
//   const [isMapView, setIsMapView] = useState(false);
//   const [savedVendors, setSavedVendors] = useState<string[]>([]);
//   const [activeQuickFilter, setActiveQuickFilter] = useState('Recommended');

//   useEffect(() => {
//     if (availableCategories.length > 0 && !availableCategories.find(c => c.id === activeCategory)) {
//       setActiveCategory(availableCategories[0].id);
//     }
//   }, [occasionId]);

//   const toggleSave = (id: string) => {
//     setSavedVendors(prev => prev.includes(id) ? prev.filter(vId => vId !== id) : [...prev, id]);
//   };

//   const filteredVendors = vendors.filter(v => {
//     const matchOccasion = v.occasionIds.includes(occasionId);
//     const matchFilters = venueTypes.length === 0 || v.filterOptionIds.some(f => venueTypes.includes(f));
//     const matchLocation = location.trim() === '' || v.location.toLowerCase().includes(location.toLowerCase());
//     const matchCategory = v.categoryId === activeCategory;
//     return matchOccasion && matchFilters && matchLocation && matchCategory;
//   });

//   const displayLocation = location.trim() ? location : 'Downtown';

//   return (
//     <View className="flex-1 bg-[#fcfaff] pt-12">
//       {/* Header with Map Toggle */}
//       <View className="px-5 py-4 bg-white/95 border-b border-slate-100 flex-row items-center justify-between z-10 shadow-sm">
//         <TouchableOpacity onPress={onBack} className="p-2 -ml-2 rounded-full bg-slate-50">
//           <Feather name="arrow-left" size={20} color="#334155" />
//         </TouchableOpacity>
//         <View className="items-center">
//           <Text className="text-lg font-extrabold text-slate-900 capitalize">{activeCategory}</Text>
//           <Text className="text-xs font-medium text-slate-500">{filteredVendors.length} found in {displayLocation}</Text>
//         </View>
//         <TouchableOpacity 
//           onPress={() => setIsMapView(!isMapView)}
//           className="p-2 -mr-2 rounded-full bg-primary/10"
//         >
//           <Feather name={isMapView ? "list" : "map"} size={20} color="#6a21a6" />
//         </TouchableOpacity>
//       </View>

//       {/* Categories Horizontal Scroll */}
//       <View className="bg-white pt-4 pb-2 z-0 border-b border-slate-100">
//         <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
//           {availableCategories.map((cat) => {
//             const isActive = activeCategory === cat.id;
//             return (
//               <TouchableOpacity
//                 key={cat.id}
//                 onPress={() => setActiveCategory(cat.id)}
//                 className={`px-5 py-2 mr-3 rounded-full border transition-all ${isActive ? 'bg-primary border-primary shadow-md shadow-primary/30' : 'bg-white border-slate-200'}`}
//               >
//                 <Text className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-600'}`}>
//                   {cat.name}
//                 </Text>
//               </TouchableOpacity>
//             )
//           })}
//         </ScrollView>
        
//         {/* Quick Filters */}
//         <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, marginTop: 12, paddingBottom: 8 }}>
//           {['Recommended', 'Top Rated', 'Nearest', 'Price: Low to High'].map((filter) => (
//             <TouchableOpacity 
//               key={filter}
//               onPress={() => setActiveQuickFilter(filter)}
//               className="flex-row items-center mr-4"
//             >
//               <Text className={`text-xs font-bold ${activeQuickFilter === filter ? 'text-primary' : 'text-slate-400'}`}>
//                 {filter}
//               </Text>
//               {activeQuickFilter === filter && <View className="w-1 h-1 bg-primary rounded-full ml-1" />}
//             </TouchableOpacity>
//           ))}
//         </ScrollView>
//       </View>

//       {/* Main Vendor Feed */}
//       <ScrollView className="flex-1 px-5 pt-5 mb-24" showsVerticalScrollIndicator={false}>
//         {filteredVendors.length === 0 ? (
//           <View className="flex-1 items-center justify-center pt-32">
//             <View className="w-20 h-20 bg-slate-100 rounded-full items-center justify-center mb-4">
//               <Feather name="search" size={32} color="#cbd5e1" />
//             </View>
//             <Text className="text-xl text-slate-800 font-extrabold text-center">No exact matches</Text>
//             <Text className="text-sm text-slate-500 mt-2 text-center px-8">Try adjusting your filters or expanding your search area to see more vendors.</Text>
//             <TouchableOpacity className="mt-6 border border-slate-200 px-6 py-3 rounded-xl bg-white">
//               <Text className="font-bold text-slate-700">Clear all filters</Text>
//             </TouchableOpacity>
//           </View>
//         ) : (
//           filteredVendors.map((vendor) => {
//             const isSaved = savedVendors.includes(vendor.id);
//             return (
//               <TouchableOpacity
//                 key={vendor.id}
//                 activeOpacity={0.9}
//                 onPress={() => onVendorSelect(vendor.id)}
//                 className="bg-white border border-slate-100 rounded-3xl overflow-hidden mb-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
//               >
//                 <View className="h-56 relative">
//                   <Image source={{ uri: vendor.imageUrls[0] }} className="w-full h-full" resizeMode="cover" />
                  
//                   {/* Badges & Actions overlay */}
//                   <View className="absolute top-4 w-full px-4 flex-row justify-between items-start">
//                     <View className="bg-white/95 px-3 py-1.5 flex-row items-center rounded-xl shadow-sm">
//                       <Feather name="star" size={14} color="#f59e0b" className="mt-0.5" />
//                       <Text className="text-sm font-black text-slate-900 ml-1.5">{vendor.rating}</Text>
//                       <Text className="text-xs font-medium text-slate-400 ml-1">(120+)</Text>
//                     </View>
//                     <TouchableOpacity 
//                       onPress={(e) => { e.stopPropagation(); toggleSave(vendor.id); }}
//                       className="w-10 h-10 bg-white/95 rounded-full items-center justify-center shadow-sm"
//                     >
//                       <Feather name="heart" size={20} color={isSaved ? "#ef4444" : "#94a3b8"} fill={isSaved ? "#ef4444" : "transparent"} />
//                     </TouchableOpacity>
//                   </View>
//                 </View>

//                 <View className="p-5">
//                   <View className="flex-row justify-between items-start mb-1">
//                     <Text className="text-xl font-black text-slate-900 flex-1 pr-2" numberOfLines={1}>{vendor.name}</Text>
//                     <Text className="text-lg font-black text-primary">{vendor.priceRange.split(' ')[0]}</Text>
//                   </View>
                  
//                   <View className="flex-row items-center mb-3">
//                     <Feather name="map-pin" size={12} color="#94a3b8" />
//                     <Text className="text-sm font-medium text-slate-500 ml-1.5">{vendor.location} • {vendor.distance}</Text>
//                   </View>

//                   <Text className="text-sm text-slate-600 leading-relaxed" numberOfLines={2}>
//                     {vendor.description}
//                   </Text>
//                 </View>
//               </TouchableOpacity>
//             );
//           })
//         )}
//       </ScrollView>

//       {/* Map View Overlay (Placeholder for future React Native Maps) */}
//       {isMapView && (
//         <View className="absolute top-44 bottom-0 left-0 right-0 bg-slate-100 items-center justify-center z-20">
//           <Feather name="map" size={48} color="#cbd5e1" />
//           <Text className="mt-4 font-bold text-slate-500">Map Integration Goes Here</Text>
//           <TouchableOpacity onPress={() => setIsMapView(false)} className="mt-6 bg-primary px-6 py-3 rounded-full shadow-lg">
//             <Text className="text-white font-bold">Return to List</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </View>
//   );
// }


// import React, { useState } from 'react';
// import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
// import { Feather, Ionicons } from '@expo/vector-icons';
// import { categories, vendors } from '../data/dummyData';

// export default function MarketplaceScreen({ occasionId, savedVendors, toggleSaveVendor, onBack, onVendorSelect }: any) {
//   const [activeCat, setActiveCat] = useState('venues');
//   const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
//   const displayVendors = vendors.filter(v => v.categoryId === activeCat && v.occasionIds.includes(occasionId));

//   return (
//     <View className="flex-1 bg-slate-50 pt-2">
//       {/* Dynamic Header */}
//       <View className="px-5 py-3 flex-row items-center justify-between bg-white z-10 shadow-sm border-b border-slate-100">
//         <TouchableOpacity onPress={onBack} className="p-2 bg-slate-50 rounded-full">
//           <Feather name="arrow-left" size={20} color="#0f172a" />
//         </TouchableOpacity>
//         <Text className="text-lg font-extrabold text-slate-900 capitalize">{occasionId} Vendors</Text>
//         <TouchableOpacity onPress={() => setViewMode(prev => prev === 'list' ? 'grid' : 'list')} className="p-2 bg-slate-50 rounded-full">
//           <Feather name={viewMode === 'list' ? "grid" : "list"} size={20} color="#0f172a" />
//         </TouchableOpacity>
//       </View>

//       {/* Category Tabs & Filters */}
//       <View className="bg-white pt-3 pb-4 border-b border-slate-100">
//         <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
//           {categories.filter(c => c.occasionIds.includes(occasionId)).map(cat => (
//             <TouchableOpacity key={cat.id} onPress={() => setActiveCat(cat.id)}
//               className={`px-5 py-2.5 rounded-2xl border ${activeCat === cat.id ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-200'}`}>
//               <Text className={`font-bold ${activeCat === cat.id ? 'text-white' : 'text-slate-600'}`}>{cat.name}</Text>
//             </TouchableOpacity>
//           ))}
//         </ScrollView>
//       </View>

//       {/* Vendor Feed */}
//       <ScrollView className="flex-1 px-5 pt-5 mb-10" showsVerticalScrollIndicator={false}>
//         <View className={viewMode === 'grid' ? "flex-row flex-wrap justify-between" : "flex-col"}>
//           {displayVendors.map(vendor => {
//             const isSaved = savedVendors.includes(vendor.id);
//             return (
//               <TouchableOpacity key={vendor.id} onPress={() => onVendorSelect(vendor.id)}
//                 className={`bg-white border border-slate-100 rounded-3xl overflow-hidden mb-6 shadow-sm ${viewMode === 'grid' ? 'w-[48%]' : 'w-full'}`}
//               >
//                 <View className={`relative ${viewMode === 'grid' ? 'h-40' : 'h-56'}`}>
//                   <Image source={{ uri: vendor.imageUrls[0] }} className="w-full h-full" resizeMode="cover" />
//                   <TouchableOpacity onPress={() => toggleSaveVendor(vendor.id)} className="absolute top-3 right-3 w-9 h-9 bg-white/90 rounded-full items-center justify-center shadow-sm">
//                     <Ionicons name={isSaved ? "heart" : "heart-outline"} size={20} color={isSaved ? "#ef4444" : "#64748b"} />
//                   </TouchableOpacity>
//                   <View className="absolute bottom-3 left-3 bg-white/95 px-2 py-1 rounded-lg flex-row items-center shadow-sm">
//                     <Ionicons name="star" size={12} color="#f59e0b" />
//                     <Text className="text-xs font-black text-slate-900 ml-1">{vendor.rating}</Text>
//                   </View>
//                 </View>
//                 <View className="p-4">
//                   <View className={`flex-row justify-between items-start mb-2 ${viewMode === 'grid' ? 'flex-col' : ''}`}>
//                     <Text className="text-lg font-black text-slate-900 flex-1 pr-2 leading-tight" numberOfLines={1}>{vendor.name}</Text>
//                     <Text className={`text-primary font-black ${viewMode === 'grid' ? 'mt-1 text-sm' : 'text-base'}`}>{vendor.priceRange.split(' ')[0]}</Text>
//                   </View>
//                   <View className="flex-row items-center">
//                     <Feather name="map-pin" size={12} color="#94a3b8" />
//                     <Text className="text-xs font-medium text-slate-500 ml-1" numberOfLines={1}>{vendor.location}</Text>
//                   </View>
//                 </View>
//               </TouchableOpacity>
//             )
//           })}
//         </View>
//       </ScrollView>
//     </View>
//   );
// }


import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { categories, vendors } from '../data/dummyData';

export default function MarketplaceScreen({ 
  occasionId, 
  location, // ADDED
  venueTypes, // ADDED
  savedVendors = [], // ADDED default fallback
  toggleSaveVendor, 
  onBack, 
  onVendorSelect 
}: any) {
  const [activeCat, setActiveCat] = useState('venues');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  // FIXED FILTERING LOGIC
  const displayVendors = vendors.filter(v => {
    const matchCategory = v.categoryId === activeCat;
    const matchOccasion = v.occasionIds.includes(occasionId);
    
    // Check location if user typed one in
    const matchLocation = !location || v.location.toLowerCase().includes(location.toLowerCase());
    
    // Check venueTypes from the Filter Screen
    const matchFilters = !venueTypes || venueTypes.length === 0 || v.filterOptionIds.some((f: string) => venueTypes.includes(f));

    return matchCategory && matchOccasion && matchLocation && matchFilters;
  });

  return (
    <View className="flex-1 bg-slate-50 pt-2">
      {/* Dynamic Header */}
      <View className="px-5 py-3 flex-row items-center justify-between bg-white z-10 shadow-sm border-b border-slate-100">
        <TouchableOpacity onPress={onBack} className="p-2 bg-slate-50 rounded-full">
          <Feather name="arrow-left" size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text className="text-lg font-extrabold text-slate-900 capitalize">{occasionId} Vendors</Text>
        <TouchableOpacity onPress={() => setViewMode(prev => prev === 'list' ? 'grid' : 'list')} className="p-2 bg-slate-50 rounded-full">
          <Feather name={viewMode === 'list' ? "grid" : "list"} size={20} color="#0f172a" />
        </TouchableOpacity>
      </View>

      {/* Category Tabs & Filters */}
      <View className="bg-white pt-3 pb-4 border-b border-slate-100">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
          {categories.filter(c => c.occasionIds.includes(occasionId)).map(cat => (
            <TouchableOpacity key={cat.id} onPress={() => setActiveCat(cat.id)}
              className={`px-5 py-2.5 rounded-2xl border ${activeCat === cat.id ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-200'}`}>
              <Text className={`font-bold ${activeCat === cat.id ? 'text-white' : 'text-slate-600'}`}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Vendor Feed */}
      <ScrollView className="flex-1 px-5 pt-5 mb-10" showsVerticalScrollIndicator={false}>
        {displayVendors.length === 0 ? (
           <View className="flex-1 items-center justify-center pt-20">
             <Text className="text-slate-500 font-bold">No vendors match these exact filters.</Text>
           </View>
        ) : (
          <View className={viewMode === 'grid' ? "flex-row flex-wrap justify-between" : "flex-col"}>
            {displayVendors.map(vendor => {
              const isSaved = savedVendors.includes(vendor.id);
              return (
                <TouchableOpacity key={vendor.id} onPress={() => onVendorSelect(vendor.id)}
                  className={`bg-white border border-slate-100 rounded-3xl overflow-hidden mb-6 shadow-sm ${viewMode === 'grid' ? 'w-[48%]' : 'w-full'}`}
                >
                  <View className={`relative ${viewMode === 'grid' ? 'h-40' : 'h-56'}`}>
                    <Image source={{ uri: vendor.imageUrls[0] }} className="w-full h-full" resizeMode="cover" />
                    <TouchableOpacity onPress={() => toggleSaveVendor(vendor.id)} className="absolute top-3 right-3 w-9 h-9 bg-white/90 rounded-full items-center justify-center shadow-sm">
                      <Ionicons name={isSaved ? "heart" : "heart-outline"} size={20} color={isSaved ? "#ef4444" : "#64748b"} />
                    </TouchableOpacity>
                    <View className="absolute bottom-3 left-3 bg-white/95 px-2 py-1 rounded-lg flex-row items-center shadow-sm">
                      <Ionicons name="star" size={12} color="#f59e0b" />
                      <Text className="text-xs font-black text-slate-900 ml-1">{vendor.rating}</Text>
                    </View>
                  </View>
                  <View className="p-4">
                    <View className={`flex-row justify-between items-start mb-2 ${viewMode === 'grid' ? 'flex-col' : ''}`}>
                      <Text className="text-lg font-black text-slate-900 flex-1 pr-2 leading-tight" numberOfLines={1}>{vendor.name}</Text>
                      <Text className={`text-primary font-black ${viewMode === 'grid' ? 'mt-1 text-sm' : 'text-base'}`}>{vendor.priceRange.split(' ')[0]}</Text>
                    </View>
                    <View className="flex-row items-center">
                      <Feather name="map-pin" size={12} color="#94a3b8" />
                      <Text className="text-xs font-medium text-slate-500 ml-1" numberOfLines={1}>{vendor.location}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}