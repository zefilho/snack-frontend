"use client";

import type { Transaction, OrderItem } from '@/types';
import { transactionsApi } from '@/services/api';
import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

interface SalesContextType {
  transactions: Transaction[];
  addTransaction: (data: Omit<Transaction, 'id' | 'timestamp'>) => Promise<void>;
  dailyRevenue: number;
  totalOrdersToday: number;
  averageOrderValueToday: number;
  loading: boolean;
  error: string | null;
  refreshTransactions: () => Promise<void>;
  refreshDailyStats: () => Promise<void>;
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export const SalesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dailyStats, setDailyStats] = useState({
    dailyRevenue: 0,
    totalOrdersToday: 0,
    averageOrderValueToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await transactionsApi.getAll({ limit: 100 });
      
      // Converter dados da API para objetos Transaction
      const convertedTransactions: Transaction[] = data.map(apiTransaction => ({
        id: apiTransaction.id,
        timestamp: new Date(apiTransaction.timestamp),
        items: apiTransaction.items?.map((item: any) => ({
          menuItem: {
            id: item.menu_item.id,
            name: item.menu_item.name,
            price: item.unit_price,
            category: item.menu_item.category
          },
          quantity: item.quantity,
          get totalPrice() {
            return this.menuItem.price * this.quantity;
          }
        })) || [],
        totalAmount: apiTransaction.total_amount,
        annotationId: apiTransaction.annotation_id,
        paymentMethod: apiTransaction.payment_method
      }));
      
      setTransactions(convertedTransactions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar transações');
      console.error('Erro ao carregar transações:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshDailyStats = useCallback(async () => {
    try {
      const stats = await transactionsApi.getDailyStats();
      setDailyStats({
        dailyRevenue: stats.total_revenue,
        totalOrdersToday: stats.total_orders,
        averageOrderValueToday: stats.average_order_value
      });
    } catch (err) {
      console.error('Erro ao carregar estatísticas diárias:', err);
    }
  }, []);

  const addTransaction = useCallback(async (data: Omit<Transaction, 'id' | 'timestamp'>) => {
    try {
      setError(null);
      
      // Preparar dados para a API
      const transactionData = {
        items: data.items.map(item => ({
          menu_item_id: item.menuItem.id,
          quantity: item.quantity,
          unit_price: item.menuItem.price
        })),
        total_amount: data.totalAmount,
        payment_method: data.paymentMethod,
        annotation_id: data.annotationId
      };
      
      const newApiTransaction = await transactionsApi.create(transactionData);
      
      // Converter para objeto Transaction local
      const newTransaction: Transaction = {
        id: newApiTransaction.id,
        timestamp: new Date(newApiTransaction.timestamp),
        items: data.items,
        totalAmount: data.totalAmount,
        annotationId: data.annotationId,
        paymentMethod: data.paymentMethod
      };
      
      setTransactions(prevTxns => [newTransaction, ...prevTxns]);
      
      // Atualizar estatísticas diárias
      await refreshDailyStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar transação');
      throw err;
    }
  }, [refreshDailyStats]);

  // Carregar dados na inicialização
  useEffect(() => {
    Promise.all([
      refreshTransactions(),
      refreshDailyStats()
    ]);
  }, [refreshTransactions, refreshDailyStats]);

  return (
    <SalesContext.Provider value={{ 
      transactions, 
      addTransaction, 
      dailyRevenue: dailyStats.dailyRevenue,
      totalOrdersToday: dailyStats.totalOrdersToday,
      averageOrderValueToday: dailyStats.averageOrderValueToday,
      loading,
      error,
      refreshTransactions,
      refreshDailyStats
    }}>
      {children}
    </SalesContext.Provider>
  );
};

export const useSales = (): SalesContextType => {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  return context;
};
