
"use client";

import type { MenuItem } from '@/types';
import { menuItemsApi } from '@/services/api';
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface MenuContextType {
  menuItems: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id'>) => Promise<void>;
  removeMenuItem: (itemId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  refreshMenuItems: () => Promise<void>;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const MenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await menuItemsApi.getAll();
      setMenuItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar itens do menu');
      console.error('Erro ao carregar itens do menu:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addMenuItem = useCallback(async (item: Omit<MenuItem, 'id'>) => {
    try {
      setError(null);
      const newItem = await menuItemsApi.create(item);
      setMenuItems(prevItems => [...prevItems, newItem]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar item do menu');
      throw err;
    }
  }, []);

  const removeMenuItem = useCallback(async (itemId: string) => {
    try {
      setError(null);
      await menuItemsApi.delete(itemId);
      setMenuItems(prevItems => prevItems.filter(item => item.id !== itemId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover item do menu');
      throw err;
    }
  }, []);

  // Carregar itens do menu na inicialização
  useEffect(() => {
    refreshMenuItems();
  }, [refreshMenuItems]);

  return (
    <MenuContext.Provider value={{ 
      menuItems, 
      addMenuItem, 
      removeMenuItem, 
      loading, 
      error, 
      refreshMenuItems 
    }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = (): MenuContextType => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
};
