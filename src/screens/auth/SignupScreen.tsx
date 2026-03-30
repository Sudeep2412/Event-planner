import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator, ImageBackground, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

export default function SignupScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signUpWithEmail() {
    setLoading(true);
    const { error, data } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (data?.user) {
      await supabase.from('profiles').upsert({ id: data.user.id, role: 'planner' });
    }

    if (error) {
      Alert.alert('Signup Failed', error.message);
    } else if (data?.session) {
      // Automatic login if email confirmation is off
    } else {
      Alert.alert('Success', 'Please check your inbox for email verification!');
      navigation.goBack();
    }
    setLoading(false);
  }

  return (
    <ImageBackground 
      source={{ uri: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1080&q=80' }}
      className="flex-1"
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View className="absolute inset-0 bg-black/60" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <SafeAreaView className="flex-1">
          <View className="flex-1 justify-center p-6">
            <View className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[32px] p-8 shadow-2xl">
              <View className="items-center mb-8">
                <View className="w-16 h-16 bg-white/10 rounded-full items-center justify-center mb-4 border border-white/20">
                  <Feather name="star" size={24} color="#D4AF37" />
                </View>
                <Text className="text-3xl font-extrabold text-white mb-2">Join Elite Planners</Text>
                <Text className="text-gray-300 text-center">Register to start managing premium events.</Text>
              </View>

              <View className="space-y-4 mb-8">
                <View className="flex-row items-center bg-black/40 border border-white/10 rounded-2xl px-4 py-4 mb-4">
                  <Feather name="mail" size={20} color="#94a3b8" />
                  <TextInput
                    className="flex-1 ml-3 text-white font-medium text-base h-7"
                    style={{ color: '#ffffff' }}
                    placeholder="Email address"
                    placeholderTextColor="#94a3b8"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
                
                <View className="flex-row items-center bg-black/40 border border-white/10 rounded-2xl px-4 py-4">
                  <Feather name="key" size={20} color="#94a3b8" />
                  <TextInput
                    className="flex-1 ml-3 text-white font-medium text-base h-7"
                    style={{ color: '#ffffff' }}
                    placeholder="Password"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry
                    autoCapitalize="none"
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>
              </View>

              <TouchableOpacity 
                className="w-full bg-[#1A1A1A] py-4 rounded-2xl shadow-lg border border-white/10 items-center flex-row justify-center active:bg-black transition-all"
                onPress={signUpWithEmail}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-lg font-black tracking-wide">Register Account</Text>}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.goBack()} className="mt-8 items-center py-2 flex-row justify-center">
                <Text className="text-gray-400 font-bold text-sm">Already have an account? <Text className="text-[#D4AF37]">Login</Text></Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}
