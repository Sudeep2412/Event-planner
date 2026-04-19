import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useColorScheme } from 'nativewind';

interface BudgetItem {
  id: string;
  category: string;
  vendor_name: string;
  total_amount: number;
  paid_amount: number;
  due_date: string | null;
}

const CATEGORIES = ['Venue', 'Catering', 'Decor', 'Photography', 'Attire', 'Miscellaneous'];

export default function BudgetScreen({ route, navigation }: any) {
  const { eventId, totalBudget = 25000 } = route?.params || {};
  const { colorScheme } = useColorScheme();
  
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<BudgetItem[]>([]);
  
  // New Item State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState(CATEGORIES[1]);
  const [newVendor, setNewVendor] = useState('');
  const [newTotal, setNewTotal] = useState('');
  const [newPaid, setNewPaid] = useState('0');

  useEffect(() => {
    fetchBudget();
  }, []);

  const fetchBudget = async () => {
    try {
      const { data, error } = await supabase
        .from('budget_items')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (err: any) {
      console.log('Error fetching budget:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const addBudgetItem = async () => {
    if (!newVendor || !newTotal) {
      Alert.alert('Missing Info', 'Please provide a vendor name and total amount.');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.from('budget_items').insert({
        event_id: eventId,
        category: newCategory,
        vendor_name: newVendor,
        total_amount: parseInt(newTotal) || 0,
        paid_amount: parseInt(newPaid) || 0
      }).select().single();

      if (error) throw error;
      
      setItems([data, ...items]);
      setShowAddForm(false);
      setNewVendor('');
      setNewTotal('');
      setNewPaid('0');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await supabase.from('budget_items').delete().eq('id', id);
      setItems(items.filter(item => item.id !== id));
    } catch (err: any) {
      console.log(err.message);
    }
  };

  // KPI Math
  const totalSpent = items.reduce((sum, item) => sum + item.total_amount, 0);
  const totalPaid = items.reduce((sum, item) => sum + item.paid_amount, 0);
  const totalDue = totalSpent - totalPaid;
  const remainingBudget = totalBudget - totalSpent;
  const budgetPercentage = Math.min(100, (totalSpent / totalBudget) * 100);

  if (loading && items.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-[#FAFAFA] dark:bg-slate-900 transition-colors">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#FAFAFA] dark:bg-slate-950 pt-12 transition-colors">
      {/* Header */}
      <View className="px-6 py-5 flex-row items-center border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 shadow-sm transition-colors">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 mr-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full">
          <Feather name="arrow-left" size={20} color={colorScheme === 'dark' ? '#f8fafc' : '#0f172a'} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Finance Command</Text>
          <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">Live Budget Engine</Text>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        {/* Visual Budget Matrix */}
        <View className="mx-6 mt-6 bg-slate-900 dark:bg-indigo-950 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <View className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500 rounded-full blur-3xl opacity-30" />
          
          <Text className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1">Total Allocated Budget</Text>
          <Text className="text-white font-black text-4xl mb-6 tracking-tight">₹{totalBudget.toLocaleString()}</Text>

          <View className="h-4 bg-slate-800 rounded-full overflow-hidden flex-row mb-4">
            <View className="h-full bg-indigo-500" style={{ width: `${(totalPaid / totalBudget) * 100}%` }} />
            <View className="h-full bg-amber-400" style={{ width: `${(totalDue / totalBudget) * 100}%` }} />
          </View>

          <View className="flex-row justify-between">
            <View>
              <View className="flex-row items-center mb-1">
                <View className="w-2 h-2 rounded-full bg-indigo-500 mr-2" />
                <Text className="text-slate-400 text-xs font-bold">Paid Out</Text>
              </View>
              <Text className="text-white font-bold text-lg">₹{totalPaid.toLocaleString()}</Text>
            </View>
            <View>
              <View className="flex-row items-center mb-1">
                <View className="w-2 h-2 rounded-full bg-amber-400 mr-2" />
                <Text className="text-slate-400 text-xs font-bold">Pending Dues</Text>
              </View>
              <Text className="text-white font-bold text-lg">₹{totalDue.toLocaleString()}</Text>
            </View>
            <View>
              <View className="flex-row items-center mb-1">
                <View className="w-2 h-2 rounded-full bg-slate-700 mr-2" />
                <Text className="text-slate-400 text-xs font-bold">Remaining</Text>
              </View>
              <Text className="text-emerald-400 font-bold text-lg">₹{Math.max(0, remainingBudget).toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Invoice Ledger */}
        <View className="px-6 mt-8 mb-4 flex-row justify-between items-center">
          <Text className="text-lg font-black text-slate-900 dark:text-white">Invoice Ledger</Text>
          <TouchableOpacity onPress={() => setShowAddForm(!showAddForm)} className="bg-indigo-100 dark:bg-indigo-900/40 px-3 py-1.5 rounded-full flex-row items-center">
            <Feather name={showAddForm ? "x" : "plus"} size={14} color={colorScheme === 'dark' ? '#818cf8' : '#4f46e5'} style={{ marginRight: 4 }} />
            <Text className="text-indigo-700 dark:text-indigo-400 font-bold text-xs">{showAddForm ? 'Cancel' : 'Add Cost'}</Text>
          </TouchableOpacity>
        </View>

        {/* Add Form Dropdown */}
        {showAddForm && (
          <View className="mx-6 mb-6 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            
            <Text className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">Vendor Name</Text>
            <TextInput value={newVendor} onChangeText={setNewVendor} placeholder="e.g. Taj Caterers" placeholderTextColor={colorScheme === 'dark' ? '#475569' : '#cbd5e1'} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 font-medium text-slate-900 dark:text-white mb-4" />
            
            <View className="flex-row gap-x-3 mb-4">
              <View className="flex-1">
                <Text className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">Total Amount</Text>
                <TextInput value={newTotal} onChangeText={setNewTotal} keyboardType="numeric" placeholder="50000" placeholderTextColor={colorScheme === 'dark' ? '#475569' : '#cbd5e1'} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 font-medium text-slate-900 dark:text-white" />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">Paid Already</Text>
                <TextInput value={newPaid} onChangeText={setNewPaid} keyboardType="numeric" placeholder="10000" placeholderTextColor={colorScheme === 'dark' ? '#475569' : '#cbd5e1'} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 font-medium text-slate-900 dark:text-white" />
              </View>
            </View>

            <TouchableOpacity onPress={addBudgetItem} className="w-full bg-slate-900 dark:bg-indigo-600 py-3 rounded-xl items-center shadow-lg">
              <Text className="text-white font-bold">Save Invoice Record</Text>
            </TouchableOpacity>
          </View>
        )}

        {items.length === 0 && !showAddForm ? (
          <View className="mx-6 py-10 items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
            <Feather name="inbox" size={32} color="#cbd5e1" />
            <Text className="text-slate-400 font-bold mt-3">No expenses tracked yet.</Text>
          </View>
        ) : (
          items.map(item => {
            const isFullyPaid = item.paid_amount >= item.total_amount;
            return (
              <View key={item.id} className="mx-6 mb-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex-row justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-colors">
                <View className="flex-1 mr-4">
                  <View className="flex-row items-center mb-1">
                    <View className="w-2 h-2 rounded-full mr-2 bg-indigo-500" />
                    <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.category}</Text>
                  </View>
                  <Text className="text-slate-900 dark:text-white font-black text-base">{item.vendor_name}</Text>
                </View>

                <View className="items-end justify-center">
                  <Text className="text-slate-900 dark:text-white font-black text-base">₹{item.total_amount.toLocaleString()}</Text>
                  <View className={`px-2 py-0.5 rounded-full mt-1 ${isFullyPaid ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                    <Text className={`text-[10px] font-bold ${isFullyPaid ? 'text-emerald-700' : 'text-amber-700 dark:text-amber-400'}`}>
                      {isFullyPaid ? 'Settled' : `₹${item.paid_amount} Paid`}
                    </Text>
                  </View>
                </View>
                
                {/* Delete Button */}
                <TouchableOpacity onPress={() => deleteItem(item.id)} className="ml-4 justify-center">
                  <Feather name="trash-2" size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
