import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { errorMessage } from '../api/client'
import Alert from '../components/Alert'
import { useCart } from '../context/CartContext'

export default function CartPage() {
  const { items, subtotal, updateItem, removeItem } = useCart()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const act = (fn: () => Promise<void>) => fn().then(() => setError('')).catch((e) => setError(errorMessage(e)))

  if (items.length === 0)
    return (
      <div className="text-center py-5">
        <h4>Your cart is empty</h4>
        <Link to="/" className="btn btn-primary mt-2">Continue shopping</Link>
      </div>
    )

  return (
    <div className="row g-4">
      <div className="col-lg-8">
        <h3 className="mb-3">Shopping Cart</h3>
        <Alert message={error} />
        <ul className="list-group">
          {items.map(({ product, quantity }) => (
            <li key={product._id} className="list-group-item d-flex align-items-center gap-3 flex-wrap">
              <img src={product.image} alt="" className="cart-thumb" />
              <div className="flex-grow-1">
                <Link to={`/products/${product._id}`} className="fw-semibold text-decoration-none">{product.name}</Link>
                <div className="text-muted small">${product.price.toFixed(2)} each</div>
              </div>
              <div className="input-group input-group-sm" style={{ width: 120 }}>
                <button className="btn btn-outline-secondary" disabled={quantity <= 1}
                  onClick={() => act(() => updateItem(product._id, quantity - 1))}>−</button>
                <span className="form-control text-center">{quantity}</span>
                <button className="btn btn-outline-secondary" disabled={quantity >= product.stock}
                  onClick={() => act(() => updateItem(product._id, quantity + 1))}>+</button>
              </div>
              <strong style={{ width: 80 }} className="text-end">${(product.price * quantity).toFixed(2)}</strong>
              <button className="btn btn-sm btn-outline-danger" onClick={() => act(() => removeItem(product._id))}>✕</button>
            </li>
          ))}
        </ul>
      </div>
      <div className="col-lg-4">
        <div className="card">
          <div className="card-body">
            <h5>Order summary</h5>
            <div className="d-flex justify-content-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <small className="text-muted">Shipping and tax are calculated at checkout.</small>
            <button className="btn btn-success w-100 mt-3" onClick={() => navigate('/checkout')}>Proceed to checkout</button>
          </div>
        </div>
      </div>
    </div>
  )
}
