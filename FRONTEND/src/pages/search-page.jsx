import { MapPin, Zap } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { EmptyState, ShopCard } from '../components/storefront'
import { PageTransition, QuickPill, SearchBar, SectionHead } from '../components/ui'
import { nearbyShops, quickSearches } from '../data/storefrontData'

function matchesQuery(item, normalizedQuery) {
  if (!normalizedQuery) return true

  return [
    item.name,
    item.category,
    item.products,
    ...(item.keywords ?? []),
  ]
    .join(' ')
    .toLowerCase()
    .includes(normalizedQuery)
}

export function SearchPage() {
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState(() => params.get('q') || '')
  const normalizedQuery = query.trim().toLowerCase()

  const visibleShops = useMemo(
    () => nearbyShops.filter((item) => matchesQuery(item, normalizedQuery)),
    [normalizedQuery],
  )

  const applySearch = (nextQuery = query) => {
    const value = nextQuery.trim()
    setQuery(value)
    setParams(value ? { q: value } : {})
  }

  return (
    <PageTransition className="page-shell">
      <section className="hero hero--compact">
        <div className="container hero__inner">
          <div className="hero__location">
            <MapPin size={16} strokeWidth={2} />
            <span>Koramangala, Bangalore</span>
            <button type="button">Change</button>
          </div>

          <SectionHead
            eyebrow="Nearby Search"
            title="Shops Around You"
            note="Compare nearby availability, ratings, and product counts in one clean view."
          />

          <SearchBar
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onSubmit={(event) => {
              event.preventDefault()
              applySearch()
            }}
            placeholder="Search nearby essentials, products, and shops..."
          />

          <div className="pill-row">
            {quickSearches.map((item) => (
              <QuickPill key={item} active={query === item} onClick={() => applySearch(item)}>
                {item}
              </QuickPill>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <SectionHead eyebrow="Discovery" title="Available Nearby" action={<Zap size={16} />} />
          <div className="shop-grid">
            {visibleShops.length ? (
              visibleShops.map((item) => <ShopCard key={item.id} item={item} />)
            ) : (
              <EmptyState query={query || 'your search'} />
            )}
          </div>
        </div>
      </section>
    </PageTransition>
  )
}
