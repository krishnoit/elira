'use client'

const KEY = 'elira_cart'

export function getCart() {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}

export function saveCart(items) {
  localStorage.setItem(KEY, JSON.stringify(items))
  window.dispatchEvent(new Event('elira-cart-update'))
}

export function addToCart(product, opts = {}) {
  const items = getCart()
  const size = opts.size || (product.sizes?.[0] || 'One Size')
  const color = opts.color || (product.colors?.[0] || 'Default')
  const key = `${product.id}__${size}__${color}`
  const existing = items.find(i => i.key === key)
  if (existing) {
    existing.qty += (opts.qty || 1)
  } else {
    items.push({
      key,
      id: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      discount: product.discount || 0,
      category: product.category,
      size,
      color,
      qty: opts.qty || 1,
    })
  }
  saveCart(items)
  return items
}

export function updateQty(key, qty) {
  const items = getCart()
  const item = items.find(i => i.key === key)
  if (!item) return items
  item.qty = Math.max(1, qty)
  saveCart(items)
  return items
}

export function removeFromCart(key) {
  const items = getCart().filter(i => i.key !== key)
  saveCart(items)
  return items
}

export function clearCart() {
  saveCart([])
}

export function cartTotals(items) {
  const subtotal = items.reduce((s, i) => s + Math.round(i.price * (1 - i.discount/100)) * i.qty, 0)
  const shipping = subtotal > 0 && subtotal < 5000 ? 250 : 0
  const total = subtotal + shipping
  const count = items.reduce((s, i) => s + i.qty, 0)
  return { subtotal, shipping, total, count }
}
