export interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
}

export interface Product {
  _id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  stock: number
  rating: number
}

export interface ProductList {
  products: Product[]
  page: number
  pages: number
  total: number
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface ShippingAddress {
  fullName: string
  address: string
  city: string
  postalCode: string
  country: string
}

export type PaymentMethod = 'card' | 'paypal' | 'cod'

export interface Order {
  _id: string
  items: { product: string; name: string; image: string; price: number; quantity: number }[]
  shippingAddress: ShippingAddress
  paymentMethod: PaymentMethod
  itemsPrice: number
  shippingPrice: number
  taxPrice: number
  totalPrice: number
  isPaid: boolean
  status: string
  createdAt: string
}
