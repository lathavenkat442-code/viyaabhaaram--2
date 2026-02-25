export type TransactionType = 'INCOME' | 'EXPENSE';

export interface SizeStock {
  size: string;
  quantity: number;
  color?: string;
  sleeve?: string;
}

export interface StockVariant {
  id: string;
  imageUrl: string;
  imageFile?: File;
  sizeStocks: SizeStock[];
}

export interface StockItem {
  id: string;
  name: string;
  price: number;
  category: string;
  variants: StockVariant[];
  lastUpdated: number;
  user_id?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  partyName: string;
  date: number;
  user_id?: string;
}

export interface User {
  uid: string;
  email: string;
  name: string;
  avatar?: string;
  isLoggedIn: boolean;
}
