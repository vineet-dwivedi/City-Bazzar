import { motion } from 'framer-motion'
import { MapPin, Star } from 'lucide-react'
import { Link } from 'react-router-dom'

const cardMotion = {
  whileHover: { y: -4 },
  transition: { type: 'spring', stiffness: 240, damping: 24 },
}

export function TrendCard({ item }) {
  return (
    <motion.article className="trend-card" {...cardMotion}>
      <div className="trend-card__media">
        <img src={item.image} alt={item.title} loading="lazy" />
      </div>
      <div className="trend-card__body">
        <div>
          <h3>{item.title}</h3>
          <p>{item.shop}</p>
        </div>
        <div className="trend-card__meta">
          <span>{item.price}</span>
          <span>{item.distance}</span>
        </div>
      </div>
    </motion.article>
  )
}

export function ShopCard({ item }) {
  return (
    <motion.article className={`shop-card ${item.highlight ? 'is-highlight' : ''}`.trim()} {...cardMotion}>
      <div className="shop-card__media">
        <img src={item.image} alt={item.name} loading="lazy" />
        <span className={`shop-badge ${item.statusTone === 'closed' ? 'is-closed' : 'is-open'}`.trim()}>
          {item.status}
        </span>
      </div>

      <div className="shop-card__body">
        <div className="shop-card__head">
          <div>
            <h3>{item.name}</h3>
            <p>{item.category}</p>
          </div>
          <div className="shop-card__rating">
            <Star size={14} fill="currentColor" strokeWidth={1.8} />
            <span>{item.rating}</span>
          </div>
        </div>

        <div className="shop-card__foot">
          <span className="shop-card__distance">
            <MapPin size={14} strokeWidth={2} />
            {item.distance}
          </span>
          <span>{item.products}</span>
        </div>
      </div>
    </motion.article>
  )
}

export function EmptyState({ query }) {
  return (
    <div className="empty-state">
      <h3>No results for "{query}"</h3>
      <p>Try a nearby category, a shorter product name, or one of the suggested searches.</p>
      <Link className="text-link" to="/search">
        Reset search
      </Link>
    </div>
  )
}
