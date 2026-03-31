import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator, StatusBar, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

export default function SignupScreen({ navigation }: any) {
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signUpWithEmail() {
    if (!businessName || !email || !password) {
      Platform.OS === 'web' ? window.alert('Please fill out all fields.') : Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    setLoading(true);
    try {
      const { error, data } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        Platform.OS === 'web' ? window.alert(`Signup Failed: ${error.message}`) : Alert.alert('Signup Failed', error.message);
        console.error('Supabase Signup Error:', error.message);
      } else if (data?.user) {
        
        // Setup planner profile
        const { error: profileError } = await supabase.from('profiles').upsert({ 
          id: data.user.id, 
          role: 'planner',
          business_name: businessName
        });
        
        if (profileError) {
          console.error('Profile Creation Error:', profileError.message);
        }
        
        if (data?.session) {
          console.log('Signup Successful');
        } else {
          Platform.OS === 'web' 
            ? window.alert('Registration successful! Please check your inbox for email verification.') 
            : Alert.alert('Success', 'Please check your inbox for email verification!');
          navigation.goBack();
        }
      }
    } catch (err: any) {
      Platform.OS === 'web' ? window.alert(`Signup Error: ${err.message || 'An unexpected error occurred'}`) : Alert.alert('Signup Error', err.message || 'An unexpected error occurred');
      console.error('Signup Exception:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Background Decor */}
      <View className="absolute top-[-50px] left-[-100px] w-96 h-96 bg-amber-50 rounded-full blur-3xl opacity-60" />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <SafeAreaView className="flex-1">
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}>
            <View className="flex-1 px-8 pt-12 justify-center">
              
              {/* Nav Back */}
              <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-full items-center justify-center mb-6">
                <Feather name="arrow-left" size={20} color="#0f172a" />
              </TouchableOpacity>

              <View className="mb-10 mt-4">
                <Text className="text-3xl font-black text-slate-900 tracking-tight mb-2">Create Account</Text>
                <Text className="text-slate-500 font-medium">
                  Register as an enterprise planner to start managing elite events today.
                </Text>
              </View>

              <View className="gap-y-4 mb-8">
                <View>
                  <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Business or Full Name</Text>
                  <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 focus:border-amber-400 focus:bg-white transition-all">
                    <Feather name="briefcase" size={20} color="#94a3b8" />
                    <TextInput
                      className="flex-1 ml-3 text-slate-900 font-bold text-[16px] py-0 m-0 outline-none"
                      placeholder="Your Business Name"
                      placeholderTextColor="#94a3b8"
                      value={businessName}
                      onChangeText={setBusinessName}
                    />
                  </View>
                </View>

                <View>
                  <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</Text>
                  <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 focus:border-amber-400 focus:bg-white transition-all">
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
                  <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 focus:border-amber-400 focus:bg-white transition-all">
                    <Feather name="key" size={20} color="#94a3b8" />
                    <TextInput
                      className="flex-1 ml-3 text-slate-900 font-bold text-[16px] py-0 m-0 outline-none"
                      placeholder="Create a password"
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
                onPress={signUpWithEmail}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-[17px] font-bold tracking-wide">Complete Registration</Text>}
              </TouchableOpacity>

              <View className="flex-row justify-center mt-8">
                <Text className="text-slate-500 font-medium">Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.replace('Login')}>
                  <Text className="text-amber-600 font-bold">Sign In</Text>
                </TouchableOpacity>
              </View>

            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}
