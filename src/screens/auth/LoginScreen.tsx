import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        Platform.OS === 'web' ? window.alert(`Login Failed: ${error.message}`) : Alert.alert('Login Failed', error.message);
        console.error('Supabase Login Error:', error.message);
      } else if (data?.session) {
        console.log('Login Successful');
      }
    } catch (err: any) {
      Platform.OS === 'web' ? window.alert(`Login Error: ${err.message || 'An unexpected error occurred'}`) : Alert.alert('Login Error', err.message || 'An unexpected error occurred');
      console.error('Login Exception:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Background Decor */}
      <View className="absolute top-[-50px] right-[-100px] w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-60" />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <SafeAreaView className="flex-1">
          <View className="flex-1 px-8 pt-12 pb-8 justify-center">
            
            {/* Nav Back */}
            <TouchableOpacity onPress={() => navigation.goBack()} className="absolute top-16 left-8 w-10 h-10 bg-slate-50 border border-slate-100 rounded-full items-center justify-center z-10">
              <Feather name="arrow-left" size={20} color="#0f172a" />
            </TouchableOpacity>

            <View className="items-center mb-10 mt-10">
              <View className="w-16 h-16 bg-indigo-50 rounded-2xl items-center justify-center mb-6">
                <Feather name="anchor" size={28} color="#4f46e5" />
              </View>
              <Text className="text-3xl font-black text-slate-900 tracking-tight mb-2">Welcome Back</Text>
              <Text className="text-slate-500 font-medium text-center px-4">
                Access your premium event dashboard and manage your clients.
              </Text>
            </View>

            <View className="gap-y-4 mb-8">
              <View>
                <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</Text>
                <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 focus:border-indigo-400 focus:bg-white transition-all">
                  <Feather name="mail" size={20} color="#94a3b8" />
                  <TextInput
                    className="flex-1 ml-3 text-slate-900 font-bold text-[16px] py-0 m-0 outline-none"
                    placeholder="Enter your email"
                    placeholderTextColor="#94a3b8"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>
              
              <View>
                <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</Text>
                <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 focus:border-indigo-400 focus:bg-white transition-all">
                  <Feather name="key" size={20} color="#94a3b8" />
                  <TextInput
                    className="flex-1 ml-3 text-slate-900 font-bold text-[16px] py-0 m-0 outline-none"
                    placeholder="Enter your password"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry
                    autoCapitalize="none"
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity 
              className="w-full bg-slate-900 py-4.5 rounded-2xl items-center shadow-lg shadow-slate-900/20 active:scale-[0.98] transition-all"
              style={{ minHeight: 60, justifyContent: 'center' }}
              onPress={signInWithEmail}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-[17px] font-bold tracking-wide">Secure Login</Text>}
            </TouchableOpacity>

            <View className="flex-row justify-center mt-8">
              <Text className="text-slate-500 font-medium">Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.replace('Signup')}>
                <Text className="text-indigo-600 font-bold">Register</Text>
              </TouchableOpacity>
            </View>

          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}
