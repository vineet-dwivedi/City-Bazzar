import { BarChart3, Camera, ImagePlus, PackagePlus, PenSquare, ScanLine, TrendingUp } from 'lucide-react'
import { Button, Chip, Field, MetricCard, MiniBars, SearchField, SectionHead, StatusBadge, Surface } from '../components/ui'
import { aiReview, analyticsBars, inventoryItems, lowStock, ownerActivity, ownerDemand, ownerStats, pickupBoard } from '../data/mockData'

function AuthScreen({ navigate }) {
  return (
    <div className="screen-grid auth-grid">
      <Surface className="span-5 auth-panel" data-animate>
        <p className="eyebrow">owner access</p>
        <h1>Make your nearby shop searchable in minutes.</h1>
        <p>
          URBNBZR helps local stores upload products quickly, show real nearby availability, and handle pickup requests with less friction.
        </p>
        <div className="trust-points">
          <Chip active>Fast onboarding</Chip>
          <Chip>AI-assisted listings</Chip>
          <Chip>Pickup-first workflow</Chip>
        </div>
      </Surface>

      <Surface className="span-7 login-card" data-animate>
        <div className="toggle-row">
          <Chip active>Login</Chip>
          <Chip>Register</Chip>
        </div>
        <div className="form-grid">
          <Field label="Phone or email" value="owner@urbnbzr.shop" wide />
          <Field label="Password" value="••••••••" wide />
        </div>
        <div className="button-row">
          <Button onClick={() => navigate('setup')}>Continue</Button>
          <Button tone="secondary">Create account</Button>
        </div>
      </Surface>
    </div>
  )
}

function SetupScreen({ navigate }) {
  return (
    <div className="screen-grid">
      <Surface className="span-12" data-animate>
        <SectionHead title="Shop setup" note="Keep setup guided and low-friction for daily retail workflows." />
        <div className="form-grid">
          <Field label="Shop name" value="Patel General Store" />
          <Field label="Shop type" value="Kirana" />
          <Field label="Owner name" value="Harsh Patel" />
          <Field label="Phone" value="+91 98989 12121" />
          <Field label="Address" value="14 Market Road, Navrangpura" wide />
          <Field label="Area / landmark" value="Near commerce circle" />
          <Field label="Pickup radius" value="2 km" />
        </div>
        <div className="button-row">
          <Button onClick={() => navigate('dashboard')}>Save and continue</Button>
          <Button tone="secondary">Use current location</Button>
        </div>
      </Surface>
    </div>
  )
}

function DashboardScreen({ navigate }) {
  return (
    <div className="screen-grid">
      <Surface className="span-12 dashboard-hero" data-animate>
        <div>
          <p className="eyebrow">owner dashboard</p>
          <h1>Good evening, Harsh. Your shop is getting discovered nearby.</h1>
        </div>
        <div className="action-strip">
          <Button onClick={() => navigate('add-product')}>Add product</Button>
          <Button tone="secondary" onClick={() => navigate('inventory')}>View inventory</Button>
          <Button tone="ghost" onClick={() => navigate('pickup-requests')}>Pickup requests</Button>
        </div>
      </Surface>

      {ownerStats.map((item) => (
        <div className="span-4 span-lg-2" key={item.label}>
          <MetricCard {...item} />
        </div>
      ))}

      <Surface className="span-7" data-animate>
        <SectionHead title="Recent product activity" />
        <div className="activity-list">
          {ownerActivity.map((item) => (
            <div key={item.item} className="activity-row">
              <div>
                <strong>{item.item}</strong>
                <p>{item.action}</p>
              </div>
              <span>{item.time}</span>
            </div>
          ))}
        </div>
      </Surface>

      <Surface className="span-5" data-animate>
        <SectionHead title="Popular nearby searches" />
        <div className="demand-list">
          {ownerDemand.map((item) => (
            <div key={item.item} className="demand-row">
              <span>{item.item}</span>
              <strong>{item.count}</strong>
            </div>
          ))}
        </div>
      </Surface>

      <Surface className="span-6" data-animate>
        <SectionHead title="Low stock highlights" />
        <div className="demand-list">
          {lowStock.map((item) => (
            <div key={item.item} className="demand-row">
              <span>{item.item}</span>
              <StatusBadge tone="warning">{item.stock}</StatusBadge>
            </div>
          ))}
        </div>
      </Surface>

      <Surface className="span-6" data-animate>
        <SectionHead title="Compact analytics" action={<BarChart3 size={16} />} />
        <MiniBars values={analyticsBars} />
        <p className="foot-note">Views and search hits are strongest between 5 PM and 8 PM.</p>
      </Surface>
    </div>
  )
}

