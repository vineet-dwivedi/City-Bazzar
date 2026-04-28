import { ArrowRight, Clock3, MapPin, Navigation, Phone, Store } from 'lucide-react'
import { Button, Chip, SearchField, SectionHead, StatusBadge, Surface } from '../components/ui'
import { homeData, pickupData, searchData, shopData } from '../data/mockData'

function HomeScreen({ navigate }) {
  return (
    <div className="screen-grid">
      <section className="hero-panel surface" data-animate>
        <div>
          <p className="eyebrow">discover nearby stock before you step out</p>
          <h1>Search local shops like a fast, practical marketplace.</h1>
          <p className="hero-copy">
            Pickup-first discovery for groceries, pharmacy runs, stationery, and daily essentials.
          </p>
        </div>

        <div className="hero-search">
          <SearchField placeholder="Search toothpaste, notebooks, shampoo..." />
          <div className="hero-meta">
            <Chip active>{homeData.location}</Chip>
            <Chip>Pickup in 15-20 min</Chip>
          </div>
          <Button onClick={() => navigate('results')}>Search nearby</Button>
        </div>
      </section>

      <Surface className="span-8" data-animate>
        <SectionHead title="Quick categories" note="Built for compact daily discovery." />
        <div className="chip-row">
          {homeData.categories.map((item, index) => (
            <Chip key={item} active={index === 0}>
              {item}
            </Chip>
          ))}
        </div>
        <div className="recent-row">
          {homeData.recent.map((item) => (
            <button key={item} className="recent-pill" type="button">
              {item}
            </button>
          ))}
        </div>
      </Surface>

      <Surface className="span-4" data-animate>
        <SectionHead title="Why it works" />
        <div className="stack-list">
          <div className="stack-item">
            <MapPin size={16} />
            <div>
              <strong>Nearby first</strong>
              <p>Distance is always visible for faster decisions.</p>
            </div>
          </div>
          <div className="stack-item">
            <Store size={16} />
            <div>
              <strong>Real shop inventory</strong>
              <p>Practical pickup flow, no delivery dependency.</p>
            </div>
          </div>
          <div className="stack-item">
            <Clock3 size={16} />
            <div>
              <strong>Fast comparison</strong>
              <p>Price and stock stay in the same visual line.</p>
            </div>
          </div>
        </div>
      </Surface>

      <Surface className="span-12" data-animate>
        <SectionHead title="Nearby popular right now" action={<Button tone="ghost" onClick={() => navigate('results')}>Open results</Button>} />
        <div className="product-grid">
          {homeData.popular.map((item) => (
            <article key={item.title} className="product-card">
              <div className="thumb-box">{item.title.slice(0, 1)}</div>
              <div className="product-meta">
                <h4>{item.title}</h4>
                <p>{item.shop}</p>
                <div className="product-stats">
                  <span>{item.distance}</span>
                  <StatusBadge tone={item.tone}>{item.stock}</StatusBadge>
                  <strong>{item.price}</strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Surface>
    </div>
  )
}

function ResultsScreen({ navigate }) {
  return (
    <div className="screen-grid">
      <Surface className="span-12 sticky-search" data-animate>
        <div className="search-toolbar">
          <SearchField placeholder={searchData.query} />
          <div className="chip-row">
            <Chip active>{homeData.location}</Chip>
            <Chip>{searchData.radius}</Chip>
            <Chip>Sort: nearest</Chip>
          </div>
        </div>
      </Surface>

      {searchData.results.map((group) => (
        <Surface className="span-12" key={group.product} data-animate>
          <SectionHead title={group.product} note="Compare nearby availability at a glance." />
          <div className="shop-compare">
            {group.shops.map((shop) => (
              <article key={`${group.product}-${shop.shop}`} className="shop-card">
                <div>
                  <h4>{shop.shop}</h4>
                  <p>{shop.distance}</p>
                </div>
                <StatusBadge tone={shop.tone}>{shop.stock}</StatusBadge>
                <strong>{shop.price}</strong>
                <Button tone="secondary" onClick={() => navigate('shop')}>
                  View shop
                </Button>
              </article>
            ))}
          </div>
        </Surface>
      ))}
    </div>
  )
}

function ShopScreen({ navigate }) {
  return (
    <div className="screen-grid">
      <Surface className="span-8" data-animate>
        <div className="shop-hero">
          <div>
            <p className="eyebrow">{shopData.type}</p>
            <h1>{shopData.name}</h1>
            <p>{shopData.address}</p>
          </div>
          <div className="hero-meta">
            <Chip active>{shopData.distance}</Chip>
            <Chip>{shopData.area}</Chip>
          </div>
        </div>

        <div className="trust-list">
          {shopData.trust.map((item) => (
            <div key={item} className="trust-item">
              <ArrowRight size={14} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </Surface>

      <Surface className="span-4 action-panel" data-animate>
        <SectionHead title="Visit or reserve" />
        <Button>Call shop</Button>
        <Button tone="secondary">Get directions</Button>
        <Button tone="ghost" onClick={() => navigate('pickup')}>
          Request pickup
        </Button>
      </Surface>

      <Surface className="span-12" data-animate>
        <SectionHead title="Available products" note="Price, stock, and MRP stay visible together." />
        <div className="inventory-list">
          {shopData.items.map((item) => (
            <article key={item.name} className="inventory-row">
              <div className="thumb-box">{item.name.slice(0, 1)}</div>
              <div className="inventory-main">
                <h4>{item.name}</h4>
                <p>MRP {item.mrp}</p>
              </div>
              <StatusBadge tone={item.tone}>{item.stock}</StatusBadge>
              <strong>{item.price}</strong>
              <Button tone="secondary" onClick={() => navigate('pickup')}>
                Reserve
              </Button>
            </article>
          ))}
        </div>
      </Surface>
    </div>
  )
}

function PickupScreen() {
  return (
    <div className="screen-grid">
      <Surface className="span-7" data-animate>
        <SectionHead title="Pickup request" note="Keep the action light, direct, and practical." />
        <div className="form-grid">
          <label className="field is-wide">
            <span>Product</span>
            <input defaultValue={pickupData.product} />
          </label>
          <label className="field">
            <span>Name</span>
            <input defaultValue="Riya Shah" />
          </label>
          <label className="field">
            <span>Phone</span>
            <input defaultValue="+91 98765 43210" />
          </label>
          <label className="field">
            <span>Quantity</span>
            <input defaultValue="2" />
          </label>
          <label className="field is-wide">
            <span>Optional note</span>
            <textarea defaultValue="Please hold for evening pickup." />
          </label>
        </div>
      </Surface>

      <Surface className="span-5" data-animate>
        <SectionHead title="Request summary" />
        <div className="summary-card">
          <div className="summary-line">
            <Store size={16} />
            <span>{pickupData.shop}</span>
          </div>
          <div className="summary-line">
            <Navigation size={16} />
            <span>{pickupData.distance}</span>
          </div>
          <div className="summary-line">
            <Clock3 size={16} />
            <span>{pickupData.slot}</span>
          </div>
          <div className="summary-line">
            <Phone size={16} />
            <span>Pickup confirmation by phone</span>
          </div>
          <Button>Confirm request</Button>
        </div>
      </Surface>
    </div>
  )
}

export const customerScreens = [
  { id: 'home', title: 'Customer Home', short: 'Home', component: HomeScreen },
  { id: 'results', title: 'Search Results', short: 'Results', component: ResultsScreen },
  { id: 'shop', title: 'Shop Detail', short: 'Shop', component: ShopScreen },
  { id: 'pickup', title: 'Pickup Request', short: 'Pickup', component: PickupScreen },
]
