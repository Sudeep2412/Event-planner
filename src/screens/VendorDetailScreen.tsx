// // import React, { useState } from 'react';
// // import { View, Text, TouchableOpacity, ScrollView, Image, Dimensions, Alert } from 'react-native';
// // import { Feather } from '@expo/vector-icons';
// // import { vendors } from '../data/dummyData';

// // const { width } = Dimensions.get('window');

// // interface VendorDetailScreenProps {
// //   onBack: () => void;
// //   vendorId: string;
// // }

// // export default function VendorDetailScreen({ onBack, vendorId }: VendorDetailScreenProps) {
// //   const vendor = vendors.find(v => v.id === vendorId);
// //   const [activeImageIndex, setActiveImageIndex] = useState(0);

// //   if (!vendor) return null;

// //   return (
// //     <View className="flex-1 bg-[#fdfaff]">
// //       <ScrollView className="flex-1 pb-24" showsVerticalScrollIndicator={false}>
// //         {/* Carousel Header */}
// //         <View className="relative h-64 bg-slate-200">
// //           <ScrollView
// //             horizontal
// //             pagingEnabled
// //             showsHorizontalScrollIndicator={false}
// //             onScroll={(e) => {
// //               const slide = Math.round(e.nativeEvent.contentOffset.x / Math.min(width, 400));
// //               setActiveImageIndex(slide);
// //             }}
// //             scrollEventThrottle={16}
// //           >
// //             {vendor.imageUrls.map((url, i) => (
// //               <Image
// //                 key={i}
// //                 source={{ uri: url }}
// //                 style={{ width: Math.min(width, 400), height: 256 }}
// //                 resizeMode="cover"
// //               />
// //             ))}
// //           </ScrollView>

// //           {/* Floating Back Button */}
// //           <TouchableOpacity
// //             onPress={onBack}
// //             className="absolute top-12 left-4 bg-white/90 p-2 rounded-full shadow-md z-10"
// //           >
// //             <Feather name="arrow-left" size={24} color="#334155" />
// //           </TouchableOpacity>

// //           {/* Dots */}
// //           <View className="absolute bottom-4 w-full flex-row justify-center space-x-1.5">
// //             {vendor.imageUrls.map((_, i) => (
// //               <View
// //                 key={i}
// //                 className={`w-2 h-2 rounded-full ${i === activeImageIndex ? 'bg-white' : 'bg-white/50'}`}
// //               />
// //             ))}
// //           </View>
// //         </View>

// //         <View className="px-5 pt-6">
// //           {/* Identity Section */}
// //           <View className="flex-row justify-between items-start mb-4">
// //             <View className="flex-1 pr-4">
// //               <Text className="text-2xl font-extrabold text-slate-900 leading-tight">
// //                 {vendor.name}
// //               </Text>
// //               <View className="flex-row items-center mt-2">
// //                 <Feather name="map-pin" size={14} color="#6a21a6" />
// //                 <Text className="text-slate-500 text-sm font-medium ml-1">
// //                   Greenwich Village, New York
// //                 </Text>
// //               </View>
// //             </View>
// //             <TouchableOpacity className="p-2">
// //               <Feather name="share-2" size={24} color="#94a3b8" />
// //             </TouchableOpacity>
// //           </View>

// //           {/* Pricing Highlight Card */}
// //           <View className="flex-row bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6">
// //             <View className="flex-1 border-r border-slate-100 pr-2">
// //               <Text className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
// //                 {vendor.categoryId === 'venues' ? 'Pricing (approx)' : 'Starting Price'}
// //               </Text>
// //               <Text className="text-lg font-bold text-primary mt-1">
// //                 {vendor.priceRange}
// //               </Text>
// //             </View>
// //             {vendor.venueFee && (
// //               <View className="flex-1 pl-4">
// //                 <Text className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
// //                   Venue Fee / Minimum
// //                 </Text>
// //                 <Text className="text-lg font-bold text-slate-900 mt-1">
// //                   {vendor.venueFee}
// //                 </Text>
// //               </View>
// //             )}
// //           </View>

// //           {/* About Section */}
// //           <View className="mb-6">
// //             <Text className="text-lg font-bold text-slate-900 mb-2">About this vendor</Text>
// //             <Text className="text-slate-600 leading-relaxed text-[15px]">
// //               {vendor.about}
// //             </Text>
// //           </View>

