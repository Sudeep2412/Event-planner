import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Platform, StatusBar, Animated, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function LandingScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: false }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: false })
    ]).start();
  }, []);

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Background aesthetic blobs */}
      <View className="absolute top-[-100px] right-[-100px] w-96 h-96 bg-slate-100 rounded-full blur-3xl opacity-50" />
      <View className="absolute bottom-[20%] left-[-50px] w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-60" />

      <SafeAreaView className="flex-1">
        <View className="flex-1 px-8 justify-between pb-12 pt-24">
          
          {/* Header Section */}
          <Animated.View 
            style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }} 
            className="flex-1 justify-center"
          >
            <View className="w-16 h-16 bg-slate-900 rounded-2xl items-center justify-center mb-8 shadow-xl shadow-slate-900/20">
              <Feather name="layers" size={28} color="white" />
            </View>
            
            <View className="bg-slate-100 self-start px-3 py-1.5 rounded-full mb-6">
              <Text className="text-slate-600 font-bold tracking-[0.1em] text-[10px] uppercase">Enterprise Edition</Text>
            </View>
            
            <Text className="text-5xl font-black text-slate-900 tracking-tight leading-[56px] mb-4">
              Master{'\n'}every detail.
            </Text>
            
            <Text className="text-lg text-slate-500 font-medium leading-7 pr-4">
              The premium organization platform tailored exclusively for professional event & wedding planners.
            </Text>
          </Animated.View>

          {/* Action Section */}
          <Animated.View 
            style={{ opacity: fadeAnim }} 
            className="w-full gap-y-4"
          >
            <TouchableOpacity 
              onPress={() => navigation.navigate('Signup')}
              activeOpacity={0.8}
              className="w-full bg-slate-900 py-4.5 rounded-2xl items-center shadow-lg shadow-slate-900/20 flex-row justify-center"
              style={{ minHeight: 60 }}
            >
              <Text className="text-white text-[17px] font-bold tracking-wide mr-2">Create an Account</Text>
              <Feather name="arrow-right" size={18} color="white" />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.6}
              className="w-full bg-white border-2 border-slate-200 py-4 rounded-2xl items-center"
              style={{ minHeight: 60 }}
            >
              <Text className="text-slate-900 text-[17px] font-bold">Log In</Text>
            </TouchableOpacity>
          </Animated.View>
          
        </View>
      </SafeAreaView>
    </View>
  );
}
