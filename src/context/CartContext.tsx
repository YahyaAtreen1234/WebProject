'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { cartUtils, type Cart, type CartItem } from '@/lib/cart';

interface CartContextType {
  cart: Cart;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getItemCount: () => number;
  isInCart: (itemId: string) => boolean;
  getItemQuantity: (itemId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<Cart>({ items: [], lastUpdated: new Date().toISOString() });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = cartUtils.getCart();
    setCart(savedCart);
    setIsLoaded(true);
  }, []);

  const addItem = (item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    const updatedCart = cartUtils.addItem(item, quantity);
    setCart(updatedCart);
  };

  const removeItem = (itemId: string) => {
    const updatedCart = cartUtils.removeItem(itemId);
    setCart(updatedCart);
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    const updatedCart = cartUtils.updateQuantity(itemId, quantity);
    setCart(updatedCart);
  };

  const clearCart = () => {
    const emptyCart = cartUtils.clearCart();
    setCart(emptyCart);
  };

  const getCartTotal = (): number => {
    return cartUtils.getCartTotals(cart).total;
  };

  const getItemCount = (): number => {
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const isInCart = (itemId: string): boolean => {
    return cart.items.some((i) => i.id === itemId);
  };

  const getItemQuantity = (itemId: string): number => {
    const item = cart.items.find((i) => i.id === itemId);
    return item?.quantity || 0;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getCartTotal,
        getItemCount,
        isInCart,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