// //           {/* Key Amenities */}
// //           <View className="flex-row flex-wrap justify-between mb-8">
// //             {vendor.amenities.map((amenity, idx) => (
// //               <View
// //                 key={idx}
// //                 className="w-[48%] flex-row items-center p-3 bg-slate-50 rounded-xl mb-3"
// //               >
// //                 <Feather name={amenity.icon as any} size={20} color="#475569" />
// //                 <Text className="text-xs font-semibold text-slate-700 ml-2">
// //                   {amenity.text}
// //                 </Text>
// //               </View>
// //             ))}
// //           </View>
// //         </View>
// //       </ScrollView>

// //       {/* Sticky Bottom Footer */}
// //       <View className="absolute bottom-0 w-full bg-white border-t border-slate-100 p-4 pb-8 flex-row items-center justify-between z-50 shadow-lg">
// //         <View className="flex-1">
// //           <Text className="text-[10px] text-slate-500 font-bold uppercase">Starting from</Text>
// //           <Text className="text-xl font-extrabold text-slate-900 leading-tight text-primary">
// //             {vendor.priceRange.split(' - ')[0].split(' /')[0]}
// //             <Text className="text-sm font-normal text-slate-400">
// //               {vendor.priceRange.includes('/') ? ` /${vendor.priceRange.split('/')[1]}` : ''}
// //             </Text>
// //           </Text>
// //         </View>
// //         <TouchableOpacity 
// //           onPress={() => Alert.alert("Contact Request Sent", `${vendor.name} has received your contact request and will bring you a customized quote shortly.`)}
// //           className="flex-[2] bg-primary py-4 px-8 rounded-xl items-center shadow-lg active:opacity-90 active:scale-95 transition-all"
// //         >
// //           <Text className="text-white font-bold text-lg">Contact Vendor</Text>
// //         </TouchableOpacity>
// //       </View>
// //     </View>
// //   );
// // }


// import React, { useState } from 'react';
// import { View, Text, TouchableOpacity, ScrollView, Image, Dimensions, Alert } from 'react-native';
// import { Feather, FontAwesome } from '@expo/vector-icons';
// import { vendors } from '../data/dummyData';

// const { width } = Dimensions.get('window');

// interface VendorDetailScreenProps {
//   onBack: () => void;
//   vendorId: string;
// }

// export default function VendorDetailScreen({ onBack, vendorId }: VendorDetailScreenProps) {
//   const vendor = vendors.find(v => v.id === vendorId);
//   const [activeImageIndex, setActiveImageIndex] = useState(0);

//   if (!vendor) return null;

//   return (
//     <View className="flex-1 bg-white">
//       <ScrollView className="flex-1 pb-28" showsVerticalScrollIndicator={false}>
//         {/* Image Carousel */}
//         <View className="relative h-80 bg-slate-100">
//           <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}
//             onScroll={(e) => setActiveImageIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
//             scrollEventThrottle={16}
//           >
//             {vendor.imageUrls.map((url, i) => (
//               <Image key={i} source={{ uri: url }} style={{ width, height: 320 }} resizeMode="cover" />
//             ))}
//           </ScrollView>

//           {/* Top Navigation */}
//           <View className="absolute top-12 left-0 w-full px-5 flex-row justify-between items-center z-10">
//             <TouchableOpacity onPress={onBack} className="w-10 h-10 bg-white/90 rounded-full items-center justify-center shadow-md">
//               <Feather name="arrow-left" size={20} color="#0f172a" />
//             </TouchableOpacity>
//             <View className="flex-row space-x-3">
//               <TouchableOpacity className="w-10 h-10 bg-white/90 rounded-full items-center justify-center shadow-md">
//                 <Feather name="share" size={18} color="#0f172a" />
//               </TouchableOpacity>
//               <TouchableOpacity className="w-10 h-10 bg-white/90 rounded-full items-center justify-center shadow-md">
//                 <Feather name="heart" size={18} color="#0f172a" />
//               </TouchableOpacity>
//             </View>
//           </View>

//           {/* Pagination Indicators */}
//           <View className="absolute bottom-6 w-full flex-row justify-center space-x-2">
//             {vendor.imageUrls.map((_, i) => (
//               <View key={i} className={`h-2 rounded-full transition-all ${i === activeImageIndex ? 'w-6 bg-white' : 'w-2 bg-white/50'}`} />
//             ))}
//           </View>
//         </View>

