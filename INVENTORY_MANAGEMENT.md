# 📦 Inventory Management System - Complete Documentation

## Overview

The Inventory Management System in Mandi Deals Admin Panel provides comprehensive tools to manage your product inventory, including adding products, updating prices and stock levels, deleting items, and monitoring inventory status.

## Features

### 1. **Dashboard & Statistics**
- **Total Products**: Display count of all products in inventory
- **Low Stock Alert**: Shows products with low stock (≤10 units)
- **Out of Stock Products**: Highlights products with zero stock
- **Total Inventory Value**: Calculates total value of all inventory (price × stock)
- **Category Count**: Shows breakdown by product category

### 2. **Product Listing**
- Display all products in a comprehensive table with:
  - Product Name
  - Category
  - Price (₹)
  - Current Stock/Quantity
  - Unit (kg, pieces, dozen, box, liter, gram)
  - Stock Status (In Stock, Low Stock, Out of Stock)
  - Total Inventory Value (Price × Stock)

### 3. **Search & Filter**
- **Search by Name**: Find products by entering product name
- **Filter by Category**: View products from specific categories
- **Filter by Status**: 
  - All Products
  - In Stock (>10 units)
  - Low Stock (1-10 units)
  - Out of Stock (0 units)

### 4. **Add New Product**
Create new products with:
- Product Name (required)
- Category (required) - Can select from existing or create new
- Price (₹) (required) - Decimal support for precise pricing
- Stock Quantity (required) - Decimal support for fractional quantities
- Unit Type - Options: kg, pieces, dozen, box, liter, gram

**Status Auto-Assignment**:
- Out of Stock: if stock = 0
- Low Stock: if stock is 1-10
- In Stock: if stock > 10

### 5. **Update Product**
Edit product details including:
- Product Name
- Category
- Price (₹)
- Stock Quantity
- Unit Type

**Real-time Feedback**:
- Current product status displayed
- Total inventory value calculated and shown
- Unit selection for consistency

### 6. **Delete Product**
- Remove products from inventory
- Confirmation dialog prevents accidental deletion
- Shows product details before deletion
- Displays: Category, Price, Current Stock

### 7. **Stock Management**
- Update stock quantities directly
- Support for decimal quantities (e.g., 2.5 kg)
- Automatic status update based on stock level
- Tracks total inventory value in real-time

### 8. **Price Management**
- Set initial prices when adding products
- Update prices anytime through edit function
- Decimal precision for accurate costing
- Displays currency formatting (₹)

## API Endpoints

### Admin Inventory APIs

#### 1. Get All Inventory (with filters)
```
GET /api/admin/inventory/list
Query Parameters:
  - category (optional): Filter by specific category
  - search (optional): Search by product name
  - status (optional): Filter by status (in-stock, low-stock, out-of-stock)

Response:
[
  {
    "id": "uuid",
    "name": "Tomatoes",
    "category": "Vegetables",
    "price": 40.00,
    "current_stock": 100,
    "unit": "kg",
    "status": "in-stock",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
]
```

#### 2. Get All Categories
```
GET /api/admin/inventory/categories

Response:
["Vegetables", "Fruits", "Dairy", "Grains"]
```

#### 3. Add New Product
```
POST /api/admin/inventory/add
Content-Type: application/json

Body:
{
  "name": "Tomatoes",
  "category": "Vegetables",
  "price": 40.50,
  "current_stock": 100,
  "unit": "kg"
}

Response:
{
  "message": "Product added successfully",
  "product": {
    "id": "uuid",
    "name": "Tomatoes",
    "category": "Vegetables",
    "price": 40.50,
    "current_stock": 100,
    "unit": "kg",
    "status": "in-stock"
  }
}
```

#### 4. Update Product
```
PUT /api/admin/inventory/{product_id}
Content-Type: application/json

Body (all fields optional):
{
  "name": "Updated Name",
  "category": "Vegetables",
  "price": 45.00,
  "current_stock": 95,
  "unit": "kg"
}

Response:
{
  "message": "Product updated successfully",
  "product": {
    "id": "uuid",
    "name": "Updated Name",
    "category": "Vegetables",
    "price": 45.00,
    "current_stock": 95,
    "unit": "kg",
    "status": "in-stock"
  }
}
```

#### 5. Delete Product
```
DELETE /api/admin/inventory/{product_id}

Response:
{
  "message": "Product deleted successfully",
  "deletedProduct": {
    "id": "uuid",
    "name": "Tomatoes",
    "category": "Vegetables",
    "price": 40.00,
    "current_stock": 100,
    "unit": "kg"
  }
}
```

