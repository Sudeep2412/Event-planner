// // import React, { useState } from 'react';
// // import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
// // import { Feather } from '@expo/vector-icons';
// // import { occasions } from '../data/dummyData';

// // interface HomeScreenProps {
// //   onSelectOccasion: (id: string, location: string) => void;
// // }

// // export default function HomeScreen({ onSelectOccasion }: HomeScreenProps) {
// //   const [location, setLocation] = useState('');
// //   return (
// //     <View className="flex-1 bg-[#fcfaff]">
// //       {/* Header */}
// //       <View className="bg-white/80 p-4 border-b border-slate-100 mt-12 flex-row items-center">
// //         <View className="relative w-full">
// //           <View className="absolute z-10 left-3 top-3">
// //             <Feather name="map-pin" size={18} color="#6a21a6" />
// //           </View>
// //           <TextInput
// //             className="w-full bg-slate-100 rounded-xl pl-10 pr-4 py-3 text-slate-800 text-sm font-medium"
// //             placeholder="Where is the event? (e.g., Downtown)"
// //             placeholderTextColor="#64748b"
// //             value={location}
// //             onChangeText={setLocation}
// //           />
// //         </View>
// //       </View>

// //       <ScrollView className="flex-1 px-5 pt-8 pb-32">
// //         {/* Hero Section */}
// //         <View className="mb-10">
// //           <Text className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
// //             Let's plan your{'\n'}<Text className="text-primary">perfect</Text> event
// //           </Text>
// //           <Text className="mt-3 text-slate-500 text-base font-medium">
// //             Select an occasion to get started with your journey and discover curated vendors.
// //           </Text>
// //         </View>

// //         {/* Occasion Selection */}
// //         <View>
// //           <Text className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
// //             Choose Occasion
// //           </Text>
// //           <View className="flex-col">
// //             {occasions.map((item) => (
// //               <TouchableOpacity
// //                 key={item.id}
// //                 activeOpacity={0.8}
// //                 onPress={() => onSelectOccasion(item.id, location)}
// //                 className="w-full bg-white p-5 rounded-2xl mb-4 flex-row items-center border border-slate-100 shadow-sm active:scale-[0.98] transition-all"
// //               >
// //                 <View className="w-14 h-14 bg-primary/10 rounded-full items-center justify-center mr-4">
// //                   <Feather name={item.icon as any} size={24} color="#6a21a6" />
// //                 </View>
// //                 <View className="flex-1">
// //                   <Text className="font-extrabold text-slate-900 text-lg">{item.name}</Text>
// //                   <Text className="text-slate-500 text-xs mt-0.5">{item.description}</Text>
// //                 </View>
// //                 <Feather name="chevron-right" size={20} color="#cbd5e1" />
// //               </TouchableOpacity>
// //             ))}
// //           </View>
// //         </View>

// //         {/* Quick Tip */}
// //         <View className="mt-4 p-4 bg-purple-50 rounded-2xl border border-purple-100 flex-row">
// //           <Feather name="info" size={20} color="#6a21a6" className="mt-1" />
// //           <View className="ml-3 flex-1">
// //             <Text className="font-bold text-primary text-sm">Need Help?</Text>
// //             <Text className="text-xs text-slate-600 mt-1">
// //               Our expert planners are available 24/7 to help you curate your special day.
// //             </Text>
// //           </View>
// //         </View>
// //       </ScrollView>

// //       {/* Bottom Nav */}
// //       <View className="absolute bottom-0 w-full bg-white border-t border-slate-100 px-6 py-4 pb-8 flex-row justify-between items-center shadow-lg">
// //         <TouchableOpacity className="items-center">
// //           <Feather name="home" size={24} color="#6a21a6" />
// //           <Text className="text-[10px] font-bold text-primary mt-1">Home</Text>
// //         </TouchableOpacity>
// //         <TouchableOpacity className="items-center">
// //           <Feather name="calendar" size={24} color="#94a3b8" />
// //           <Text className="text-[10px] font-medium text-slate-400 mt-1">Events</Text>
// //         </TouchableOpacity>
// //         <TouchableOpacity className="items-center">
// //           <Feather name="user" size={24} color="#94a3b8" />
// //           <Text className="text-[10px] font-medium text-slate-400 mt-1">Profile</Text>
// //         </TouchableOpacity>
// //       </View>
// //     </View>
// //   );
// // }



