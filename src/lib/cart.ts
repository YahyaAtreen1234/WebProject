// Cart utilities for managing shopping cart with localStorage persistence

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  color?: string;
  weight?: string;
  origin?: string;
}

export interface Cart {
  items: CartItem[];
  lastUpdated: string;
}

const CART_STORAGE_KEY = 'stonesland_cart';

export const cartUtils = {
  // Get cart from localStorage
  getCart: (): Cart => {
    if (typeof window === 'undefined') {
      return { items: [], lastUpdated: new Date().toISOString() };
    }

    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : { items: [], lastUpdated: new Date().toISOString() };
    } catch (error) {
      console.error('Error reading cart from localStorage:', error);
      return { items: [], lastUpdated: new Date().toISOString() };
    }
  },

  // Save cart to localStorage
  saveCart: (cart: Cart): void => {
    if (typeof window === 'undefined') return;

    try {
      cart.lastUpdated = new Date().toISOString();
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  },

  // Add item to cart
  addItem: (item: Omit<CartItem, 'quantity'>, quantity: number = 1): Cart => {
    const cart = cartUtils.getCart();
    const existingItem = cart.items.find((i) => i.id === item.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ ...item, quantity });
    }

    cartUtils.saveCart(cart);
    return cart;
  },

  // Remove item from cart
  removeItem: (itemId: string): Cart => {
    const cart = cartUtils.getCart();
    cart.items = cart.items.filter((i) => i.id !== itemId);
    cartUtils.saveCart(cart);
    return cart;
  },

  // Update item quantity
  updateQuantity: (itemId: string, quantity: number): Cart => {
    const cart = cartUtils.getCart();
    const item = cart.items.find((i) => i.id === itemId);

    if (item) {
      if (quantity <= 0) {
        cart.items = cart.items.filter((i) => i.id !== itemId);
      } else {
        item.quantity = quantity;
      }
    }

    cartUtils.saveCart(cart);
    return cart;
  },

  // Clear entire cart
  clearCart: (): Cart => {
    const emptyCart: Cart = { items: [], lastUpdated: new Date().toISOString() };
    cartUtils.saveCart(emptyCart);
    return emptyCart;
  },

  // Get cart totals
  getCartTotals: (cart?: Cart) => {
    const activeCart = cart || cartUtils.getCart();
    const subtotal = activeCart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = activeCart.items.reduce((sum, item) => sum + item.quantity, 0);
    const tax = subtotal * 0.08; // 8% tax
    const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const total = subtotal + tax + shipping;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      shipping,
      total: Math.round(total * 100) / 100,
      itemCount,
    };
  },

  // Check if item is in cart
  isInCart: (itemId: string): boolean => {
    const cart = cartUtils.getCart();
    return cart.items.some((i) => i.id === itemId);
  },

  // Get item quantity
  getItemQuantity: (itemId: string): number => {
    const cart = cartUtils.getCart();
    const item = cart.items.find((i) => i.id === itemId);
    return item?.quantity || 0;
  },
};
