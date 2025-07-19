
export interface Customer {
  id: string;
  name: string;
  phone: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  get totalPrice(): number;
}

export class ConcreteOrderItem implements OrderItem {
  constructor(public menuItem: MenuItem, public quantity: number) {}

  get totalPrice(): number {
    return this.menuItem.price * this.quantity;
  }
}

export interface Annotation {
  id: string;
  customerName: string;
  customerId: string;
  items: OrderItem[];
  createdAt: Date;
  closedAt?: Date;
  status: 'open' | 'closed' | 'paid';
  get totalAmount(): number;
}

export class ConcreteAnnotation implements Annotation {
  public items: OrderItem[] = [];
  public status: 'open' | 'closed' | 'paid' = 'open';
  public createdAt: Date = new Date();
  public closedAt?: Date;

  constructor(public id: string, public customerId: string, public customerName: string) {}
  
  get totalAmount(): number {
    return this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  }
}


export interface Transaction {
  id: string;
  timestamp: Date;
  items: OrderItem[];
  totalAmount: number;
  annotationId?: string; // Optional: if the sale originated from an annotation
  paymentMethod?: string; // e.g., 'cash', 'card'
}


export interface CustomerTab {
  id: string;
  name: string;
  items: OrderItem[];
  createdAt: Date;
  status: 'open' | 'closed' | 'paid';
  get totalAmount(): number;
}

export class ConcreteCustomerTab implements CustomerTab {
  public items: OrderItem[] = [];
  public createdAt: Date = new Date();
  public status: 'open' | 'closed' | 'paid' = 'open';

  constructor(public id: string, public name: string) {}

  get totalAmount(): number {
    return this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  }
}


