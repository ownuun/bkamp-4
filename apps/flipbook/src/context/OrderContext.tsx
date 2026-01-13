'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface OrderData {
  // Video
  videoFile: File | null;
  videoUrl: string;

  // Customer info
  customerName: string;
  customerPhone: string;
  customerEmail: string;

  // Shipping info
  recipientName: string;
  recipientPhone: string;
  addressZipcode: string;
  addressMain: string;
  addressDetail: string;
  deliveryMemo: string;

  // Gift options
  isGift: boolean;
  giftMessage: string;

  // Order result
  orderNumber: string;
}

interface OrderContextType {
  orderData: OrderData;
  updateOrderData: (data: Partial<OrderData>) => void;
  resetOrderData: () => void;
}

const initialOrderData: OrderData = {
  videoFile: null,
  videoUrl: '',
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  recipientName: '',
  recipientPhone: '',
  addressZipcode: '',
  addressMain: '',
  addressDetail: '',
  deliveryMemo: '',
  isGift: false,
  giftMessage: '',
  orderNumber: '',
};

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orderData, setOrderData] = useState<OrderData>(initialOrderData);

  const updateOrderData = (data: Partial<OrderData>) => {
    setOrderData((prev) => ({ ...prev, ...data }));
  };

  const resetOrderData = () => {
    setOrderData(initialOrderData);
  };

  return (
    <OrderContext.Provider value={{ orderData, updateOrderData, resetOrderData }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
}