function AddProductScreen({ navigate }) {
  return (
    <div className="screen-grid">
      <Surface className="span-7 upload-panel" data-animate>
        <SectionHead title="Add product" note="One clear task: upload the product photo and let AI prefill the rest." />
        <div className="upload-drop">
          <ImagePlus size={28} />
          <strong>Drop image here or open camera</strong>
          <p>Clear front-facing packaging works best for name, brand, and MRP extraction.</p>
          <div className="button-row">
            <Button><Camera size={15} /> Camera</Button>
            <Button tone="secondary"><ImagePlus size={15} /> Gallery</Button>
          </div>
        </div>
      </Surface>

      <Surface className="span-5" data-animate>
        <SectionHead title="Before you analyze" />
        <div className="preview-box">
          <div className="mock-pack">COLGATE</div>
          <div className="hint-list">
            <p>Keep the package flat and text readable.</p>
            <p>Use the optional hint only when the image is unclear.</p>
          </div>
          <Field label="Optional text hint" value="Colgate strong teeth toothpaste 200g" wide />
          <Button onClick={() => navigate('ai-review')}><ScanLine size={15} /> Analyze with AI</Button>
        </div>
      </Surface>
    </div>
  )
}

function AiReviewScreen() {
  return (
    <div className="screen-grid">
      <Surface className="span-4" data-animate>
        <SectionHead title="AI review" />
        <div className="preview-box">
          <div className="mock-pack large">COLGATE</div>
          <StatusBadge tone="success">Confidence {aiReview.confidence}</StatusBadge>
          <p className="foot-note">{aiReview.note}</p>
        </div>
      </Surface>

      <Surface className="span-8" data-animate>
        <SectionHead title="Editable product details" note="AI suggests, owner confirms." />
        <div className="form-grid">
          <Field label="Product name" value="Colgate Strong Teeth 200g" />
          <Field label="Brand" value="Colgate" />
          <Field label="Category" value="Personal Care" />
          <Field label="MRP" value="60" />
          <Field label="Selling price" value="58" />
          <Field label="Quantity" value="18" />
          <Field label="Stock status" value="In stock" />
          <Field label="Catalog match" value={aiReview.match} wide />
        </div>
        <div className="button-row">
          <Button><PackagePlus size={15} /> Confirm and save</Button>
          <Button tone="secondary"><PenSquare size={15} /> Edit again</Button>
        </div>
      </Surface>
    </div>
  )
}