// // import React, { useState } from 'react';
// // import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
// // import { Feather } from '@expo/vector-icons';
// // import { occasions, vendors } from '../data/dummyData'; // Assuming vendors is exported

// // const { width } = Dimensions.get('window');

// // interface HomeScreenProps {
// //   onSelectOccasion: (id: string, location: string) => void;
// //   onVendorSelect?: (id: string) => void; // Added for the trending section
// // }

// // export default function HomeScreen({ onSelectOccasion, onVendorSelect }: HomeScreenProps) {
// //   const [location, setLocation] = useState('');
  
// //   // Grab top 3 rated vendors for the dashboard preview
// //   const trendingVendors = vendors.sort((a, b) => b.rating - a.rating).slice(0, 3);

// //   return (
// //     <View className="flex-1 bg-[#f8f9fa]">
// //       <ScrollView className="flex-1 pb-24" showsVerticalScrollIndicator={false}>
        
// //         {/* Top Header - Personalized Dashboard Feel */}
// //         <View className="px-6 pt-16 pb-4 flex-row justify-between items-center bg-white rounded-b-3xl shadow-sm z-10">
// //           <View>
// //             <Text className="text-sm font-bold text-slate-400 uppercase tracking-wider">Good Morning</Text>
// //             <Text className="text-2xl font-black text-slate-900 tracking-tight">Alex planner</Text>
// //           </View>
// //           <TouchableOpacity className="relative">
// //             <Image 
// //               source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop' }} 
// //               className="w-12 h-12 rounded-full border-2 border-primary"
// //             />
// //             <View className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
// //           </TouchableOpacity>
// //         </View>

// //         {/* Search Bar */}
// //         <View className="px-6 mt-6">
// //           <View className="flex-row items-center bg-white rounded-2xl px-4 py-3 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-slate-100">
// //             <Feather name="search" size={20} color="#94a3b8" />
// //             <TextInput
// //               className="flex-1 ml-3 text-slate-800 text-base font-medium"
// //               placeholder="Search venues, decorators, DJs..."
// //               placeholderTextColor="#94a3b8"
// //             />
// //             <View className="w-[1px] h-6 bg-slate-200 mx-3" />
// //             <Feather name="map-pin" size={18} color="#6a21a6" />
// //             <TextInput
// //               className="w-24 ml-2 text-slate-800 text-sm font-medium"
// //               placeholder="Location"
// //               placeholderTextColor="#94a3b8"
// //               value={location}
// //               onChangeText={setLocation}
// //             />
// //           </View>
// //         </View>

// //         {/* Active Project Widget (Dashboard Feature) */}
// //         <View className="px-6 mt-8">
// //           <View className="bg-primary rounded-3xl p-5 shadow-lg shadow-primary/30 overflow-hidden relative">
// //             {/* Background design element */}
// //             <View className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full" />
// //             <View className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full" />
            
// //             <View className="flex-row justify-between items-center mb-4">
// //               <View className="bg-white/20 px-3 py-1 rounded-full">
// //                 <Text className="text-white text-xs font-bold">In Progress</Text>
// //               </View>
// //               <Feather name="more-horizontal" size={20} color="white" />
// //             </View>
// //             <Text className="text-white text-2xl font-black mb-1">Mom's 50th Birthday</Text>
// //             <Text className="text-white/80 text-sm font-medium mb-4">Oct 24 • Downtown Villa</Text>
            
// //             <View className="flex-row items-center justify-between">
// //               <View className="flex-row -space-x-2">
// //                 <View className="w-8 h-8 rounded-full bg-indigo-400 border-2 border-primary items-center justify-center"><Feather name="check" size={12} color="white" /></View>
// //                 <View className="w-8 h-8 rounded-full bg-pink-400 border-2 border-primary items-center justify-center"><Feather name="music" size={12} color="white" /></View>
// //                 <View className="w-8 h-8 rounded-full bg-white/20 border-2 border-primary items-center justify-center"><Feather name="plus" size={12} color="white" /></View>
// //               </View>
// //               <TouchableOpacity className="bg-white px-4 py-2 rounded-xl">
// //                 <Text className="text-primary font-bold text-sm">Resume Planning</Text>
// //               </TouchableOpacity>
// //             </View>
// //           </View>
// //         </View>

