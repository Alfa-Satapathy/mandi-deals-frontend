import express from 'express'
import { getRecord, getRecords, runQuery } from '../database.js'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

// Store settings in memory (can be persisted to DB later)
let systemSettings = {
  tax_percentage: 5,
  points_multiplier: 100,
  points_conversion_rate: 10,
  max_discount_pct: 50
}

// Helper function to get product status based on stock
const getProductStatus = (stock) => {
  if (stock === 0) return 'out-of-stock'
  if (stock <= 10) return 'low-stock'
  return 'in-stock'
}

// Get dashboard stats
router.get('/dashboard/stats', async (req, res) => {
  try {
    // Get total sales
    const totalSalesResult = await getRecord(
      'SELECT SUM(total_amount) as total FROM transactions',
      []
    )
    const totalSales = totalSalesResult?.total || 0

    // Get total items sold
    const totalItemsResult = await getRecord(
      'SELECT SUM(quantity) as total FROM transaction_items',
      []
    )
    const totalItems = totalItemsResult?.total || 0

    // Get total customers
    const totalCustomersResult = await getRecord(
      'SELECT COUNT(*) as total FROM customer_profiles',
      []
    )
    const totalCustomers = totalCustomersResult?.total || 0

    // Get average order value
    const avgOrderResult = await getRecord(
      'SELECT AVG(total_amount) as avg FROM transactions',
      []
    )
    const avgOrderValue = avgOrderResult?.avg || 0

    res.json({
      totalSales: parseFloat(totalSales),
      totalItems: parseInt(totalItems),
      totalCustomers: parseInt(totalCustomers),
      avgOrderValue: parseFloat(avgOrderValue)
    })
  } catch (error) {
    console.error('Stats error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get daily sales (last 7 days)
router.get('/dashboard/daily-sales', async (req, res) => {
  try {
    const data = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const result = await getRecords(
        `SELECT 
          SUM(total_amount) as sales,
          COUNT(*) as orders,
          SUM(COALESCE((SELECT SUM(quantity) FROM transaction_items ti WHERE ti.transaction_id = t.id), 0)) as items
        FROM transactions t 
        WHERE date(created_at) = ?`,
        [dateStr]
      )
      
      data.push({
        date: new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sales: parseFloat(result[0]?.sales || 0),
        items: parseInt(result[0]?.items || 0),
        orders: parseInt(result[0]?.orders || 0)
      })
    }
    
    res.json(data)
  } catch (error) {
    console.error('Daily sales error:', error)
    res.json([]) // Return empty array on error
  }
})

// Get monthly sales
router.get('/dashboard/monthly-sales', async (req, res) => {
  try {
    const data = []
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    for (let i = 0; i < 12; i++) {
      const monthStr = String(i + 1).padStart(2, '0')
      const result = await getRecords(
        `SELECT 
          SUM(total_amount) as sales,
          SUM(COALESCE((SELECT SUM(quantity) FROM transaction_items ti WHERE ti.transaction_id = t.id), 0)) as items
        FROM transactions t 
        WHERE strftime('%m', created_at) = ?`,
        [monthStr]
      )
      
      data.push({
        month: months[i],
        sales: parseFloat(result[0]?.sales || 0),
        items: parseInt(result[0]?.items || 0)
      })
    }
    
    res.json(data)
  } catch (error) {
    console.error('Monthly sales error:', error)
    res.json([])
  }
})

// Get yearly sales
router.get('/dashboard/yearly-sales', async (req, res) => {
  try {
    const result = await getRecords(
      `SELECT 
        strftime('%Y', created_at) as year,
        SUM(total_amount) as sales
      FROM transactions 
      GROUP BY strftime('%Y', created_at)
      ORDER BY CAST(year AS INTEGER) ASC`,
      []
    )
    
    const data = result.map(r => ({
      year: r.year || '2026',
      sales: parseFloat(r.sales || 0)
    }))
    
    res.json(data.length > 0 ? data : [{ year: '2026', sales: 0 }])
  } catch (error) {
    console.error('Yearly sales error:', error)
    res.json([{ year: '2026', sales: 0 }])
  }
})

// Get customers list
router.get('/dashboard/customers', async (req, res) => {
  try {
    const customers = await getRecords(
      `SELECT 
        cp.id,
        cp.user_id,
        cp.tier,
        cp.total_purchases,
        cp.created_at as member_since,
        u.name,
        u.phone,
        COALESCE(w.available_points, 0) as available_points
      FROM customer_profiles cp
      JOIN users u ON cp.user_id = u.id
      LEFT JOIN wallets w ON cp.id = w.customer_id
      ORDER BY cp.total_purchases DESC
      LIMIT 100`,
      []
    )
    
    res.json(customers || [])
  } catch (error) {
    console.error('Customers error:', error)
    res.json([])
  }
})

// Get sales details
router.get('/dashboard/sales', async (req, res) => {
  try {
    const sales = await getRecords(
      `SELECT 
        t.id,
        t.customer_id,
        t.total_amount,
        t.discount_amount,
        t.points_used,
        t.created_at,
        t.status,
        cp.id as customer_profile_id,
        u.name as customer_name,
        (SELECT COUNT(*) FROM transaction_items WHERE transaction_id = t.id) as items_count
      FROM transactions t
      LEFT JOIN customer_profiles cp ON t.customer_id = cp.id
      LEFT JOIN users u ON cp.user_id = u.id
      ORDER BY t.created_at DESC
      LIMIT 200`,
      []
    )
    
    res.json(sales || [])
  } catch (error) {
    console.error('Sales error:', error)
    res.json([])
  }
})

// Get system settings
router.get('/settings', (req, res) => {
  try {
    res.json(systemSettings)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update system settings
router.post('/settings', (req, res) => {
  try {
    const { tax_percentage, points_multiplier, points_conversion_rate, max_discount_pct } = req.body

    // Validate inputs
    if (tax_percentage !== undefined) {
      systemSettings.tax_percentage = Math.max(0, Math.min(100, parseFloat(tax_percentage)))
    }
    if (points_multiplier !== undefined) {
      systemSettings.points_multiplier = Math.max(1, parseFloat(points_multiplier))
    }
    if (points_conversion_rate !== undefined) {
      systemSettings.points_conversion_rate = Math.max(1, parseInt(points_conversion_rate))
    }
    if (max_discount_pct !== undefined) {
      systemSettings.max_discount_pct = Math.max(0, Math.min(100, parseInt(max_discount_pct)))
    }

    res.json({
      message: 'Settings updated successfully',
      settings: systemSettings
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get single setting
router.get('/settings/:key', (req, res) => {
  try {
    const { key } = req.params
    if (systemSettings.hasOwnProperty(key)) {
      res.json({ [key]: systemSettings[key] })
    } else {
      res.status(404).json({ error: 'Setting not found' })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ============================================
// INVENTORY MANAGEMENT APIs
// ============================================

// Get all inventory/products with filters
router.get('/inventory/list', async (req, res) => {
  try {
    const { category, search, status } = req.query
    
    let query = 'SELECT * FROM products WHERE 1=1'
    let params = []
    
    if (category && category !== 'all') {
      query += ' AND category = ?'
      params.push(category)
    }
    
    if (search) {
      query += ' AND name LIKE ?'
      params.push(`%${search}%`)
    }
    
    if (status && status !== 'all') {
      if (status === 'out-of-stock') {
        query += ' AND current_stock = 0'
      } else if (status === 'low-stock') {
        query += ' AND current_stock > 0 AND current_stock <= 10'
      } else if (status === 'in-stock') {
        query += ' AND current_stock > 10'
      }
    }
    
    query += ' ORDER BY name ASC'
    
    const products = await getRecords(query, params)
    
    const productsWithStatus = (products || []).map(p => ({
      ...p,
      status: getProductStatus(p.current_stock)
    }))
    
    res.json(productsWithStatus)
  } catch (error) {
    console.error('Inventory list error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get all categories
router.get('/inventory/categories', async (req, res) => {
  try {
    const categories = await getRecords(
      'SELECT DISTINCT category FROM products ORDER BY category',
      []
    )
    const categoryList = categories.map(c => c.category)
    res.json(categoryList)
  } catch (error) {
    console.error('Categories error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Add new product (inventory)
router.post('/inventory/add', async (req, res) => {
  try {
    const { name, category, price, current_stock, unit } = req.body
    
    // Validate required fields
    if (!name || !category || price === undefined || current_stock === undefined) {
      return res.status(400).json({ 
        error: 'name, category, price, and current_stock are required' 
      })
    }
    
    // Validate data types
    if (isNaN(price) || isNaN(current_stock)) {
      return res.status(400).json({ 
        error: 'price and current_stock must be numbers' 
      })
    }
    
    const productId = uuidv4()
    const status = getProductStatus(current_stock)
    
    await runQuery(
      `INSERT INTO products (id, name, category, price, current_stock, unit, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [productId, name, category, parseFloat(price), parseFloat(current_stock), unit || 'kg', status]
    )
    
    res.json({
      message: 'Product added successfully',
      product: {
        id: productId,
        name,
        category,
        price: parseFloat(price),
        current_stock: parseFloat(current_stock),
        unit: unit || 'kg',
        status
      }
    })
  } catch (error) {
    console.error('Add product error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Update product (price, stock, details)
router.put('/inventory/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, category, price, current_stock, unit } = req.body
    
    // Check if product exists
    const product = await getRecord('SELECT * FROM products WHERE id = ?', [id])
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    
    // Build update query
    const updates = []
    const values = []
    
    if (name !== undefined) {
      updates.push('name = ?')
      values.push(name)
    }
    if (category !== undefined) {
      updates.push('category = ?')
      values.push(category)
    }
    if (price !== undefined) {
      if (isNaN(price)) {
        return res.status(400).json({ error: 'price must be a number' })
      }
      updates.push('price = ?')
      values.push(parseFloat(price))
    }
    if (current_stock !== undefined) {
      if (isNaN(current_stock)) {
        return res.status(400).json({ error: 'current_stock must be a number' })
      }
      updates.push('current_stock = ?')
      values.push(parseFloat(current_stock))
      updates.push('status = ?')
      values.push(getProductStatus(parseFloat(current_stock)))
    }
    if (unit !== undefined) {
      updates.push('unit = ?')
      values.push(unit)
    }
    
    updates.push('updated_at = datetime("now")')
    values.push(id)
    
    if (updates.length === 1) { // Only updated_at
      return res.status(400).json({ error: 'No fields to update' })
    }
    
    await runQuery(
      `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
      values
    )
    
    // Fetch updated product
    const updatedProduct = await getRecord('SELECT * FROM products WHERE id = ?', [id])
    
    res.json({
      message: 'Product updated successfully',
      product: {
        ...updatedProduct,
        status: getProductStatus(updatedProduct.current_stock)
      }
    })
  } catch (error) {
    console.error('Update product error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Delete product
router.delete('/inventory/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const product = await getRecord('SELECT * FROM products WHERE id = ?', [id])
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    
    await runQuery('DELETE FROM products WHERE id = ?', [id])
    
    res.json({
      message: 'Product deleted successfully',
      deletedProduct: product
    })
  } catch (error) {
    console.error('Delete product error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get inventory statistics
router.get('/inventory/stats', async (req, res) => {
  try {
    // Total products
    const totalProductsResult = await getRecord(
      'SELECT COUNT(*) as count FROM products',
      []
    )
    
    // Low stock products
    const lowStockResult = await getRecords(
      'SELECT id, name, current_stock FROM products WHERE current_stock > 0 AND current_stock <= 10 ORDER BY current_stock ASC',
      []
    )
    
    // Out of stock products
    const outOfStockResult = await getRecords(
      'SELECT id, name FROM products WHERE current_stock = 0',
      []
    )
    
    // Total inventory value
    const valueResult = await getRecord(
      'SELECT SUM(price * current_stock) as total_value FROM products',
      []
    )
    
    // Product categories count
    const categoriesResult = await getRecords(
      'SELECT category, COUNT(*) as count FROM products GROUP BY category',
      []
    )
    
    res.json({
      totalProducts: totalProductsResult?.count || 0,
      lowStockCount: lowStockResult.length,
      lowStockProducts: lowStockResult,
      outOfStockCount: outOfStockResult.length,
      outOfStockProducts: outOfStockResult,
      totalInventoryValue: valueResult?.total_value || 0,
      categoriesCount: categoriesResult.length,
      categories: categoriesResult
    })
  } catch (error) {
    console.error('Inventory stats error:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router
