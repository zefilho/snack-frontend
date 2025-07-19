
"use client";

import type { Annotation, OrderItem, MenuItem, Customer } from '@/types';
import { ConcreteAnnotation, ConcreteOrderItem } from '@/types';
import { annotationsApi } from '@/services/api';
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useSales } from './SalesContext';

interface AnnotationsContextType {
  annotations: Annotation[];
  addAnnotation: (customer: Pick<Customer, 'id' | 'name'>) => Promise<Annotation>;
  addItemToAnnotation: (annotationId: string, menuItem: MenuItem, quantity: number) => Promise<void>;
  closeAnnotation: (annotationId: string, paymentMethod: string) => Promise<void>;
  getAnnotationById: (annotationId: string) => Annotation | undefined;
  loading: boolean;
  error: string | null;
  refreshAnnotations: () => Promise<void>;
}

const AnnotationsContext = createContext<AnnotationsContextType | undefined>(undefined);

export const AnnotationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addTransaction } = useSales();

  const refreshAnnotations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await annotationsApi.getAll();
      
      // Converter dados da API para objetos ConcreteAnnotation
      const convertedAnnotations = data.map(apiAnnotation => {
        const annotation = new ConcreteAnnotation(
          apiAnnotation.id,
          apiAnnotation.customer_id,
          apiAnnotation.customer_name
        );
        
        annotation.status = apiAnnotation.status;
        annotation.createdAt = new Date(apiAnnotation.created_at);
        if (apiAnnotation.closed_at) {
          annotation.closedAt = new Date(apiAnnotation.closed_at);
        }
        
        // Converter itens
        annotation.items = apiAnnotation.items?.map((item: any) => 
          new ConcreteOrderItem(
            {
              id: item.menu_item.id,
              name: item.menu_item.name,
              price: item.unit_price,
              category: item.menu_item.category
            },
            item.quantity
          )
        ) || [];
        
        return annotation;
      });
      
      setAnnotations(convertedAnnotations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar anotações');
      console.error('Erro ao carregar anotações:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addAnnotation = useCallback(async (customer: Pick<Customer, 'id' | 'name'>): Promise<Annotation> => {
    try {
      setError(null);
      const apiAnnotation = await annotationsApi.create({
        customer_id: customer.id,
        customer_name: customer.name
      });
      
      const newAnnotation = new ConcreteAnnotation(
        apiAnnotation.id,
        apiAnnotation.customer_id,
        apiAnnotation.customer_name
      );
      newAnnotation.status = apiAnnotation.status;
      newAnnotation.createdAt = new Date(apiAnnotation.created_at);
      
      setAnnotations(prevAnnotations => [...prevAnnotations, newAnnotation]);
      return newAnnotation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar anotação');
      throw err;
    }
  }, []);

  const addItemToAnnotation = useCallback(async (annotationId: string, menuItem: MenuItem, quantity: number) => {
    try {
      setError(null);
      const updatedApiAnnotation = await annotationsApi.addItem(annotationId, {
        menu_item_id: menuItem.id,
        quantity
      });
      
      // Atualizar a anotação local com os dados da API
      setAnnotations(prevAnnotations =>
        prevAnnotations.map(annotation => {
          if (annotation.id === annotationId) {
            const updatedAnnotation = new ConcreteAnnotation(
              updatedApiAnnotation.id,
              updatedApiAnnotation.customer_id,
              updatedApiAnnotation.customer_name
            );
            
            updatedAnnotation.status = updatedApiAnnotation.status;
            updatedAnnotation.createdAt = new Date(updatedApiAnnotation.created_at);
            if (updatedApiAnnotation.closed_at) {
              updatedAnnotation.closedAt = new Date(updatedApiAnnotation.closed_at);
            }
            
            updatedAnnotation.items = updatedApiAnnotation.items?.map((item: any) => 
              new ConcreteOrderItem(
                {
                  id: item.menu_item.id,
                  name: item.menu_item.name,
                  price: item.unit_price,
                  category: item.menu_item.category
                },
                item.quantity
              )
            ) || [];
            
            return updatedAnnotation;
          }
          return annotation;
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar item à anotação');
      throw err;
    }
  }, []);

  const closeAnnotation = useCallback(async (annotationId: string, paymentMethod: string) => {
    try {
      setError(null);
      const result = await annotationsApi.close(annotationId, paymentMethod);
      
      // Atualizar a anotação local
      setAnnotations(prevAnnotations =>
        prevAnnotations.map(annotation => {
          if (annotation.id === annotationId) {
            const updatedAnnotation = new ConcreteAnnotation(
              result.annotation.id,
              result.annotation.customer_id,
              result.annotation.customer_name
            );
            
            updatedAnnotation.status = result.annotation.status;
            updatedAnnotation.createdAt = new Date(result.annotation.created_at);
            updatedAnnotation.closedAt = new Date(result.annotation.closed_at);
            updatedAnnotation.items = annotation.items; // Manter os itens existentes
            
            return updatedAnnotation;
          }
          return annotation;
        })
      );
      
      // Adicionar transação ao contexto de vendas
      if (result.transaction) {
        const annotationToClose = annotations.find(a => a.id === annotationId);
        if (annotationToClose) {
          addTransaction({
            items: annotationToClose.items,
            totalAmount: annotationToClose.totalAmount,
            annotationId: annotationToClose.id,
            paymentMethod: paymentMethod,
          });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fechar anotação');
      throw err;
    }
  }, [annotations, addTransaction]);
  
  const getAnnotationById = useCallback((annotationId: string) => {
    return annotations.find(annotation => annotation.id === annotationId);
  }, [annotations]);

  // Carregar anotações na inicialização
  useEffect(() => {
    refreshAnnotations();
  }, [refreshAnnotations]);

  return (
    <AnnotationsContext.Provider value={{ 
      annotations, 
      addAnnotation, 
      addItemToAnnotation, 
      closeAnnotation, 
      getAnnotationById,
      loading,
      error,
      refreshAnnotations
    }}>
      {children}
    </AnnotationsContext.Provider>
  );
};

export const useAnnotations = (): AnnotationsContextType => {
  const context = useContext(AnnotationsContext);
  if (!context) {
    throw new Error('useAnnotations must be used within an AnnotationsProvider');
  }
  return context;
};