// //         {/* Start a New Event (Categories) */}
// //         <View className="mt-8">
// //           <View className="px-6 flex-row justify-between items-end mb-4">
// //             <Text className="text-xl font-extrabold text-slate-900">Plan a New Event</Text>
// //             <TouchableOpacity><Text className="text-primary font-bold text-sm">See All</Text></TouchableOpacity>
// //           </View>
          
// //           <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
// //             {occasions.map((item) => (
// //               <TouchableOpacity
// //                 key={item.id}
// //                 activeOpacity={0.8}
// //                 onPress={() => onSelectOccasion(item.id, location)}
// //                 className="w-32 bg-white p-4 rounded-2xl mr-4 items-center border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
// //               >
// //                 <View className="w-14 h-14 bg-purple-50 rounded-full items-center justify-center mb-3">
// //                   <Feather name={item.icon as any} size={24} color="#6a21a6" />
// //                 </View>
// //                 <Text className="font-extrabold text-slate-800 text-center">{item.name}</Text>
// //               </TouchableOpacity>
// //             ))}
// //           </ScrollView>
// //         </View>

// //         {/* Trending Vendors */}
// //         <View className="mt-8 mb-6">
// //           <View className="px-6 flex-row justify-between items-end mb-4">
// //             <Text className="text-xl font-extrabold text-slate-900">Trending Nearby</Text>
// //           </View>
          
// //           <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
// //             {trendingVendors.map((vendor) => (
// //               <TouchableOpacity
// //                 key={vendor.id}
// //                 activeOpacity={0.9}
// //                 onPress={() => onVendorSelect && onVendorSelect(vendor.id)}
// //                 className="w-64 bg-white rounded-2xl mr-4 overflow-hidden border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
// //               >
// //                 <Image source={{ uri: vendor.imageUrls[0] }} className="w-full h-32" resizeMode="cover" />
// //                 <View className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-lg flex-row items-center">
// //                   <Feather name="star" size={12} color="#facc15" />
// //                   <Text className="text-xs font-bold text-slate-800 ml-1">{vendor.rating}</Text>
// //                 </View>
// //                 <View className="p-4">
// //                   <Text className="font-extrabold text-slate-900 text-lg mb-1" numberOfLines={1}>{vendor.name}</Text>
// //                   <Text className="text-primary font-bold text-sm mb-2">{vendor.priceRange}</Text>
// //                   <View className="flex-row items-center">
// //                     <Feather name="map-pin" size={12} color="#94a3b8" />
// //                     <Text className="text-xs font-medium text-slate-500 ml-1">{vendor.location}</Text>
// //                   </View>
// //                 </View>
// //               </TouchableOpacity>
// //             ))}
// //           </ScrollView>
// //         </View>

// //       </ScrollView>

// //       {/* Upgraded Bottom Nav */}
// //       <View className="absolute bottom-0 w-full bg-white/95 border-t border-slate-100 px-8 py-4 pb-8 flex-row justify-between items-center shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
// //         <TouchableOpacity className="items-center">
// //           <Feather name="grid" size={24} color="#6a21a6" />
// //           <Text className="text-[10px] font-bold text-primary mt-1">Dashboard</Text>
// //         </TouchableOpacity>
// //         <TouchableOpacity className="items-center">
// //           <Feather name="search" size={24} color="#94a3b8" />
// //           <Text className="text-[10px] font-medium text-slate-400 mt-1">Explore</Text>
// //         </TouchableOpacity>
// //         {/* Floating Action Button Style for Center Item */}
// //         <TouchableOpacity className="items-center justify-center w-14 h-14 bg-primary rounded-full shadow-lg shadow-primary/40 -mt-8 border-4 border-[#f8f9fa]">
// //           <Feather name="plus" size={28} color="white" />
// //         </TouchableOpacity>
// //         <TouchableOpacity className="items-center relative">
// //           <Feather name="message-circle" size={24} color="#94a3b8" />
// //           <View className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
// //           <Text className="text-[10px] font-medium text-slate-400 mt-1">Inbox</Text>
// //         </TouchableOpacity>
// //         <TouchableOpacity className="items-center">
// //           <Feather name="user" size={24} color="#94a3b8" />
// //           <Text className="text-[10px] font-medium text-slate-400 mt-1">Profile</Text>
// //         </TouchableOpacity>
// //       </View>
// //     </View>
// //   );
// // }


