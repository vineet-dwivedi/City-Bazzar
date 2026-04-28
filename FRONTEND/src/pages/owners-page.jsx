import { Camera, ScanSearch, Store } from 'lucide-react'
import { PageTransition, SectionHead } from '../components/ui'

const steps = [
  {
    title: 'Upload a product photo',
    note: 'Keep onboarding light with image-first listing instead of long forms.',
    icon: Camera,
  },
  {
    title: 'Review AI suggestions',
    note: 'Product name, brand, category, and price stay editable before saving.',
    icon: ScanSearch,
  },
  {
    title: 'Appear in local search',
    note: 'Customers nearby can compare your stock before visiting your shop.',
    icon: Store,
  },
]

export function OwnersPage() {
  return (
    <PageTransition className="page-shell">
      <section className="hero hero--owners">
        <div className="container hero__inner">
          <SectionHead
            eyebrow="Owner Experience"
            title="A cleaner way for local shops to become discoverable."
            note="URBNBZR keeps the workflow minimal: upload, review, publish, and handle pickup interest without heavy software."
          />
        </div>
      </section>

      <section className="page-section">
        <div className="container owner-grid">
          {steps.map((step) => {
            const Icon = step.icon

            return (
              <article key={step.title} className="owner-card">
                <span className="owner-card__icon">
                  <Icon size={18} strokeWidth={2} />
                </span>
                <h3>{step.title}</h3>
                <p>{step.note}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="page-section page-section--soft">
        <div className="container owner-band owner-band--split">
          <div>
            <p className="section-eyebrow">Ready to start</p>
            <h2>List your store, publish your products, and meet nearby demand faster.</h2>
          </div>
          <div className="owner-actions">
            <button className="cta-button" type="button">Start listing</button>
            <button className="cta-button cta-button--secondary" type="button">View customer side</button>
          </div>
        </div>
      </section>
    </PageTransition>
  )
}