#### 6. Get Inventory Statistics
```
GET /api/admin/inventory/stats

Response:
{
  "totalProducts": 50,
  "lowStockCount": 5,
  "lowStockProducts": [
    {
      "id": "uuid",
      "name": "Spinach",
      "current_stock": 8
    }
  ],
  "outOfStockCount": 3,
  "outOfStockProducts": [
    {
      "id": "uuid",
      "name": "Milk"
    }
  ],
  "totalInventoryValue": 15000.50,
  "categoriesCount": 8,
  "categories": [
    {
      "category": "Vegetables",
      "count": 15
    }
  ]
}
```

## Database Schema

### Products Table
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  price DECIMAL(8,2) NOT NULL,
  current_stock DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20) DEFAULT 'kg',
  vendor_id UUID,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Stock Status Indicators

| Status | Condition | Color | Icon |
|--------|-----------|-------|------|
| In Stock | current_stock > 10 | Green | ✓ |
| Low Stock | 1 ≤ current_stock ≤ 10 | Orange | ⚠ |
| Out of Stock | current_stock = 0 | Red | ✕ |

## Unit Types Supported

- **kg** - Kilograms (for fresh produce, grains, etc.)
- **pieces** - Individual items (eggs, fruits, etc.)
- **dozen** - 12 items
- **box** - Packaged boxes
- **liter** - Volume measurement (milk, oil, etc.)
- **gram** - Grams (spices, small items, etc.)

## Workflow Examples

### Example 1: Adding Vegetables
1. Click "Add Product" button
2. Enter Name: "Carrots"
3. Select Category: "Vegetables"
4. Enter Price: "35.00"
5. Enter Stock: "120"
6. Select Unit: "kg"
7. Click "Add Product"
8. Status automatically set to "In Stock" (120 > 10)

### Example 2: Updating Stock for Low Stock Item
1. Find product in list with "Low Stock" status
2. Click "Edit" button
3. Update current_stock value (e.g., from 8 to 50)
4. Click "Update Product"
5. Status automatically updates to "In Stock"
6. Total inventory value recalculated

### Example 3: Deleting an Old Product
1. Search for product or browse list
2. Locate product to delete
3. Click "Delete" button
4. Review product details in confirmation dialog
5. Click "Delete" to confirm
6. Product removed from inventory
7. Statistics updated automatically

### Example 4: Price Adjustment
1. Find product (e.g., "Tomatoes")
2. Click "Edit"
3. Change price from "40.00" to "45.50"
4. Keep stock and other details same
5. Click "Update Product"
6. Total inventory value recalculated (45.50 × current_stock)

## Best Practices

1. **Regular Monitoring**
   - Check Low Stock alerts frequently
   - Plan purchases for out-of-stock items
   - Review inventory value trends

2. **Data Accuracy**
   - Enter exact prices for accurate billing
   - Use decimal quantities if needed (e.g., 2.5 kg)
   - Maintain consistent unit types for similar products

3. **Category Management**
   - Create logical category names
   - Use consistent naming across products
   - Review categories periodically

4. **Stock Updates**
   - Update stock immediately after adding new goods
   - Remove out-of-stock products promptly
   - Use decimal quantities for partial stock

5. **Backup**
   - Regularly export inventory data
   - Document significant changes
   - Review historical pricing trends

## Troubleshooting

### Issue: Product not appearing in list
- **Solution**: Check search/filter settings - may be filtered out by status or category

### Issue: Status shows "Out of Stock" but I added stock
- **Solution**: Status auto-updates; refresh the page or check if stock was properly saved

### Issue: Price not updating
- **Solution**: Ensure you're using numbers (no special characters except decimal point)

### Issue: Can't delete product
- **Solution**: Product may be referenced in sales; contact admin for assistance

## Future Enhancements

- [ ] Bulk import/export of products
- [ ] Stock movement history/audit log
- [ ] Automatic reorder point alerts
- [ ] Sales velocity analysis
- [ ] Multi-location inventory tracking
- [ ] Barcode/QR code scanning
- [ ] Inventory forecasting
- [ ] Supplier management integration

## Support

For issues or feature requests related to inventory management:
1. Check logs in backend console
2. Review API responses for error messages
3. Verify database connectivity
4. Contact development team with specific error codes