// import React, { useState } from 'react';
// import { View, Text, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
// import { Feather, Ionicons } from '@expo/vector-icons';
// import { occasions, vendors } from '../data/dummyData';

// export default function HomeScreen({ onSelectOccasion, onVendorSelect }: any) {
//   const [searchQuery, setSearchQuery] = useState('');
//   const topVendors = vendors.filter(v => v.rating >= 4.8).slice(0, 4);

//   return (
//     <View className="flex-1 bg-white">
//       <ScrollView showsVerticalScrollIndicator={false} className="pt-6 pb-24">
        
//         {/* Header: Personalized Greeting */}
//         <View className="px-6 flex-row justify-between items-center mb-6">
//           <View>
//             <Text className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-1">Welcome back</Text>
//             <Text className="text-3xl font-black text-slate-900 tracking-tight">Alex's Planner</Text>
//           </View>
//           <TouchableOpacity className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20">
//             <Image source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop' }} className="w-full h-full" />
//           </TouchableOpacity>
//         </View>

//         {/* The "Command Center" Widget */}
//         <View className="px-6 mb-8">
//           <View className="bg-slate-900 rounded-3xl p-6 shadow-xl shadow-slate-900/20 overflow-hidden relative">
//             <View className="absolute -right-12 -top-12 w-40 h-40 bg-primary/20 rounded-full blur-2xl" />
            
//             <View className="flex-row justify-between items-end mb-6">
//               <View>
//                 <Text className="text-white/60 font-bold text-xs uppercase tracking-widest mb-1">Next Event</Text>
//                 <Text className="text-white text-2xl font-black">Summer Wedding</Text>
//                 <Text className="text-primary-light text-sm font-medium mt-1">120 Guests • Malibu, CA</Text>
//               </View>
//               <View className="items-center bg-white/10 px-4 py-2 rounded-2xl border border-white/10">
//                 <Text className="text-white text-xl font-black">45</Text>
//                 <Text className="text-white/60 text-[10px] uppercase font-bold">Days</Text>
//               </View>
//             </View>

//             {/* Budget Micro-Tracker */}
//             <View className="bg-white/5 rounded-2xl p-4 border border-white/10 flex-row items-center justify-between">
//               <View className="flex-row items-center space-x-3">
//                 <View className="w-10 h-10 rounded-full bg-emerald-500/20 items-center justify-center">
//                   <Feather name="pie-chart" size={18} color="#34d399" />
//                 </View>
//                 <View>
//                   <Text className="text-white/60 text-xs font-bold">Budget</Text>
//                   <Text className="text-white font-bold">$12k / $25k Spent</Text>
//                 </View>
//               </View>
//               <TouchableOpacity className="bg-primary px-4 py-2 rounded-xl"><Text className="text-white text-xs font-bold">Manage</Text></TouchableOpacity>
//             </View>
//           </View>
//         </View>

//         {/* Search Bar */}
//         <View className="px-6 mb-8">
//           <View className="flex-row items-center bg-slate-50 rounded-2xl px-4 py-3.5 border border-slate-200">
//             <Feather name="search" size={20} color="#94a3b8" />
//             <TextInput
//               placeholder="Search vendors, venues, ideas..."
//               placeholderTextColor="#94a3b8"
//               value={searchQuery}
//               onChangeText={setSearchQuery}
//               className="flex-1 ml-3 text-slate-900 font-medium text-base"
//             />
//           </View>
//         </View>

