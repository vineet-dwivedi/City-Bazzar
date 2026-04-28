import { MapPin } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TrendCard } from '../components/storefront'
import { PageTransition, QuickPill, SearchBar, SectionHead } from '../components/ui'
import { quickSearches, trendingItems } from '../data/storefrontData'

export function HomePage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const openSearch = (nextQuery = query) => {
    const value = nextQuery.trim()
    navigate(value ? `/search?q=${encodeURIComponent(value)}` : '/search')
  }

  return (
    <PageTransition className="page-shell">
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__location">
            <MapPin size={16} strokeWidth={2} />
            <span>Koramangala, Bangalore</span>
            <button type="button">Change</button>
          </div>

          <SectionHead
            title="Find it nearby, pick it up today"
            note="Discover products from local shops around you. Check availability, reserve instantly, and skip the delivery wait."
          />

          <SearchBar
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onSubmit={(event) => {
              event.preventDefault()
              openSearch()
            }}
            placeholder="Search for products, brands, or shops..."
          />

          <div className="pill-row">
            {quickSearches.map((item) => (
              <QuickPill key={item} onClick={() => openSearch(item)}>
                {item}
              </QuickPill>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <SectionHead eyebrow="Curated" title="Trending Near You" />
          <div className="trend-grid">
            {trendingItems.map((item) => (
              <TrendCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="page-section page-section--soft">
        <div className="container owner-band owner-band--plain">
          <div>
            <p className="section-eyebrow">For Shop Owners</p>
            <h2>Bring your inventory online without losing the feel of a local shop.</h2>
          </div>
          <Link className="text-link" to="/owners">
            See owner flow
          </Link>
        </div>
      </section>
    </PageTransition>
  )
}
