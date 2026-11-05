import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api, { errorMessage } from '../api/client'
import Alert from '../components/Alert'
import Stars from '../components/Stars'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import type { Product } from '../types'

export default function ProductPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { addItem } = useCart()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [qty, setQty] = useState(1)
  const [error, setError] = useState('')
  const [added, setAdded] = useState(false)

  useEffect(() => {
    api.get<Product>(`/products/${id}`).then((r) => setProduct(r.data)).catch((e) => setError(errorMessage(e)))
  }, [id])

  async function add() {
    if (!product) return
    if (!user) return navigate('/login', { state: { from: `/products/${product._id}` } })
    try {
      await addItem(product._id, qty)
      setAdded(true); setError('')
    } catch (e) {
      setError(errorMessage(e)); setAdded(false)
    }
  }

  if (!product) return error ? <Alert message={error} /> : <div className="text-center py-5">Loading…</div>

  return (
    <div className="row g-4">
      <div className="col-md-5"><img src={product.image} alt={product.name} className="img-fluid rounded" /></div>
      <div className="col-md-7">
        <Link to="/" className="small">← Back to shop</Link>
        <h2 className="mt-2">{product.name}</h2>
        <span className="badge text-bg-light">{product.category}</span>
        <div className="my-2"><Stars value={product.rating} /></div>
        <h3 className="text-primary">${product.price.toFixed(2)}</h3>
        <p>{product.description}</p>
        <p className={product.stock > 0 ? 'text-success' : 'text-danger'}>
          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
        </p>
        {product.stock > 0 && (
          <div className="d-flex gap-2 align-items-center">
            <input type="number" className="form-control" style={{ width: 90 }} min={1} max={product.stock} value={qty}
              onChange={(e) => setQty(Math.max(1, Math.min(product.stock, Number(e.target.value) || 1)))} />
            <button className="btn btn-primary" onClick={add}>Add to cart</button>
          </div>
        )}
        <div className="mt-3">
          <Alert message={error} />
          {added && <Alert type="success" message="Added to cart. " />}
          {added && <Link to="/cart">View cart →</Link>}
        </div>
      </div>
    </div>
  )
}