//         {/* Occasions Horizontal Scroll */}
//         <View className="mb-8">
//           <Text className="px-6 text-xl font-extrabold text-slate-900 mb-4">What are we planning?</Text>
//           <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}>
//             {occasions.map(occ => (
//               <TouchableOpacity key={occ.id} onPress={() => onSelectOccasion(occ.id)} className="items-center">
//                 <View className="w-16 h-16 rounded-full bg-primary/5 items-center justify-center mb-2 border border-primary/10">
//                   <Feather name={occ.icon as any} size={24} color="#6a21a6" />
//                 </View>
//                 <Text className="text-slate-700 font-bold text-xs">{occ.name}</Text>
//               </TouchableOpacity>
//             ))}
//           </ScrollView>
//         </View>

//         {/* Highest Rated Row */}
//         <View className="mb-6">
//           <View className="px-6 flex-row justify-between items-center mb-4">
//             <Text className="text-xl font-extrabold text-slate-900">Highest Rated</Text>
//             <TouchableOpacity><Text className="text-primary font-bold text-sm">View All</Text></TouchableOpacity>
//           </View>
//           <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}>
//             {topVendors.map(vendor => (
//               <TouchableOpacity key={vendor.id} onPress={() => onVendorSelect(vendor.id)} className="w-60 bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
//                 <Image source={{ uri: vendor.imageUrls[0] }} className="w-full h-36" resizeMode="cover" />
//                 <View className="absolute top-3 left-3 bg-white/95 px-2 py-1 rounded-lg flex-row items-center">
//                   <Ionicons name="star" size={12} color="#f59e0b" />
//                   <Text className="text-xs font-black text-slate-900 ml-1">{vendor.rating}</Text>
//                 </View>
//                 <View className="p-4">
//                   <Text className="font-extrabold text-slate-900 text-lg mb-1" numberOfLines={1}>{vendor.name}</Text>
//                   <Text className="text-primary font-black text-sm">{vendor.priceRange.split(' ')[0]}</Text>
//                 </View>
//               </TouchableOpacity>
//             ))}
//           </ScrollView>
//         </View>
//       </ScrollView>
//     </View>
//   );
// }


// import React, { useState } from 'react';
// import { View, Text, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
// import { Feather, Ionicons } from '@expo/vector-icons';
// import { occasions, vendors } from '../data/dummyData';

// export default function HomeScreen({ onSelectOccasion, onVendorSelect }: any) {
//   const [searchQuery, setSearchQuery] = useState('');
//   const topVendors = vendors.filter(v => v.rating >= 4.8).slice(0, 4);

//   return (
//     <View className="flex-1 bg-white">
//       <ScrollView showsVerticalScrollIndicator={false} className="pt-6 pb-24">
        
//         {/* Header: Personalized Greeting */}
//         <View className="px-6 flex-row justify-between items-center mb-6">
//           <View>
//             <Text className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-1">Welcome back</Text>
//             <Text className="text-3xl font-black text-slate-900 tracking-tight">Alex's Planner</Text>
//           </View>
//           <TouchableOpacity className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20">
//             <Image source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop' }} className="w-full h-full" />
//           </TouchableOpacity>
//         </View>

//         {/* The "Command Center" Widget */}
//         <View className="px-6 mb-8">
//           <View className="bg-slate-900 rounded-3xl p-6 shadow-xl shadow-slate-900/20 overflow-hidden relative">
//             <View className="absolute -right-12 -top-12 w-40 h-40 bg-primary/20 rounded-full blur-2xl" />
            
//             <View className="flex-row justify-between items-end mb-6">
//               <View>
//                 <Text className="text-white/60 font-bold text-xs uppercase tracking-widest mb-1">Next Event</Text>
//                 <Text className="text-white text-2xl font-black">Summer Wedding</Text>
//                 <Text className="text-primary-light text-sm font-medium mt-1">120 Guests • Malibu, CA</Text>
//               </View>
//               <View className="items-center bg-white/10 px-4 py-2 rounded-2xl border border-white/10">
//                 <Text className="text-white text-xl font-black">45</Text>
//                 <Text className="text-white/60 text-[10px] uppercase font-bold">Days</Text>
//               </View>
//             </View>

