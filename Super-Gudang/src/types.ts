export interface Product {
  name: string;
  sku: string;
  category: string;
  stock: number;
  min: number;
  unit: string;
  location: string;
  price: number;
  supplier: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: 'in' | 'out';
  item: string;
  qty: number;
  unit: string;
  party: string;
  user: string;
  notes?: string;
}

export interface Supplier {
  name: string;
  contact: string;
  phone: string;
  category: string;
  transactions: number;
  status: 'active' | 'inactive';
}

export interface Category {
  name: string;
  icon: string;
  color: string;
  count: number;
}

export interface LocationRack {
  rak: string;
  label: string;
  pct: number;
  color: string;
}
