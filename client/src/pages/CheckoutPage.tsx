import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { errorMessage } from '../api/client'
import Alert from '../components/Alert'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import type { Order, PaymentMethod, ShippingAddress } from '../types'

export default function CheckoutPage() {
  const { user } = useAuth()
  const { items, subtotal, refresh } = useCart()
  const navigate = useNavigate()
  const [address, setAddress] = useState<ShippingAddress>({
    fullName: user?.name ?? '', address: '', city: '', postalCode: '', country: '',
  })
  const [method, setMethod] = useState<PaymentMethod>('card')
  const [cardNumber, setCardNumber] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const shipping = subtotal >= 100 ? 0 : 9.99
  const tax = Math.round(subtotal * 0.08 * 100) / 100
  const total = subtotal + shipping + tax

  if (items.length === 0)
    return <div className="text-center py-5"><h4>Nothing to check out</h4><Link to="/" className="btn btn-primary mt-2">Shop</Link></div>

  const field = (key: keyof ShippingAddress, label: string, col = 'col-md-6') => (
    <div className={col}>
      <label className="form-label">{label}</label>
      <input className="form-control" required value={address[key]}
        onChange={(e) => setAddress({ ...address, [key]: e.target.value })} />
    </div>
  )

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      const { data } = await api.post<Order>('/orders', { shippingAddress: address, paymentMethod: method, cardNumber })
      await refresh()
      navigate(`/orders/${data._id}`, { state: { placed: true } })
    } catch (err) {
      setError(errorMessage(err))
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="row g-4">
      <div className="col-lg-8">
        <h3>Checkout</h3>
        <Alert message={error} />
        <div className="card mb-3"><div className="card-body">
          <h5 className="mb-3">Shipping address</h5>
          <div className="row g-3">
            {field('fullName', 'Full name', 'col-12')}
            {field('address', 'Address', 'col-12')}
            {field('city', 'City')}
            {field('postalCode', 'Postal code')}
            {field('country', 'Country', 'col-12')}
          </div>
        </div></div>
        <div className="card"><div className="card-body">
          <h5 className="mb-3">Payment method</h5>
          {([['card', 'Credit / debit card'], ['paypal', 'PayPal'], ['cod', 'Cash on delivery']] as const).map(([v, label]) => (
            <div className="form-check" key={v}>
              <input className="form-check-input" type="radio" id={v} checked={method === v} onChange={() => setMethod(v)} />
              <label className="form-check-label" htmlFor={v}>{label}</label>
            </div>
          ))}
          {method === 'card' && (
            <div className="mt-3">
              <label className="form-label">Card number</label>
              <input className="form-control" required inputMode="numeric" placeholder="4242 4242 4242 4242"
                value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
              <div className="form-text">Demo gateway — no real charge. Use a number ending in 0000 to simulate a decline.</div>
            </div>
          )}
        </div></div>
      </div>
      <div className="col-lg-4">
        <div className="card"><div className="card-body">
          <h5>Order summary</h5>
          {items.map(({ product, quantity }) => (
            <div key={product._id} className="d-flex justify-content-between small">
              <span>{product.name} × {quantity}</span><span>${(product.price * quantity).toFixed(2)}</span>
            </div>
          ))}
          <hr />
          <div className="d-flex justify-content-between"><span>Items</span><span>${subtotal.toFixed(2)}</span></div>
          <div className="d-flex justify-content-between"><span>Shipping</span><span>{shipping ? `$${shipping.toFixed(2)}` : 'Free'}</span></div>
          <div className="d-flex justify-content-between"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
          <hr />
          <div className="d-flex justify-content-between fw-bold"><span>Total</span><span>${total.toFixed(2)}</span></div>
          <button className="btn btn-success w-100 mt-3" disabled={busy}>{busy ? 'Processing…' : 'Place order'}</button>
        </div></div>
      </div>
    </form>
  )
}
