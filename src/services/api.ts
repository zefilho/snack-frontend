// Configuração base da API
//const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 
  //(process.env.NODE_ENV === 'production' ? '/api' : 'http://backend:5000/api');

//const API_BASE_URL = 'https://ogh5izce7v7v.manus.space/api'
const API_BASE_URL = 'https://resgatame.kindstone-e3510d40.eastus2.azurecontainerapps.io/api'

// Função auxiliar para fazer requisições
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
}

// Serviços para Clientes
export const customersApi = {
  getAll: () => apiRequest<any[]>('/customers'),
  
  create: (customer: { name: string; phone: string }) =>
    apiRequest<any>('/customers', {
      method: 'POST',
      body: JSON.stringify(customer),
    }),
  
  getById: (id: string) => apiRequest<any>(`/customers/${id}`),
  
  update: (id: string, customer: Partial<{ name: string; phone: string }>) =>
    apiRequest<any>(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customer),
    }),
  
  delete: (id: string) =>
    apiRequest<{ message: string }>(`/customers/${id}`, {
      method: 'DELETE',
    }),
};

// Serviços para Itens do Menu
export const menuItemsApi = {
  getAll: (activeOnly = true) => 
    apiRequest<any[]>(`/menu-items?active_only=${activeOnly}`),
  
  create: (item: { name: string; price: number; category: string }) =>
    apiRequest<any>('/menu-items', {
      method: 'POST',
      body: JSON.stringify(item),
    }),
  
  getById: (id: string) => apiRequest<any>(`/menu-items/${id}`),
  
  update: (id: string, item: Partial<{ name: string; price: number; category: string; is_active: boolean }>) =>
    apiRequest<any>(`/menu-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    }),
  
  delete: (id: string) =>
    apiRequest<{ message: string }>(`/menu-items/${id}`, {
      method: 'DELETE',
    }),
  
  getCategories: () => apiRequest<string[]>('/menu-items/categories'),
};

// Serviços para Anotações
export const annotationsApi = {
  getAll: (status?: string) => {
    const params = status ? `?status=${status}` : '';
    return apiRequest<any[]>(`/annotations${params}`);
  },
  
  create: (annotation: { customer_id: string; customer_name: string }) =>
    apiRequest<any>('/annotations', {
      method: 'POST',
      body: JSON.stringify(annotation),
    }),
  
  getById: (id: string) => apiRequest<any>(`/annotations/${id}`),
  
  addItem: (annotationId: string, item: { menu_item_id: string; quantity: number }) =>
    apiRequest<any>(`/annotations/${annotationId}/items`, {
      method: 'POST',
      body: JSON.stringify(item),
    }),
  
  close: (annotationId: string, paymentMethod: string) =>
    apiRequest<{ annotation: any; transaction: any }>(`/annotations/${annotationId}/close`, {
      method: 'POST',
      body: JSON.stringify({ payment_method: paymentMethod }),
    }),
  
  delete: (id: string) =>
    apiRequest<{ message: string }>(`/annotations/${id}`, {
      method: 'DELETE',
    }),
};

// Serviços para Transações/Vendas
export const transactionsApi = {
  getAll: (params?: {
    start_date?: string;
    end_date?: string;
    payment_method?: string;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const queryString = searchParams.toString();
    return apiRequest<any[]>(`/transactions${queryString ? `?${queryString}` : ''}`);
  },
  
  create: (transaction: {
    items: Array<{ menu_item_id: string; quantity: number; unit_price: number }>;
    total_amount: number;
    payment_method?: string;
    annotation_id?: string;
  }) =>
    apiRequest<any>('/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    }),
  
  getById: (id: string) => apiRequest<any>(`/transactions/${id}`),
  
  getDailyStats: () => apiRequest<{
    date: string;
    total_revenue: number;
    total_orders: number;
    average_order_value: number;
    payment_methods: Record<string, number>;
    transactions: any[];
  }>('/transactions/stats/daily'),
  
  getPeriodStats: (startDate: string, endDate: string) =>
    apiRequest<{
      start_date: string;
      end_date: string;
      total_revenue: number;
      total_orders: number;
      average_order_value: number;
      daily_stats: Record<string, { revenue: number; orders: number }>;
    }>(`/transactions/stats/period?start_date=${startDate}&end_date=${endDate}`),
  
  delete: (id: string) =>
    apiRequest<{ message: string }>(`/transactions/${id}`, {
      method: 'DELETE',
    }),
};

export default {
  customers: customersApi,
  menuItems: menuItemsApi,
  annotations: annotationsApi,
  transactions: transactionsApi,
};

