import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, StatusBar, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const passRef = useRef<TextInput>(null);

  async function signInWithEmail() {
    setErrorMsg('');
    if (!email || !password) {
       setErrorMsg('Please enter both email and password.');
       return;
    }

    setLoading(true);
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        if (error.message.includes('rate limit')) {
           setErrorMsg('Rate limit exceeded. Please wait 60s or use Dev Bypass.');
        } else {
           setErrorMsg(error.message);
        }
      } else if (data?.session) {
        console.log('Login Successful');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected runtime error occurred.');
    } finally {
      setLoading(false);
    }
  }

  // Developer Bypass
  async function devBypassAuth() {
    setErrorMsg('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'demo@eventmaster.com',
        password: 'password123',
      });
      if (error) setErrorMsg('Dev Login failed: ' + error.message);
    } catch (err: any) {
       setErrorMsg(err.message);
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
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            <View className="flex-1 px-8 pt-12 pb-8 justify-center min-h-[600px]">
              
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

              <View className="gap-y-4 mb-6">
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
                      blurOnSubmit={false}
                      returnKeyType="next"
                      onSubmitEditing={() => passRef.current?.focus()}
                    />
                  </View>
                </View>
                
                <View>
                  <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</Text>
                  <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 focus:border-indigo-400 focus:bg-white transition-all">
                    <Feather name="key" size={20} color="#94a3b8" />
                    <TextInput
                      ref={passRef}
                      className="flex-1 ml-3 text-slate-900 font-bold text-[16px] py-0 m-0 outline-none"
                      placeholder="Enter your password"
                      placeholderTextColor="#94a3b8"
                      secureTextEntry
                      autoCapitalize="none"
                      returnKeyType="done"
                      value={password}
                      onChangeText={setPassword}
                      onSubmitEditing={signInWithEmail}
                    />
                  </View>
                </View>
              </View>

              {/* Inline Error State */}
              {errorMsg ? (
                <View className="bg-red-50 border border-red-100 p-4 rounded-xl mb-6">
                  <Text className="text-red-600 font-bold text-sm tracking-wide text-center">{errorMsg}</Text>
                </View>
              ) : null}

              <TouchableOpacity 
                className="w-full bg-slate-900 py-4.5 rounded-2xl items-center shadow-lg shadow-slate-900/20 active:scale-[0.98] transition-all mb-4"
                style={{ minHeight: 60, justifyContent: 'center' }}
                onPress={signInWithEmail}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-[17px] font-bold tracking-wide">Secure Login</Text>}
              </TouchableOpacity>

              <TouchableOpacity 
                className="w-full bg-indigo-50 py-4.5 rounded-2xl items-center border border-indigo-100 active:scale-[0.98] transition-all"
                style={{ minHeight: 60, justifyContent: 'center' }}
                onPress={devBypassAuth}
                disabled={loading}
              >
                <Text className="text-indigo-600 font-bold tracking-wide uppercase text-xs">🛠️ Try Demo Account</Text>
              </TouchableOpacity>

              <View className="flex-row justify-center mt-8">
                <Text className="text-slate-500 font-medium">Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.replace('Signup')}>
                  <Text className="text-indigo-600 font-bold">Register</Text>
                </TouchableOpacity>
              </View>

            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}
