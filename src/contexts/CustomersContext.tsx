
"use client";

import type { Customer } from '@/types';
import { customersApi } from '@/services/api';
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface CustomersContextType {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id'>) => Promise<void>;
  removeCustomer: (customerId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  refreshCustomers: () => Promise<void>;
}

const CustomersContext = createContext<CustomersContextType | undefined>(undefined);

export const CustomersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await customersApi.getAll();
      setCustomers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar clientes');
      console.error('Erro ao carregar clientes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addCustomer = useCallback(async (customerData: Omit<Customer, 'id'>) => {
    try {
      setError(null);
      const newCustomer = await customersApi.create(customerData);
      setCustomers(prevCustomers => [...prevCustomers, newCustomer]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar cliente');
      throw err;
    }
  }, []);

  const removeCustomer = useCallback(async (customerId: string) => {
    try {
      setError(null);
      await customersApi.delete(customerId);
      setCustomers(prevCustomers => prevCustomers.filter(customer => customer.id !== customerId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover cliente');
      throw err;
    }
  }, []);

  // Carregar clientes na inicialização
  useEffect(() => {
    refreshCustomers();
  }, [refreshCustomers]);

  return (
    <CustomersContext.Provider value={{ 
      customers, 
      addCustomer, 
      removeCustomer, 
      loading, 
      error, 
      refreshCustomers 
    }}>
      {children}
    </CustomersContext.Provider>
  );
};

export const useCustomers = (): CustomersContextType => {
  const context = useContext(CustomersContext);
  if (!context) {
    throw new Error('useCustomers must be used within a CustomersProvider');
  }
  return context;
};