//             {/* Budget Micro-Tracker */}
//             <View className="bg-white/5 rounded-2xl p-4 border border-white/10 flex-row items-center justify-between">
//               <View className="flex-row items-center space-x-3">
//                 <View className="w-10 h-10 rounded-full bg-emerald-500/20 items-center justify-center">
//                   <Feather name="pie-chart" size={18} color="#34d399" />
//                 </View>
//                 <View>
//                   <Text className="text-white/60 text-xs font-bold">Budget</Text>
//                   <Text className="text-white font-bold">$12k / $25k Spent</Text>
//                 </View>
//               </View>
//               <TouchableOpacity className="bg-primary px-4 py-2 rounded-xl"><Text className="text-white text-xs font-bold">Manage</Text></TouchableOpacity>
//             </View>
//           </View>
//         </View>

//         {/* Search Bar */}
//         <View className="px-6 mb-8">
//           <View className="flex-row items-center bg-slate-50 rounded-2xl px-4 py-3.5 border border-slate-200">
//             <Feather name="search" size={20} color="#94a3b8" />
//             <TextInput
//               placeholder="Search Location or Vendor..."
//               placeholderTextColor="#94a3b8"
//               value={searchQuery}
//               onChangeText={setSearchQuery}
//               className="flex-1 ml-3 text-slate-900 font-medium text-base"
//             />
//           </View>
//         </View>

//         {/* Occasions Horizontal Scroll */}
//         <View className="mb-8">
//           <Text className="px-6 text-xl font-extrabold text-slate-900 mb-4">What are we planning?</Text>
//           <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}>
//             {occasions.map(occ => (
//               <TouchableOpacity 
//                 key={occ.id} 
//                 // FIXED: Pass the search query as the location!
//                 onPress={() => onSelectOccasion(occ.id, searchQuery)} 
//                 className="items-center"
//               >
//                 <View className="w-16 h-16 rounded-full bg-primary/5 items-center justify-center mb-2 border border-primary/10">
//                   <Feather name={occ.icon as any} size={24} color="#6a21a6" />
//                 </View>
//                 <Text className="text-slate-700 font-bold text-xs">{occ.name}</Text>
//               </TouchableOpacity>
//             ))}
//           </ScrollView>
//         </View>

//         {/* Highest Rated Row */}
//         <View className="mb-6">
//           <View className="px-6 flex-row justify-between items-center mb-4">
//             <Text className="text-xl font-extrabold text-slate-900">Highest Rated</Text>
//             <TouchableOpacity><Text className="text-primary font-bold text-sm">View All</Text></TouchableOpacity>
//           </View>
//           <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}>
//             {topVendors.map(vendor => (
//               <TouchableOpacity 
//                 key={vendor.id} 
//                 // FIXED: Call the prop correctly to navigate to detail
//                 onPress={() => onVendorSelect(vendor.id)} 
//                 className="w-60 bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm"
//               >
//                 <Image source={{ uri: vendor.imageUrls[0] }} className="w-full h-36" resizeMode="cover" />
//                 <View className="absolute top-3 left-3 bg-white/95 px-2 py-1 rounded-lg flex-row items-center">
//                   <Ionicons name="star" size={12} color="#f59e0b" />
//                   <Text className="text-xs font-black text-slate-900 ml-1">{vendor.rating}</Text>
//                 </View>
//                 <View className="p-4">
//                   <Text className="font-extrabold text-slate-900 text-lg mb-1" numberOfLines={1}>{vendor.name}</Text>
//                   <Text className="text-primary font-black text-sm">{vendor.priceRange.split(' ')[0]}</Text>
//                 </View>
//               </TouchableOpacity>
//             ))}
//           </ScrollView>
//         </View>
//       </ScrollView>
//     </View>
//   );
// }


import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Animated, Easing } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { occasions, vendors } from '../data/dummyData';