//         <View className="px-6 pt-6 bg-white rounded-t-3xl -mt-6">
//           {/* Title & Trust Signals */}
//           <View className="mb-5">
//             <View className="flex-row items-center mb-2">
//               <View className="bg-indigo-50 px-2 py-1 rounded-md flex-row items-center mr-3">
//                 <Feather name="award" size={12} color="#4f46e5" />
//                 <Text className="text-[10px] font-bold text-indigo-600 ml-1 uppercase tracking-wider">Super Vendor</Text>
//               </View>
//               <View className="flex-row items-center">
//                 <FontAwesome name="star" size={14} color="#f59e0b" />
//                 <Text className="text-sm font-bold text-slate-800 ml-1.5">{vendor.rating}</Text>
//                 <Text className="text-sm text-slate-400 ml-1 underline">(128 Reviews)</Text>
//               </View>
//             </View>
//             <Text className="text-3xl font-black text-slate-900 leading-tight tracking-tight">{vendor.name}</Text>
//             <View className="flex-row items-center mt-2">
//               <Feather name="map-pin" size={14} color="#64748b" />
//               <Text className="text-slate-500 text-sm font-medium ml-1.5">{vendor.location} • {vendor.distance}</Text>
//             </View>
//           </View>

//           <View className="h-[1px] w-full bg-slate-100 my-4" />

//           {/* Pricing Box */}
//           <View className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-6 flex-row justify-between items-center">
//             <View>
//               <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Pricing Starts At</Text>
//               <Text className="text-2xl font-black text-primary">{vendor.priceRange.split(' - ')[0]}</Text>
//               {vendor.venueFee && <Text className="text-xs text-slate-500 font-medium mt-1">+ {vendor.venueFee} venue fee</Text>}
//             </View>
//             <TouchableOpacity className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
//               <Text className="text-slate-800 font-bold text-sm">View Packages</Text>
//             </TouchableOpacity>
//           </View>

//           {/* About Section */}
//           <View className="mb-8">
//             <Text className="text-xl font-extrabold text-slate-900 mb-3">About</Text>
//             <Text className="text-slate-600 text-[15px] leading-relaxed font-medium">
//               {vendor.about}
//             </Text>
//             <TouchableOpacity className="mt-2"><Text className="text-primary font-bold text-sm">Read more</Text></TouchableOpacity>
//           </View>

//           {/* Amenities Grid */}
//           <View className="mb-8">
//             <Text className="text-xl font-extrabold text-slate-900 mb-4">What's Included</Text>
//             <View className="flex-row flex-wrap justify-between">
//               {vendor.amenities.map((amenity, idx) => (
//                 <View key={idx} className="w-[48%] flex-row items-center p-4 bg-white border border-slate-100 rounded-2xl mb-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
//                   <View className="w-8 h-8 bg-purple-50 rounded-full items-center justify-center mr-3">
//                     <Feather name={amenity.icon as any} size={16} color="#6a21a6" />
//                   </View>
//                   <Text className="flex-1 text-sm font-bold text-slate-700">{amenity.text}</Text>
//                 </View>
//               ))}
//             </View>
//           </View>
          
//           {/* Availability / Calendar Mock */}
//           <View className="mb-8 bg-indigo-50 p-5 rounded-3xl flex-row items-center">
//             <View className="w-12 h-12 bg-white rounded-full items-center justify-center mr-4 shadow-sm">
//               <Feather name="calendar" size={20} color="#4f46e5" />
//             </View>
//             <View className="flex-1">
//               <Text className="text-slate-900 font-extrabold text-base">Check Availability</Text>
//               <Text className="text-slate-600 text-xs font-medium mt-0.5">Dates are filling up fast for 2026.</Text>
//             </View>
//             <Feather name="chevron-right" size={20} color="#4f46e5" />
//           </View>

//         </View>
//       </ScrollView>

//       {/* Floating Action Bar */}
//       <View className="absolute bottom-0 w-full bg-white border-t border-slate-100 px-6 py-4 pb-8 flex-row items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.08)]">
//         <TouchableOpacity 
//           onPress={() => Alert.alert("Message", "Opening chat window...")}
//           className="w-14 h-14 border-2 border-slate-200 rounded-2xl items-center justify-center mr-3 bg-slate-50"
//         >
//           <Feather name="message-square" size={24} color="#0f172a" />
//         </TouchableOpacity>
//         <TouchableOpacity 
//           onPress={() => Alert.alert("Quote Request", "Navigating to quote form...")}
//           className="flex-1 bg-primary h-14 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/30"
//         >
//           <Text className="text-white font-extrabold text-lg mr-2">Request Quote</Text>
//           <Feather name="arrow-right" size={20} color="white" />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }


import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { vendors } from '../data/dummyData';

const { width } = Dimensions.get('window');

