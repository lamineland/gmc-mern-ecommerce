import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { errorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import type { Product } from '../types'
import Stars from './Stars'

export default function ProductCard({ product }: { product: Product }) {
  const { user } = useAuth()
  const { addItem } = useCart()
  const navigate = useNavigate()
  const [msg, setMsg] = useState('')

  async function add() {
    if (!user) return navigate('/login', { state: { from: '/' } })
    try {
      await addItem(product._id)
      setMsg('Added!')
    } catch (e) {
      setMsg(errorMessage(e))
    }
    setTimeout(() => setMsg(''), 2000)
  }

  return (
    <div className="card h-100 product-card">
      <Link to={`/products/${product._id}`}>
        <img src={product.image} alt={product.name} className="card-img-top product-img" loading="lazy" />
      </Link>
      <div className="card-body d-flex flex-column">
        <span className="badge text-bg-light align-self-start mb-1">{product.category}</span>
        <Link to={`/products/${product._id}`} className="text-decoration-none text-dark">
          <h6 className="card-title">{product.name}</h6>
        </Link>
        <Stars value={product.rating} />
        <div className="mt-auto pt-2 d-flex justify-content-between align-items-center">
          <strong>${product.price.toFixed(2)}</strong>
          <button className="btn btn-sm btn-primary" disabled={product.stock === 0} onClick={add}>
            {product.stock === 0 ? 'Sold out' : 'Add to cart'}
          </button>
        </div>
        {msg && <small className="text-muted mt-1">{msg}</small>}
      </div>
    </div>
  )
}
