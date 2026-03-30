import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Platform, StatusBar, ImageBackground, Animated } from 'react-native';

export default function LandingScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true })
    ]).start();
  }, []);

  return (
    <ImageBackground 
      source={{ uri: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1080&q=80' }}
      className="flex-1"
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View className="absolute inset-0 bg-black/60" />
      
      <SafeAreaView className="flex-1">
        <View className="flex-1 items-center justify-center p-6">
          <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }} className="items-center mb-10 w-full mt-24 flex-1">
            <Text className="text-5xl font-extrabold text-[#D4AF37] mb-2 text-center tracking-tighter" style={{ textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width: 0, height: 2}, textShadowRadius: 4 }}>EventMaster</Text>
            <View className="bg-white/20 px-4 py-1.5 rounded-full border border-white/30 backdrop-blur-md mb-4">
              <Text className="text-white font-bold tracking-[0.2em] text-xs">ENTERPRISE EDITION</Text>
            </View>
            <Text className="text-base text-gray-300 text-center mt-2 px-6 leading-6 font-medium">
              The ultimate event organization app tailored for premium wedding and catering logistics.
            </Text>
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim }} className="w-full max-w-sm gap-y-4 mb-10">
            <TouchableOpacity 
              onPress={() => navigation.navigate('Signup')}
              className="w-full bg-[#D4AF37] py-4 rounded-2xl shadow-lg shadow-[#D4AF37]/30 items-center border border-yellow-400/50"
            >
              <Text className="text-white text-lg font-black tracking-wide">Create an Account</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => navigation.navigate('Login')}
              className="w-full bg-black/40 border border-white/20 py-4 rounded-2xl items-center backdrop-blur-md"
            >
              <Text className="text-white text-lg font-bold">I already have an account</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
