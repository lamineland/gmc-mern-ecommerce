import { useEffect, useState } from 'react'
import api, { errorMessage } from '../api/client'
import Alert from '../components/Alert'
import ProductCard from '../components/ProductCard'
import type { ProductList } from '../types'

export default function HomePage() {
  const [data, setData] = useState<ProductList | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState('newest')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    api.get<string[]>('/products/categories').then((r) => setCategories(r.data)).catch(() => {})
  }, [])

  // debounce the search box
  useEffect(() => {
    const t = setTimeout(() => { setQuery(search); setPage(1) }, 350)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api
      .get<ProductList>('/products', {
        params: { search: query, category, sort, minPrice, maxPrice, page, limit: 8 },
      })
      .then((r) => { if (!cancelled) { setData(r.data); setError('') } })
      .catch((e) => { if (!cancelled) setError(errorMessage(e)) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [query, category, sort, minPrice, maxPrice, page])

  const reset = () => {
    setSearch(''); setCategory(''); setSort('newest'); setMinPrice(''); setMaxPrice(''); setPage(1)
  }

  return (
    <>
      <div className="row g-2 mb-4">
        <div className="col-12 col-md-4">
          <input className="form-control" placeholder="Search products…" value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="col-6 col-md-2">
          <select className="form-select" value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1) }}>
            <option value="">All categories</option>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="col-6 col-md-2">
          <select className="form-select" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="price-asc">Price: low → high</option>
            <option value="price-desc">Price: high → low</option>
            <option value="rating">Top rated</option>
          </select>
        </div>
        <div className="col-4 col-md-1">
          <input className="form-control" type="number" min="0" placeholder="Min $" value={minPrice}
            onChange={(e) => { setMinPrice(e.target.value); setPage(1) }} />
        </div>
        <div className="col-4 col-md-1">
          <input className="form-control" type="number" min="0" placeholder="Max $" value={maxPrice}
            onChange={(e) => { setMaxPrice(e.target.value); setPage(1) }} />
        </div>
        <div className="col-4 col-md-2">
          <button className="btn btn-outline-secondary w-100" onClick={reset}>Reset</button>
        </div>
      </div>

      <Alert message={error} />
      {loading && !data && <div className="text-center py-5">Loading…</div>}
      {data && data.products.length === 0 && <p className="text-center text-muted py-5">No products found.</p>}

      <div className={`row g-3 row-cols-2 row-cols-md-3 row-cols-lg-4 ${loading ? 'opacity-50' : ''}`}>
        {data?.products.map((p) => (
          <div className="col" key={p._id}><ProductCard product={p} /></div>
        ))}
      </div>

      {data && data.pages > 1 && (
        <nav className="d-flex justify-content-center align-items-center gap-3 mt-4">
          <button className="btn btn-outline-primary btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>← Prev</button>
          <span>Page {data.page} of {data.pages}</span>
          <button className="btn btn-outline-primary btn-sm" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next →</button>
        </nav>
      )}
    </>
  )
}