export default function HomeScreen({ onSelectOccasion, onVendorSelect }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Animation Values
  const scrollY = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Dynamic Greeting Logic
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // Trigger budget animation on mount
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: 0.48, // Representing 48% budget spent ($12k / $25k)
      duration: 1500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, []);

  // Split vendors for Masonry Layout
  const topVendors = vendors.filter(v => v.rating >= 4.7).slice(0, 4);
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
        <Text className="text-lg font-black text-slate-900">Alex's Planner</Text>
        <TouchableOpacity className="w-8 h-8 rounded-full overflow-hidden">
          <Image source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop' }} className="w-full h-full" />
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
            <Text className="text-3xl font-black text-slate-900 tracking-tight">Alex's Planner</Text>
          </View>
          <TouchableOpacity className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary/10 shadow-sm">
            <Image source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop' }} className="w-full h-full" />
          </TouchableOpacity>
        </View>

        {/* The "Command Center" Widget */}
        <View className="px-6 mb-8">
          <View className="bg-slate-900 rounded-[32px] p-6 shadow-xl shadow-slate-900/30 overflow-hidden relative">
            {/* Ambient Lighting Background Effects */}
            <View className="absolute -right-20 -top-20 w-64 h-64 bg-primary/30 rounded-full blur-3xl opacity-50" />
            <View className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl opacity-50" />
            
            <View className="flex-row justify-between items-start mb-8">
              <View>
                <View className="bg-white/10 self-start px-2.5 py-1 rounded-md mb-3 border border-white/5">
                  <Text className="text-white/80 font-bold text-[10px] uppercase tracking-widest">Next Event</Text>
                </View>
                <Text className="text-white text-3xl font-black leading-tight">Summer{'\n'}Wedding</Text>
                <Text className="text-primary-light text-sm font-medium mt-2">120 Guests • Malibu, CA</Text>
              </View>
              <View className="items-center bg-white/10 px-4 py-3 rounded-2xl border border-white/10 shadow-inner">
                <Text className="text-white text-2xl font-black">45</Text>
                <Text className="text-white/60 text-[10px] uppercase font-bold tracking-wider">Days</Text>
              </View>
            </View>

            {/* Animated Budget Tracker */}
            <View className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <View className="flex-row items-end justify-between mb-3">
                <Text className="text-white/80 text-xs font-bold uppercase tracking-wider">Budget Spent</Text>
                <Text className="text-white font-black text-sm">$12k <Text className="text-white/40 text-xs font-medium">/ $25k</Text></Text>
              </View>
              {/* Progress Bar Track */}
              <View className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                {/* Progress Bar Fill (Animated) */}
                <Animated.View 
                  style={{
                    height: '100%',
                    backgroundColor: '#34d399',
                    borderRadius: 999,
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%']
                    })
                  }} 
                />
              </View>
            </View>
          </View>
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
          <TouchableOpacity className="self-start mt-3 ml-1 flex-row items-center bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
            <Feather name="clock" size={12} color="#4f46e5" />
            <Text className="text-indigo-700 text-xs font-bold ml-1.5">Continue looking for DJs</Text>
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
            <TouchableOpacity><Text className="text-primary font-bold text-sm">Explore Board</Text></TouchableOpacity>
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
                  <Image source={{ uri: vendor.imageUrls[0] }} className="w-full h-full absolute" resizeMode="cover" />
                  <View className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  <View className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg flex-row items-center">
                    <Ionicons name="star" size={10} color="#f59e0b" />
                    <Text className="text-[10px] font-black text-slate-900 ml-1">{vendor.rating}</Text>
                  </View>
                  
                  <View className="absolute bottom-0 w-full p-3">
                    <Text className="font-extrabold text-white text-sm mb-0.5" numberOfLines={2}>{vendor.name}</Text>
                    <Text className="text-white/80 font-bold text-xs">{vendor.priceRange.split(' ')[0]}</Text>
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
                  <Image source={{ uri: vendor.imageUrls[0] }} className="w-full h-full absolute" resizeMode="cover" />
                  <View className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  <View className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg flex-row items-center">
                    <Ionicons name="star" size={10} color="#f59e0b" />
                    <Text className="text-[10px] font-black text-slate-900 ml-1">{vendor.rating}</Text>
                  </View>
                  
                  <View className="absolute bottom-0 w-full p-3">
                    <Text className="font-extrabold text-white text-sm mb-0.5" numberOfLines={2}>{vendor.name}</Text>
                    <Text className="text-white/80 font-bold text-xs">{vendor.priceRange.split(' ')[0]}</Text>
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