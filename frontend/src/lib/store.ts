'use client';

import type { Product } from './mock-data';
import type { Order } from './mock-data';

export type SessionUser = {
  id: string;
  name: string | null;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
};

export type Session = {
  user: SessionUser;
  accessToken: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

const SESSION_KEY = 'sport_store_session';
const CART_KEY = 'sport_store_cart';
const ORDERS_KEY = 'sport_store_orders';

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;

  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event('sport-store-updated'));
}

export function getSession() {
  return readJson<Session | null>(SESSION_KEY, null);
}

export function saveSession(session: Session) {
  writeJson(SESSION_KEY, session);
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event('sport-store-updated'));
}

export function getCart() {
  return readJson<CartItem[]>(CART_KEY, []);
}

export function saveCart(items: CartItem[]) {
  writeJson(CART_KEY, items);
}

export function addToCart(product: Product, quantity = 1) {
  const items = getCart();
  const index = items.findIndex((item) => item.product.id === product.id || item.product.slug === product.slug);

  if (index >= 0) {
    items[index] = { ...items[index], quantity: items[index].quantity + quantity };
  } else {
    items.push({ product, quantity });
  }

  saveCart(items);
  return items;
}

export function updateCartQuantity(productId: string, quantity: number) {
  const nextItems = getCart()
    .map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    .filter((item) => item.quantity > 0);

  saveCart(nextItems);
  return nextItems;
}

export function removeFromCart(productId: string) {
  const nextItems = getCart().filter((item) => item.product.id !== productId);
  saveCart(nextItems);
  return nextItems;
}

export function clearCart() {
  saveCart([]);
}

export function getLocalOrders() {
  return readJson<Order[]>(ORDERS_KEY, []);
}

export function saveLocalOrder(order: Order) {
  const orders = [order, ...getLocalOrders()];
  writeJson(ORDERS_KEY, orders);
  return orders;
}
