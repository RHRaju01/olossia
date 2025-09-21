import { CartItem } from '../models/CartItem.js';

export const getCart = async (req, res) => {
  const userId = req.user && req.user.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const items = await CartItem.getByUser(userId);
    return res.json({ data: items });
  } catch (err) {
    console.error('getCart error', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
};

export const addCartItem = async (req, res) => {
  const userId = req.user && req.user.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const { product_id, variant_id = null, quantity = 1 } = req.body;
  if (!product_id) return res.status(400).json({ error: 'product_id required' });
  try {
    const item = await CartItem.addItem({ userId, product_id, variant_id, quantity });
    return res.status(201).json({ data: item });
  } catch (err) {
    console.error('addCartItem error', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
};

export const updateCartItem = async (req, res) => {
  const userId = req.user && req.user.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  const { quantity } = req.body;
  if (typeof quantity !== 'number') return res.status(400).json({ error: 'quantity required' });
  try {
    const item = await CartItem.updateItem(id, { quantity });
    return res.json({ data: item });
  } catch (err) {
    console.error('updateCartItem error', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
};

export const removeCartItem = async (req, res) => {
  const userId = req.user && req.user.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  try {
    const item = await CartItem.removeItem(id);
    return res.json({ data: item });
  } catch (err) {
    console.error('removeCartItem error', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
};

export const clearCart = async (req, res) => {
  const userId = req.user && req.user.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  try {
    await CartItem.clearCart(userId);
    return res.json({ data: true });
  } catch (err) {
    console.error('clearCart error', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
};

// Accepts { items: [{ product_id, variant_id?, quantity }] }
export const mergeCart = async (req, res) => {
  const userId = req.user && req.user.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const { items } = req.body;
  if (!Array.isArray(items)) return res.status(400).json({ error: 'items array required' });
  try {
    const merged = await CartItem.bulkMerge(userId, items);
    return res.json({ data: merged });
  } catch (err) {
    console.error('mergeCart error', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
};