export default function VendorDetailScreen({ vendorId, isSaved, toggleSave, onBack }: any) {
  const vendor = vendors.find(v => v.id === vendorId);
  if (!vendor) return null;

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 pb-28" showsVerticalScrollIndicator={false}>
        
        {/* Immersive Media Header */}
        <View className="relative h-96">
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
            {vendor.imageUrls.map((url, i) => (
              <Image key={i} source={{ uri: url }} style={{ width, height: 384 }} resizeMode="cover" />
            ))}
          </ScrollView>
          {/* Gradient Overlay for text readability */}
          <View className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Top Nav */}
          <View className="absolute top-12 w-full px-5 flex-row justify-between items-center z-10">
            <TouchableOpacity onPress={onBack} className="w-10 h-10 bg-white/30 backdrop-blur-md rounded-full items-center justify-center border border-white/20">
              <Feather name="arrow-left" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleSave} className="w-10 h-10 bg-white/30 backdrop-blur-md rounded-full items-center justify-center border border-white/20">
              <Ionicons name={isSaved ? "heart" : "heart-outline"} size={22} color={isSaved ? "#ef4444" : "white"} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Container (Overlapping the image) */}
        <View className="px-6 pt-8 bg-white rounded-t-[40px] -mt-10">
          
          {/* Identity & Trust */}
          <View className="mb-6 flex-row justify-between items-start">
            <View className="flex-1 pr-4">
              <Text className="text-3xl font-black text-slate-900 leading-tight mb-2">{vendor.name}</Text>
              <View className="flex-row items-center">
                <View className="flex-row items-center bg-amber-50 px-2 py-1 rounded-lg mr-3">
                  <Ionicons name="star" size={14} color="#d97706" />
                  <Text className="text-xs font-black text-amber-700 ml-1">{vendor.rating} (128)</Text>
                </View>
                <View className="flex-row items-center">
                  <Feather name="map-pin" size={14} color="#64748b" />
                  <Text className="text-slate-500 text-sm font-medium ml-1.5">{vendor.distance}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Pricing Highlight */}
          <View className="bg-slate-50 rounded-3xl p-5 border border-slate-100 flex-row justify-between items-center mb-8">
            <View>
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Pricing Starts At</Text>
              <Text className="text-2xl font-black text-primary">{vendor.priceRange}</Text>
            </View>
            {vendor.venueFee && (
              <View className="items-end">
                <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Venue Fee</Text>
                <Text className="text-lg font-bold text-slate-900">{vendor.venueFee}</Text>
              </View>
            )}
          </View>

          {/* Story / About */}
          <View className="mb-8">
            <Text className="text-xl font-extrabold text-slate-900 mb-3">The Experience</Text>
            <Text className="text-slate-600 text-[15px] leading-relaxed font-medium">{vendor.about}</Text>
          </View>

          {/* Premium Amenities Grid */}
          <View className="mb-8">
            <Text className="text-xl font-extrabold text-slate-900 mb-4">Highlights & Amenities</Text>
            <View className="flex-row flex-wrap justify-between gap-y-3">
              {vendor.amenities.map((amenity, idx) => (
                <View key={idx} className="w-[48%] flex-row items-center p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                  <View className="w-8 h-8 bg-indigo-50 rounded-full items-center justify-center mr-3">
                    <Feather name={amenity.icon as any} size={16} color="#4f46e5" />
                  </View>
                  <Text className="flex-1 text-sm font-bold text-slate-700">{amenity.text}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Social Proof (Reviews Preview) */}
          <View className="mb-8">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-extrabold text-slate-900">Verified Reviews</Text>
              <Text className="text-primary font-bold">See All</Text>
            </View>
            <View className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 bg-slate-300 rounded-full mr-3" />
                <View>
                  <Text className="font-bold text-slate-900">Sarah M.</Text>
                  <Text className="text-xs text-slate-400">Married Oct 2025</Text>
                </View>
              </View>
              <Text className="text-slate-600 font-medium italic">"Absolutely breathtaking venue. The team went above and beyond for our special day..."</Text>
            </View>
          </View>

        </View>
      </ScrollView>

      {/* Floating Sticky CTA - The Conversion Engine */}
      <View className="absolute bottom-0 w-full bg-white/95 backdrop-blur-md border-t border-slate-100 px-6 py-4 pb-8 flex-row items-center shadow-[0_-10px_40px_rgba(0,0,0,0.08)]">
        <TouchableOpacity className="w-14 h-14 border-2 border-slate-200 rounded-2xl items-center justify-center mr-3 bg-white active:bg-slate-50">
          <Feather name="calendar" size={24} color="#0f172a" />
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 bg-slate-900 h-14 rounded-2xl flex-row items-center justify-center shadow-lg active:scale-[0.98] transition-all">
          <Text className="text-white font-extrabold text-lg mr-2">Check Availability</Text>
          <Feather name="arrow-right" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}