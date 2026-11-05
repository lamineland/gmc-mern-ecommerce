/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import api from '../api/client'
import { useAuth } from './AuthContext'
import type { CartItem } from '../types'

interface CartState {
  items: CartItem[]
  count: number
  subtotal: number
  addItem: (productId: string, quantity?: number) => Promise<void>
  updateItem: (productId: string, quantity: number) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  clear: () => Promise<void>
  refresh: () => Promise<void>
}

const CartContext = createContext<CartState | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])

  const refresh = useCallback(async () => {
    const { data } = await api.get<{ items: CartItem[] }>('/cart')
    setItems(data.items)
  }, [])

  useEffect(() => {
    if (!user) {
      setItems([])
      return
    }
    refresh().catch(() => setItems([]))
  }, [user, refresh])

  const run = useCallback(async (req: Promise<{ data: { items: CartItem[] } }>) => {
    const { data } = await req
    setItems(data.items)
  }, [])

  const value = useMemo<CartState>(
    () => ({
      items,
      count: items.reduce((n, i) => n + i.quantity, 0),
      subtotal: items.reduce((s, i) => s + i.quantity * i.product.price, 0),
      addItem: (productId, quantity = 1) => run(api.post('/cart/items', { productId, quantity })),
      updateItem: (productId, quantity) => run(api.put(`/cart/items/${productId}`, { quantity })),
      removeItem: (productId) => run(api.delete(`/cart/items/${productId}`)),
      clear: () => run(api.delete('/cart')),
      refresh,
    }),
    [items, run, refresh],
  )
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartState {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
