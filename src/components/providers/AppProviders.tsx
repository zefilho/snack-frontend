
"use client";

import { MenuProvider } from '@/contexts/MenuContext';
import { SalesProvider } from '@/contexts/SalesContext';
import { AnnotationsProvider } from '@/contexts/AnnotationsContext';
import { CustomersProvider } from '@/contexts/CustomersContext';
import { TabsProvider } from '@/contexts/TabsContext';
import React from 'react';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <CustomersProvider>
      <MenuProvider>
        <SalesProvider>
          <AnnotationsProvider>
            <TabsProvider>
              {children}
            </TabsProvider>
          </AnnotationsProvider>
        </SalesProvider>
      </MenuProvider>
    </CustomersProvider>
  );
};