function InventoryScreen() {
  return (
    <div className="screen-grid">
      <Surface className="span-12 sticky-search" data-animate>
        <div className="search-toolbar">
          <SearchField placeholder="Search inventory, brand, category..." />
          <div className="chip-row">
            <Chip active>In stock</Chip>
            <Chip>Low stock</Chip>
            <Chip>Out of stock</Chip>
            <Chip>Category</Chip>
          </div>
        </div>
      </Surface>

      <Surface className="span-12" data-animate>
        <SectionHead title="Inventory" action={<Button>Add product</Button>} />
        <div className="table-wrap">
          <div className="table-head">
            <span>Product</span>
            <span>Brand</span>
            <span>Stock</span>
            <span>Price</span>
            <span>MRP</span>
            <span>Qty</span>
            <span>Action</span>
          </div>
          {inventoryItems.map((item) => (
            <article key={item.name} className="table-row">
              <div className="table-product">
                <div className="thumb-box">{item.name.slice(0, 1)}</div>
                <div>
                  <strong>{item.name}</strong>
                  <p>{item.size}</p>
                </div>
              </div>
              <span>{item.brand}</span>
              <StatusBadge tone={item.tone}>{item.stock}</StatusBadge>
              <strong>{item.price}</strong>
              <span>{item.mrp}</span>
              <span>{item.stock}</span>
              <Button tone="secondary">Update</Button>
            </article>
          ))}
        </div>
      </Surface>
    </div>
  )
}

function AnalyticsScreen() {
  return (
    <div className="screen-grid">
      <Surface className="span-12" data-animate>
        <SectionHead title="Analytics" note="Small, useful signals instead of noisy dashboards." action={<Chip active>Last 7 days</Chip>} />
      </Surface>

      {ownerStats.slice(1).map((item) => (
        <div className="span-3" key={item.label}>
          <MetricCard {...item} />
        </div>
      ))}

      <Surface className="span-8" data-animate>
        <SectionHead title="Traffic trend" action={<TrendingUp size={16} />} />
        <MiniBars values={[25, 38, 41, 62, 55, 74, 70, 88, 82, 76]} />
      </Surface>

      <Surface className="span-4" data-animate>
        <SectionHead title="Top demand" />
        <div className="demand-list">
          {ownerDemand.map((item) => (
            <div key={item.item} className="demand-row">
              <span>{item.item}</span>
              <strong>{item.count}</strong>
            </div>
          ))}
        </div>
      </Surface>
    </div>
  )
}

function PickupRequestsScreen() {
  return (
    <div className="screen-grid">
      <Surface className="span-12" data-animate>
        <SectionHead title="Pickup requests" note="A lightweight board for current request handling." />
      </Surface>

      <Surface className="span-6" data-animate>
        <SectionHead title="Requested" />
        <div className="board-list">
          {pickupBoard.requested.map((item) => (
            <article key={`${item.customer}-${item.item}`} className="board-card">
              <strong>{item.customer}</strong>
              <p>{item.item}</p>
              <div className="board-meta">
                <span>Qty {item.qty}</span>
                <span>{item.time}</span>
              </div>
              <Button>Mark ready</Button>
            </article>
          ))}
        </div>
      </Surface>

      <Surface className="span-6" data-animate>
        <SectionHead title="Ready for pickup" />
        <div className="board-list">
          {pickupBoard.ready.map((item) => (
            <article key={`${item.customer}-${item.item}`} className="board-card">
              <strong>{item.customer}</strong>
              <p>{item.item}</p>
              <div className="board-meta">
                <span>Qty {item.qty}</span>
                <span>{item.time}</span>
              </div>
              <Button tone="secondary">Complete</Button>
            </article>
          ))}
        </div>
      </Surface>
    </div>
  )
}

export const ownerScreens = [
  { id: 'auth', title: 'Owner Auth', short: 'Auth', component: AuthScreen },
  { id: 'setup', title: 'Shop Setup', short: 'Setup', component: SetupScreen },
  { id: 'dashboard', title: 'Owner Dashboard', short: 'Dashboard', component: DashboardScreen },
  { id: 'add-product', title: 'Add Product', short: 'Add', component: AddProductScreen },
  { id: 'ai-review', title: 'AI Review', short: 'AI', component: AiReviewScreen },
  { id: 'inventory', title: 'Inventory', short: 'Inventory', component: InventoryScreen },
  { id: 'analytics', title: 'Analytics', short: 'Analytics', component: AnalyticsScreen },
  { id: 'pickup-requests', title: 'Pickup Requests', short: 'Pickup', component: PickupRequestsScreen },
]
