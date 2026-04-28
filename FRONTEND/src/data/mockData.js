export const homeData = {
  location: 'Navrangpura, Ahmedabad',
  categories: ['Grocery', 'Pharmacy', 'Stationery', 'Personal Care', 'Snacks'],
  recent: ['toothpaste', 'notebook', 'protein bar'],
  popular: [
    { title: 'Colgate Strong Teeth', shop: 'Patel General Store', distance: '450 m', stock: 'In stock', tone: 'success', price: '₹58' },
    { title: 'A4 Notebook Pack', shop: 'Study Spot', distance: '700 m', stock: 'Low stock', tone: 'warning', price: '₹125' },
    { title: 'Paracetamol 650', shop: 'City Care Pharmacy', distance: '1.2 km', stock: 'In stock', tone: 'success', price: '₹32' },
  ],
}

export const searchData = {
  query: 'toothpaste',
  radius: '2.5 km',
  results: [
    {
      product: 'Colgate Strong Teeth 200g',
      shops: [
        { shop: 'Patel General Store', distance: '450 m', price: '₹58', stock: 'In stock', tone: 'success' },
        { shop: 'Urban Daily Mart', distance: '900 m', price: '₹60', stock: 'In stock', tone: 'success' },
        { shop: 'Shree Kirana', distance: '1.6 km', price: '₹56', stock: 'Low stock', tone: 'warning' },
      ],
    },
    {
      product: 'Closeup Red Hot 150g',
      shops: [
        { shop: 'Urban Daily Mart', distance: '900 m', price: '₹72', stock: 'In stock', tone: 'success' },
        { shop: 'Niva Essentials', distance: '1.8 km', price: '₹75', stock: 'Out', tone: 'muted' },
      ],
    },
  ],
}

export const shopData = {
  name: 'Patel General Store',
  type: 'Kirana',
  address: '14 Market Road, Navrangpura',
  distance: '450 m',
  area: 'pickup radius 2 km',
  trust: ['Fast pickup confirmations', 'Popular for essentials', 'Viewed 218 times this week'],
  items: [
    { name: 'Colgate Strong Teeth 200g', price: '₹58', mrp: '₹60', stock: 'In stock', tone: 'success' },
    { name: 'Dove Soap 100g', price: '₹44', mrp: '₹48', stock: 'Low stock', tone: 'warning' },
    { name: 'Maggi 12-Pack', price: '₹168', mrp: '₹180', stock: 'In stock', tone: 'success' },
  ],
}

export const pickupData = {
  product: 'Colgate Strong Teeth 200g',
  shop: 'Patel General Store',
  distance: '450 m',
  slot: 'Ready in 15-20 min',
}

export const ownerStats = [
  { label: 'Products listed', value: '184', detail: '+12 this week' },
  { label: 'Views', value: '2.8k', detail: 'last 7 days' },
  { label: 'Clicks', value: '842', detail: 'shop opens' },
  { label: 'Search hits', value: '392', detail: 'matched nearby' },
  { label: 'Pickup requests', value: '46', detail: '9 pending now' },
]

export const ownerActivity = [
  { item: 'Colgate Strong Teeth', action: 'Added by AI review', time: '14 min ago' },
  { item: 'Classmate Notebook Pack', action: 'Stock updated to 12', time: '42 min ago' },
  { item: 'Dove Soap 100g', action: 'Pickup reserved', time: '1 hr ago' },
]

export const ownerDemand = [
  { item: 'toothpaste', count: 124 },
  { item: 'notebook', count: 98 },
  { item: 'pain relief spray', count: 74 },
]

export const lowStock = [
  { item: 'Dove Soap 100g', stock: '3 left' },
  { item: 'Lux Body Wash', stock: '2 left' },
  { item: 'Fevicol MR', stock: '4 left' },
]

export const aiReview = {
  confidence: '87%',
  match: 'Colgate Strong Teeth 200g',
  note: 'Packaging text is clear. Price region is slightly blurred, so keep MRP editable.',
}

export const inventoryItems = [
  { name: 'Colgate Strong Teeth 200g', brand: 'Colgate', stock: '18', tone: 'success', price: '₹58', mrp: '₹60', size: '200g' },
  { name: 'Classmate Long Book', brand: 'Classmate', stock: '6', tone: 'warning', price: '₹45', mrp: '₹50', size: 'Single' },
  { name: 'Parle-G Family Pack', brand: 'Parle', stock: '0', tone: 'muted', price: '₹48', mrp: '₹50', size: '800g' },
]

export const analyticsBars = [42, 55, 68, 46, 80, 74, 90]

export const pickupBoard = {
  requested: [
    { customer: 'Riya Shah', item: 'Colgate Strong Teeth', qty: '2', time: '4 min ago' },
    { customer: 'Arjun Patel', item: 'Classmate Long Book', qty: '4', time: '11 min ago' },
  ],
  ready: [
    { customer: 'Neha Desai', item: 'Dove Soap 100g', qty: '1', time: 'Ready at 5:30 PM' },
  ],
}
