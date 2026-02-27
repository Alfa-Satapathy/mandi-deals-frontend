#!/usr/bin/env node

/**
 * Final Integration Test - Simulates complete POS workflow
 * Tests customer search, registration, product selection, and checkout
 */

const API_URL = 'http://localhost:3001';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function test(name, fn) {
  try {
    console.log(`\n🧪 Testing: ${name}`);
    await fn();
    console.log(`✅ PASSED: ${name}\n`);
    return true;
  } catch (error) {
    console.error(`❌ FAILED: ${name}`);
    console.error(`   ${error.message}\n`);
    return false;
  }
}

async function main() {
  console.log('=====================================');
  console.log('🚀 FINAL INTEGRATION TEST SUITE');
  console.log('=====================================\n');

  const results = [];
  const uniquePhone = `4444${Math.floor(Math.random() * 10000)}`;
  let customerId = null;
  let billId = null;

  // TEST 1: Search non-existent customer
  results.push(await test('Search non-existent customer', async () => {
    const res = await fetch(`${API_URL}/api/customers/search?phone=1111111111`);
    if (res.status !== 404) throw new Error('Should return 404 for non-existent customer');
    const data = await res.json();
    if (!data.error) throw new Error('Should return error message');
  }));

  // TEST 2: Create new customer
  results.push(await test('Create new customer', async () => {
    const res = await fetch(`${API_URL}/api/customers/quick-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: uniquePhone, name: 'Integration Test User' })
    });
    if (res.status !== 200) throw new Error('Failed to create customer');
    const data = await res.json();
    customerId = data.customer.id;
    if (!customerId) throw new Error('No customer ID returned');
  }));

  // TEST 3: Search created customer
  results.push(await test('Search newly created customer', async () => {
    const res = await fetch(`${API_URL}/api/customers/search?phone=${uniquePhone}`);
    if (res.status !== 200) throw new Error('Failed to search customer');
    const data = await res.json();
    if (data.customer.name !== 'Integration Test User') throw new Error('Customer data mismatch');
  }));

  // TEST 4: Fetch products (tests frontend fix #1)
  results.push(await test('Fetch products with proper error handling', async () => {
    const res = await fetch(`${API_URL}/api/products`);
    if (!res.ok) throw new Error('Products fetch returned error');
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('Products should be array');
    if (data.length === 0) throw new Error('No products returned');
  }));

  // TEST 5: Create bill
  results.push(await test('Create new bill', async () => {
    const res = await fetch(`${API_URL}/api/pos/create-bill`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        staff_id: 'staff-1', 
        counter_id: 'counter-1',
        customer_id: customerId 
      })
    });
    if (res.status !== 200) throw new Error('Failed to create bill');
    const data = await res.json();
    billId = data.bill_id;
    if (!billId) throw new Error('No bill ID returned');
  }));

  // TEST 6: Get initial product stock
  const productId = 'prod-5'; // Bananas
  let initialStock = 0;
  results.push(await test('Get initial product stock', async () => {
    const res = await fetch(`${API_URL}/api/products/${productId}`);
    if (res.status !== 200) throw new Error('Failed to get product');
    const data = await res.json();
    initialStock = data.quantity;
    if (typeof initialStock !== 'number') throw new Error('Initial stock not a number');
  }));

  // TEST 7: Add item to bill
  results.push(await test('Add item to bill', async () => {
    const res = await fetch(`${API_URL}/api/pos/add-item`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bill_id: billId,
        product_id: productId,
        quantity: 2,
        price: 50
      })
    });
    if (res.status !== 200) throw new Error('Failed to add item');
    const data = await res.json();
    if (data.items_count !== 1) throw new Error('Item not added');
  }));

  // TEST 8: Complete transaction & verify stock deduction (tests frontend fix #2)
  results.push(await test('Complete transaction & verify stock deduction', async () => {
    const res = await fetch(`${API_URL}/api/pos/complete-transaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bill_id: billId,
        customer_id: customerId,
        payment_method: 'cash',
        points_used: 0
      })
    });
    if (res.status !== 200) throw new Error('Failed to complete transaction');
    const data = await res.json();
    if (!data.transaction_id) throw new Error('No transaction ID');
    
    // Verify stock was deducted
    await delay(100); // Small delay for DB update
    const verifyRes = await fetch(`${API_URL}/api/products/${productId}`);
    const verifyData = await verifyRes.json();
    const finalStock = verifyData.quantity;
    
    if (finalStock !== (initialStock - 2)) {
      throw new Error(`Stock not deducted. Expected ${initialStock - 2}, got ${finalStock}`);
    }
  }));

  // TEST 9: Verify products can be re-fetched (simulating frontend refresh after transaction)
  results.push(await test('Refresh products list after transaction', async () => {
    const res = await fetch(`${API_URL}/api/products`);
    if (!res.ok) throw new Error('Failed to refresh products');
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('Refreshed data should be array');
    
    // Verify the product is in the list with updated stock
    const product = data.find(p => p.id === productId);
    if (!product) throw new Error('Product not found in list');
    if (product.quantity !== (initialStock - 2)) {
      throw new Error(`Stock mismatch in list. Expected ${initialStock - 2}, got ${product.quantity}`);
    }
  }));

  // TEST 10: Verify wallet points for customer
  results.push(await test('Verify customer wallet after transaction', async () => {
    const res = await fetch(`${API_URL}/api/wallet/${customerId}/balance`);
    if (res.status !== 200) throw new Error('Failed to get wallet balance');
    const data = await res.json();
    if (typeof data.available_points !== 'number') throw new Error('Points not a number');
  }));

  // Summary
  console.log('\n=====================================');
  console.log('📊 TEST SUMMARY');
  console.log('=====================================');
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`\nPassed: ${passed}/${total}`);
  console.log(`Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 ALL TESTS PASSED! Bugs are fixed.\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please review.\n');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
