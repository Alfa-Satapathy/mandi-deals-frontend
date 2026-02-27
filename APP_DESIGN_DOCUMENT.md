# Mandi Deals - Complete Web Application Design

## Project Overview
A multi-module web platform combining a **Society Marketplace** for browsing fresh produce and cafe items with counter-based purchasing, integrated with a **Waste Rewards Program** that incentivizes waste segregation and recycling through QR code-based tracking and redeemable points.

**Version 1 Focus**: Display product availability, in-store counter operations, and waste rewards with QR scanning.

---

## 1. SYSTEM ARCHITECTURE

### Core Modules (Version 1)
```
┌─────────────────────────────────────────────────────────┐
│                    MANDI DEALS PLATFORM                 │
├─────────────────────────────────────────────────────────┤
│ Web Dashboard   │     Mobile App (QR Scanner/Waste)    │     Counter Display
├─────────────────────────────────────────────────────────┤
│                    API Layer (Node/Django)              │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │
│  │   User Mgmt  │ │  Product     │ │   Counter    │    │
│  │   (Admin)    │ │  Catalogue   │ │     POS      │    │
│  └──────────────┘ └──────────────┘ └──────────────┘    │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │
│  │  Inventory   │ │  Waste QR    │ │  Availability   │
│  │  Management  │ │  Scanner     │ │  Display        │
│  └──────────────┘ └──────────────┘ └──────────────┘    │
├─────────────────────────────────────────────────────────┤
│              Database (PostgreSQL/SQLite)               │
└─────────────────────────────────────────────────────────┘
```

---

## 2. USER ROLES & PERSONAS

### A. Resident/Customer
- Browse marketplace
- Purchase products
- Track waste collection rewards
- View wallet balance
- Redeem points

### B. Farmer/Vendor
- Add products to catalogue
- View availability status
- Track sold quantities
- Manage daily inventory

### C. Counter Staff/Stall Operator
- Ring up sales at counter
- Update inventory after each sale
- View real-time stock levels
- Process cash/digital transactions
- Manage multiple stalls

### D. Garbage Picker/Collector
- Scan QR codes on waste bags
- Update collection status
- View payment/incentives

### E. Admin
- Overall platform management
- User verification
- Commission/fee management
- Report generation
- Content moderation

---

## 3. CORE FEATURES & MODULES (VERSION 1)

### Module 1: PRODUCT CATALOGUE & AVAILABILITY DISPLAY

#### 3.1.1 Product Catalogue
```
Product Entity:
├── Basic Info
│   ├── Name
│   ├── Category (Vegetables, Fruits, Cafe Items, etc.)
│   ├── Description
│   └── Photos
├── Pricing
│   ├── Base price
│   ├── Unit (kg, units, liter, etc.)
│   └── Currency
├── Inventory
│   ├── Current stock quantity
│   ├── Unit of measurement
│   ├── Last updated time
│   └── Available status
├── Source
│   ├── Vendor ID
│   ├── Stall name
│   └── Farmer info
└── Metadata
    ├── Freshness indicator
    ├── Date added
    └── Last restocked date
```

#### 3.1.2 Vendor Panel - Add Products
```
Vendor/Stall Owner Flow:
1. Login → Vendor Dashboard
2. Click "Add Product"
   ├── Fill product name
   ├── Select category
   ├── Upload 2-3 photos
   ├── Set price per unit
   ├── Define unit type (kg, units, etc.)
   └── Set initial stock quantity
3. Preview → Submit
4. Product appears in catalogue immediately
5. Display on web & counter screens
```

---

### Module 2: REAL-TIME AVAILABILITY DISPLAY

#### 3.2.1 Customer/Resident Display (Web/Mobile)
```
Product Discovery:
├── Homepage
│   ├── Featured products
│   ├── All available items
│   └── Sort by category/vendor
│
├── Search Bar
│   ├── Search by name
│   ├── Browse by category
│   └── Filter by vendor/stall
│
└── Product Details Page
    ├── Product images
    ├── Current price
    ├── Current stock level (e.g., "25 kg available")
    ├── Unit type (kg, units, liters)
    ├── Vendor/Farmer info
    ├── Description
    └── "Check in-store" or "Contact Vendor" button

Availability Status:
├── IN STOCK: Green badge + quantity
├── LOW STOCK: Yellow badge + "Limited quantity"
├── OUT OF STOCK: Red badge + "No longer available"
└── Last Updated: Real-time timestamp
```

---

### Module 3: COUNTER POINT-OF-SALE (POS) SYSTEM WITH POINTS INTEGRATION

#### 3.3.1 Counter POS Interface (Enhanced with Customer & Points)
```
Staff POS System (Web-based or Tablet):
│
├─── LOGIN
│    └─── Staff ID + Counter Name
│
├─── CUSTOMER LOOKUP
│    ├─── Search by Phone Number
│    ├─── Search by Customer ID
│    ├─── Search by Name
│    └─── (or "No Customer" for cash)  
│
├─── CUSTOMER DETAILS PANEL (if found)
│    ├─── Customer Name
│    ├─── Phone Number
│    ├─── Waste Points Status:
│    │   ├─── 🟢 AVAILABLE POINTS: [500 pts] (ready to use)
│    │   ├─── 🟡 REDEEMABLE POINTS: [300 pts] (can redeem now)
│    │   └─── ⚪ REMAINING POINTS: [200 pts] (locked/pending)
│    └─── Tier Level: [Gold - 1.25x multiplier]
│
├─── SALES SCREEN
│    ├─── Add Products to Bill
│    │   ├─── Search/Scan Product
│    │   ├─── Enter Quantity
│    │   └─── Add to Bill
│    │
│    ├─── LIVE BILL DISPLAY
│    │   ├─── Product 1: Tomatoes (2kg) @ ₹50/kg = ₹100
│    │   ├─── Product 2: Apple (1kg) @ ₹80/kg = ₹80
│    │   ├─── ─────────────────────────────
│    │   └─── SUBTOTAL: ₹180
│    │
│    ├─── POINTS REDEMPTION (if customer found)
│    │   ├─── "Use Points?" [YES] [NO]
│    │   │   IF YES:
│    │   │   ├─── Input points to redeem: [___] (max: 300 pts)
│    │   │   ├─── Rate: 100 pts = ₹10
│    │   │   ├─── Points to Apply: 150 pts = -₹15 discount
│    │   │   └─── Remaining Points after: 350 pts
│    │   │
│    │   └─── OR Auto-apply suggestion
│    │       └─── "Apply 180 pts (-₹18)? Match bill? [YES] [NO]"
│    │
│    ├─── PAYMENT SUMMARY
│    │   ├─── Subtotal: ₹180
│    │   ├─── Points Discount: -₹15 (150 pts applied)
│    │   ├─── ─────────────────────
│    │   └─── FINAL TOTAL: ₹165
│    │
│    ├─── PAYMENT METHOD
│    │   ├─── Cash: ₹165
│    │   ├─── Card: ₹165
│    │   └─── Combination
│    │
│    └─── [COMPLETE SALE] Button
│
├─── POST-PURCHASE
│    ├─── Generate Receipt showing:
│    │   ├─── Subtotal
│    │   ├─── Points redeemed: -150 pts (-₹15)
│    │   ├─── Final Amount
│    │   └─── New Points Balance: 350 pts
│    ├─── Update customer wallet
│    ├─── Update inventory
│    └─── Print/SMS receipt
│
└─── DAILY CLOSING
     ├─── Total sales
     ├─── Points redeemed today
     ├─── Cash reconciliation
     └─── Generate daily report
```

#### 3.3.2 Customer Profile & Points History
```
When Customer Found in System:
├─── Customer Profile Card
│    ├─── Photo or Avatar
│    ├─── Name: Amit Kumar
│    ├─── Phone: +91-98XXXXXX71
│    ├─── Member Since: June 2025
│    ├─── Total Purchases: 45 transactions
│    └─── Last Purchase: 2 days ago
│
├─── WASTE POINTS BREAKDOWN
│    ├─── 🟢 AVAILABLE POINTS: 500 pts
│    │    └─ (Verified waste collections, ready to redeem)
│    │
│    ├─── 🟡 REDEEMABLE POINTS: 300 pts  
│    │    └─ (Can use in this bill)
│    │
│    ├─── ⚪ REMAINING POINTS: 200 pts
│    │    └─ (Pending verification/clearance)
│    │
│    └─── CONVERSION RATE: 100 pts = ₹10
│
└─── RECENT REDEMPTIONS
     ├─── 15 Feb: 100 pts redeemed (-₹10)
     ├─── 10 Feb: 50 pts redeemed (-₹5)
     └─── 5 Feb: 150 pts redeemed (-₹15)
```

#### 3.3.3 Receipt/Bill Generation with Points Tracking
```
Enhanced Receipt (with Points):
├─── HEADER
│    ├─── Mandi Deals Logo
│    ├─── Receipt #MANDI-2026-0234
│    └─── Date & Time: 27 Feb 2026, 14:32 PM
│
├─── CUSTOMER DETAILS (if purchased with points)
│    ├─── Name: Amit Kumar
│    └─── Phone: +91-98XXXXXX71
│
├─── ITEMIZED LIST
│    ├─── Tomatoes (2kg @ ₹50/kg): ₹100
│    ├─── Apples (1kg @ ₹80/kg): ₹80
│    └─── Banana (0.5kg @ ₹40/kg): ₹20
│
├─── BILLING SUMMARY
│    ├─── Subtotal: ₹200
│    ├─── Points Redeemed: -150 pts (-₹15)
│    ├─── ─────────────────────
│    └─── FINAL AMOUNT: ₹185
│
├─── PAYMENT
│    ├─── Payment Method: Cash
│    └─── Amount Paid: ₹185
│
├─── POINTS UPDATE (if applicable)
│    ├─── Previous Balance: 500 pts
│    ├─── Points Redeemed: -150 pts
│    ├─── New Balance: 350 pts
│    ├─── Tier: Gold (1.25x)
│    └─── Next Reward Milestone: 450 pts
│
└─── FOOTER
     ├─── "Earn more points with waste collection!"
     ├─── "Download app: Scan QR for waste bags"
     ├─── "Thank you for supporting sustainable living!"
     └─── QR Code (to app/loyalty page)

---

### Module 4A: CUSTOMER MANAGEMENT & ACCOUNT SYSTEM

#### 3.4A.1 Customer Account Creation
```
First-Time Customer at Counter:
├─── Staff Asks: "Are you a member?"
├─── NO → Create Account
│    ├─── Enter Phone Number
│    ├─── Enter Name  
│    ├─── Enter Address (optional)
│    ├─── System generates Customer ID
│    ├─── Creates Wallet (0 points initially)
│    └─── Ready for future purchases
│
├─── YES → Lookup by Phone
│    ├─── Search existing customer
│    ├─── Load profile & points
│    └─── Proceed with sale
│
└─── GUEST PURCHASE
     └─── No account needed (cash only, no points)
```

#### 3.4A.2 Points Breakdown System
```
Waste Points Classification:

🟢 AVAILABLE POINTS
├─ Definition: Verified & ready to use
├─ Sources:
│  ├─ Completed waste collections
│  ├─ Bonus points from promotions
│  └─ Tier multiplier applied
├─ Status: Can redeem immediately
└─ Example: 500 points = ₹50 value

🟡 REDEEMABLE POINTS (Subset of Available)
├─ Definition: Can use in this transaction
├─ Criteria:
│  ├─ Available AND
│  ├─ No outstanding issues AND  
│  ├─ Not expired
│  └─ Household account in good standing
├─ Max per transaction: Up to 50% of bill value
└─ Example: Can use up to 150 pts now

⚪ REMAINING POINTS
├─ Definition: Locked/pending points
├─ Reasons for locking:
│  ├─ Pending waste collector verification
│  ├─ Awaiting payment dispute resolution
│  ├─ Expired (due for redemption reminder)
│  └─ Under fraud review
├─ Status: Cannot use now
└─ Example: 200 pts pending verification

FORMULA:
Total Points = Available + Remaining
Redeemable Points = Available (if eligible)
```

#### 3.4B.1 Stock Management Dashboard
```
Vendor/Manager View:
├── Current Inventory
│   ├── Product list
│   ├── Current stock level
│   ├── Unit type
│   ├── Last updated
│   └── Availability status
│
├── Update Stock
│   ├── Manual stock update
│   ├── Add new stock received
│   ├── Mark as out-of-stock
│   ├── Edit price if needed
│   └── Save changes
│
├── Stock Alerts
│   ├── Low stock notifications
│   ├── Out of stock alerts
│   ├── Overstock warnings (if perishable)
│   └── Reorder suggestions
│
└── Sales Report
    ├── Today's sales summary
    ├── Items sold by product
    ├── Revenue per product
    └── Time-based sales graph
```

#### 3.4B.2 Inventory Sync Flow
```
Inventory Update Process:
│
├── At Counter/POS
│   └── Staff completes sale
│       └── System deducts quantity
│           └── Sends to backend
│               └── Updates product available stock
│                   └── Real-time web display updates
│
├── Manual Updates by Vendor
│   └── Vendor opens dashboard
│       └── Clicks "Update Stock"
│           └── Enters new quantity
│               └── Saves
│                   └── Immediately visible on web
│
└── Display Update Timeline
    ├── Counter POS: Immediate
    ├── Web product pages: Real-time (< 2 sec)
    ├── Mobile app: Real-time sync
    └── Counter display screens: Real-time
```

---

### Module 5: WASTE REWARDS PROGRAM

#### 3.5.1 QR Code Bag System
```
Bag Setup:
├── Physical QR Code Bag
│   ├── Unique QR code per household
│   ├── Household registration
│   ├── Bag ID linking to user
│   └── Waste category indicators
├── Registration Flow
│   ├── User receives bag
│   ├── Scans QR to "activate"
│   ├── Links to household profile
│   └── Set preferred collection day/time
└── Replacement/Damaged
    ├── Request new bag
    ├── Deactivate old QR
    └── Activate new QR
```

#### 3.5.2 Waste Collection Flow
```
Garbage Picker App Flow:
├── Driver Login
├── Daily Route
│   ├── Assigned households
│   ├── Scheduled collection times
│   └── Distance to next location
├── At Household
│   ├── Scan QR code on bag
│   └── System shows:
│       ├── Household info
│       ├── Previous collection history
│       ├── Points earned to date
│       └── Reward tier status
├── Record Collection
│   ├── Waste quantity (visual/weight)
│   ├── Waste quality (properly segregated or not)
│   ├── Contamination level
│   └── Take photo proof
├── Points Calculation
│   ├── Base points for collection
│   ├── Bonus for proper segregation
│   ├── Deduction for contamination
│   └── Multiplier based on quantity
└── Immediate Feedback
    ├── Show points earned
    ├── Send notification to household
    └── Update wallet
```

#### 3.5.3 Points Calculation Engine
```
Points Allocation:
├── Base Points (per collection)
│   ├── 10 points per collection (minimum)
│   ├── Additional based on quantity
│   │   ├── 1-5 kg: +5 points
│   │   ├── 5-10 kg: +10 points
│   │   └── 10+ kg: +15 points
│   └── Waste type bonus
│       ├── Organic waste: +5 points
│       ├── Plastic segregation: +10 points
│       └── Mixed waste penalty: -5 points
├── Quality Bonus
│   ├── Proper segregation: +10 points
│   ├── Clean/dry condition: +5 points
│   └── Contamination penalty: -10 to -30 points
├── Tier Multipliers
│   ├── Bronze (0-500 points): 1x
│   ├── Silver (501-1500 points): 1.1x
│   ├── Gold (1501-3000 points): 1.25x
│   └── Platinum (3000+ points): 1.5x
└── Redemption Rate
    ├── 100 points = ₹10 (example)
    ├── Or discount at store
    └── Minimum redemption: 50 points
```

#### 3.5.4 Household Waste Dashboard
```
Resident Dashboard Shows:
├── Total Points Earned
├── Current Balance
├── Tier Status & Progress
├── Collection History
│   ├── Date & time
│   ├── Points earned
│   ├── Collector name
│   └── Waste details
├── Upcoming Collection
│   ├── Scheduled date
│   ├── Time window
│   └── Collector info
├── Rewards Available
│   ├── Store discounts
│   ├── Free products
│   └── Cash withdrawal
└── Impact Stats
    ├── Total waste collected
    ├── Environmental impact (CO2 saved)
    └── Leaderboard ranking
```

---

### Module 6: QR SCANNER & WASTE INTEGRATION

#### 3.6.1 QR Scanner Features
```
QR Code Structure:
{
  "bag_id": "MANDI-2026-001-00123",
  "household_id": "HH-00123",
  "member_id": "MEM-00456",
  "society_id": "SOC-001",
  "created_date": "2025-06-15",
  "activation_status": "active",
  "version": "1.0"
}

Scanner Capabilities:
├── Built-in Mobile App Scanner
│   ├── Camera integration
│   ├── Real-time QR detection
│   ├── Offline backup (local storage)
│   └── Auto-sync when online
├── Web-based Scanner
│   ├── Webcam integration
│   ├── Works on desktop/tablet
│   └── Data export capability
├── Error Handling
│   ├── Invalid QR codes
│   ├── Already collected bags (same day)
│   ├── Deactivated bags
│   └── Duplicate scan detection
└── Success Confirmation
    ├── Audio/visual feedback
    ├── Points calculated instantly
    ├── SMS confirmation to household
    └── Data synced to server
```

#### 3.6.2 Backend QR Processing
```
QR Scan API Endpoint: POST /api/waste/scan-qr

Request:
{
  "qr_code": "MANDI-2026-001-00123",
  "collector_id": "COL-789",
  "timestamp": "2026-02-27 14:30:00",
  "location": {
    "latitude": 28.6139,
    "longitude": 77.2090,
    "address": "..."
  },
  "waste_collection": {
    "estimated_weight": 4.5,
    "waste_type": ["organic", "paper"],
    "contamination_level": "low",
    "photo_proof": "base64_image"
  }
}

Response:
{
  "status": "success",
  "transaction_id": "TXN-123456",
  "household_info": {...},
  "points_earned": {
    "base_points": 10,
    "quality_bonus": 5,
    "tier_multiplier": 1.1,
    "total_points": 16.5
  },
  "new_wallet_balance": 256.5,
  "notifications": [
    "SMS to household",
    "Push notification",
    "Email receipt"
  ]
}
```

---

## 4. DATABASE SCHEMA (Version 1 - Simplified)

### Users Table (Residents/Customers)
```sql
users
├── user_id (PK)
├── customer_id (UNIQUE) - generated for residents
├── name
├── phone (UNIQUE)
├── email
├── password_hash
├── user_type (resident, vendor, staff, admin, collector)
├── address
├── profile_photo
├── registration_date
├── account_status (active, suspended, deleted)
└── updated_at
```

### Customer Resident Profile Table
```sql
customer_profiles
├── profile_id (PK)
├── user_id (FK) - to users table
├── customer_id (UNIQUE)
├── household_address
├── apartment_number
├── society_id (FK)
├── total_purchases
├── last_purchase_date
├── member_since
├── preferred_payment_method
├── loyalty_tier (Bronze, Silver, Gold, Platinum)
├── tier_updated_date
└── notes
```

### Wallet Table (Enhanced with Points Breakdown)
```sql
wallets
├── wallet_id (PK)
├── user_id (FK)
├── total_points_balance
├── available_points (verified & ready to use)
├── redeemable_points (subset of available, eligible for redemption)
├── remaining_points (locked/pending verification)
├── total_points_earned (lifetime)
├── total_points_redeemed (lifetime)
├── tier_level (Bronze=1x, Silver=1.1x, Gold=1.25x, Platinum=1.5x)
├── conversion_rate (e.g., 100 pts = ₹10)
├── last_redeemed_date
├── last_earned_date
└── updated_at
```

### Products Table
```sql
products
├── product_id (PK)
├── vendor_id (FK)
├── category_id (FK)
├── name
├── description
├── price_per_unit
├── current_stock
├── unit_type (kg, units, liters, etc.)
├── photos (array/JSON)
├── availability_status (in-stock, low-stock, out-of-stock)
├── last_updated
└── created_at
```

### Vendors/Stalls Table
```sql
vendors
├── vendor_id (PK)
├── user_id (FK)
├── stall_name
├── category (Fruits, Vegetables, Cafe Items)
├── location_in_society (stall_number, area)
├── phone
├── is_active
└── created_at
```

### Daily Sales Transactions Table
```sql
sales_transactions
├── transaction_id (PK)
├── staff_id (FK) [who processed]
├── vendor_id (FK) [whose product]
├── product_id (FK)
├── quantity_sold
├── unit_price
├── total_amount
├── payment_method (cash/digital)
├── transaction_date
├── transaction_time
└── status
```

### Inventory Updates Table
```sql
inventory_updates
├── update_id (PK)
├── product_id (FK)
├── vendor_id (FK)
├── previous_stock
├── new_stock
├── reason (sale, restock, adjustment, waste)
├── updated_by (user_id)
├── update_timestamp
└── notes
```

### Waste Bags Table (same as before)
```sql
waste_bags
├── bag_id (PK)
├── qr_code (UNIQUE)
├── household_id (FK)
├── member_id (FK)
├── society_id (FK)
├── status (active, inactive, replaced)
├── created_date
└── deactivated_date
```

### Waste Collections Table (same as before)
```sql
waste_collections
├── collection_id (PK)
├── bag_id (FK)
├── household_id (FK)
├── collector_id (FK)
├── collection_date
├── collection_time
├── waste_weight
├── waste_type (JSON array)
├── contamination_level
├── points_earned
├── tier_multiplier
├── photo_proof_url
├── location (lat/long)
└── sync_status
```

### Wallet Table (Points only, no cash management)
```sql
wallets
├── wallet_id (PK)
├── user_id (FK)
├── points_balance
├── total_points_earned
├── total_points_redeemed
├── tier_level (Bronze, Silver, Gold, Platinum)
└── updated_at
```

### Points Transactions Table (Enhanced)
```sql
points_transactions
├── transaction_id (PK)
├── wallet_id (FK)
├── user_id (FK)
├── type (earn, redeem, bonus, adjustment, reversal)
├── points_amount
├── points_status (verified, pending, disputed, cancelled)
├── reference_type (waste_collection_id, sales_transaction_id, promo_id)
├── reference_id (actual ID from reference)
├── reason (description)
├── balance_before
├── balance_after
├── tier_multiplier_applied
├── created_at
├── verified_date
└── notes
```

### Points Redemption History Table (NEW)
```sql
points_redemptions
├── redemption_id (PK)
├── wallet_id (FK)
├── user_id (FK)
├── sales_transaction_id (FK)
├── points_redeemed
├── cash_value_given (₹)
├── discount_percentage
├── bill_amount
├── payment_method (cash, card, combined)
├── staff_id (who processed)
├── counter_id
├── redemption_date
├── redemption_time
└── status (completed, reversed, disputed)
```

---

## 5. FEATURE FLOW DIAGRAMS

### Flow 1: Customer Shopping & Checkout
```
START
  ↓
Browse Products
  ├── Search/Filter
  ├── View vendor profiles
  └── Check ratings
  ↓
Add to Cart
  ↓
Review Cart
  ├── Modify quantities
  ├── Remove items
  └── Review estimated rewards
  ↓
Apply Promotional Code/Wallet
  ├── Loyalty discount
  ├── Seasonal offer
  └── Waste rewards redeem
  ↓
Checkout
  ├── Select address
  ├── Choose payment method
  └── Review invoice preview
  ↓
Payment Processing
  ├── Payment gateway
  ├── Wallet deduction
  └── Payment verification
  ↓
Order Confirmation
  ├── Generate invoice
  ├── Email/SMS confirmation
  ├── Credit points to wallet
  └── Notify vendor
  ↓
Order Tracking
  ├── Vendor picks order
  ├── Packed notification
  ├── Ready for pickup/delivery
  └── Delivery confirmation
  ↓
END
```

### Flow 2: Waste Collection & Points Earning
```
START
  ↓
Household Receives Waste Bag with QR
  ├── Registration in app
  ├── Link to household
  └── Set collection preferences
  ↓
Schedule Collection
  ├── Select preferred day/time
  └── Add to garbage picker route
  ↓
Collection Day
  ├── Collector receives route
  ├── Navigate to addresses
  └── Arrive at household
  ↓
Scan QR Code
  ├── Garbage picker app opens
  ├── Scan QR on bag
  └── System validates bag
  ↓
Record Collection Details
  ├── Estimate waste weight
  ├── Assess waste segregation
  ├── Rate contamination level
  ├── Take photo proof
  └── Comment (optional)
  ↓
Points Calculation
  ├── Base points calculation
  ├── Apply quality bonus/penalty
  ├── Apply tier multiplier
  └── Final points calculated
  ↓
Immediate Confirmation
  ├── Show points earned on screen
  ├── Update household wallet
  ├── Send SMS/push notification
  └── Record transaction
  ↓
Household Benefits
  ├── Points added to wallet
  ├── Can be used to buy products
  ├── Can convert to cash
  └── Contribute to tier progression
  ↓
END
```

### Flow 3: Vendor Product Management
```
START
  ↓
Vendor Login to Dashboard
  ↓
View Current Products
  ├── Stock levels
  ├── Sales data
  ├── Ratings
  └── Reviews
  ↓
Add New Product
  ├── Fill product details
  ├── Set category & pricing
  ├── Upload images
  ├── Set inventory
  └── Define availability
  ↓
Submit for Review
  ├── Admin verification
  ├── Quality check
  └── Category validation
  ↓
Product Approval Decision
  ├── ✓ Approved → Goes live
  │  └── Appears in marketplace
  ├── ✗ Rejected → Feedback provided
  │  └── Edit and resubmit
  └── Pending → Await review
  ↓
Monitor Product Performance
  ├── Real-time sales
  ├── Customer ratings & reviews
  ├── Stock alerts
  └── Trend analysis
  ↓
Manage Inventory
  ├── Update stock quantities
  ├── Set reorder alerts
  ├── Archive/unpublish products
  └── Apply discounts
  ↓
View Earnings & Settlements
  ├── Daily/weekly/monthly sales
  ├── Commission breakdown
  ├── Net payment calculation
  └── Withdrawal requests
  ↓
END
```

---

## 6. TECHNICAL STACK RECOMMENDATIONS (VERSION 1)

### Frontend
```
├── Web Application (Browsing + Admin)
│   ├── Framework: React.js / Vue.js
│   ├── State Management: Redux/Context API
│   ├── UI Library: Tailwind CSS / Bootstrap
│   ├── Simple charting: Chart.js
│   └── No payment gateway integration
│
├── Counter POS (Web-based)
│   ├── Framework: React.js / Vue.js
│   ├── Product search: Simple filter
│   ├── Receipt printing: html2pdf / print.js
│   ├── Barcode scanner: quagga2
│   └── Offline support: Service Workers
│
└── Mobile Application (Waste Rewards)
    ├── Framework: React Native / Flutter
    ├── QR Scanner: react-native-vision-camera
    ├── Maps: React Native Maps
    ├── Local Storage: AsyncStorage
    └── Push Notifications: Firebase
```

### Backend
```
├── Framework: Node.js (Express) or Python (FastAPI/Django)
├── Database: PostgreSQL (primary) + Redis (cache)
├── Authentication: JWT tokens
├── File Storage: AWS S3 or local file system
├── QR Code Generation: qrcode library
├── SMS/Email: Twilio / SendGrid
├── No payment gateway needed for v1
├── Task Queue: Bull (Redis) for background jobs
├── API Documentation: Swagger/OpenAPI
└── Real-time: Socket.io for inventory sync
```

### Infrastructure
```
├── Hosting: AWS / DigitalOcean / Heroku (for MVP)
├── Containerization: Docker
├── Database: PostgreSQL (managed service)
├── Cache: Redis (managed service)
├── CDN: CloudFlare (for image optimization)
├── Logging: Simple file logging (upgrade later)
└── Monitoring: Basic health checks
```

---

## 7. IMPLEMENTATION ROADMAP - VERSION 1

### Phase 1: MVP (6-8 weeks)
```
Week 1-2: Project Setup & Design
├── Database design finalization
├── API specification (REST endpoints)
├── UI/UX wireframes for:
│   ├── Product browsing page
│   ├── Counter POS interface
│   ├── Vendor inventory dashboard
│   └── Admin panel
├── Team setup & tools
└── Development environment

Week 3-4: Backend Core Development
├── User authentication system
├── Product management APIs
├── Real-time inventory sync endpoints
├── Sales transaction logging
├── QR code generation for waste bags
└── Database migrations

Week 5-6: Frontend & Counter POS Development
├── Product browsing page (web)
├── Counter POS interface with:
│   ├── Product search
│   ├── Add to bill
│   ├── Receipt generation/printing
│   └── Cash handling
├── Real-time inventory display
├── Vendor dashboard basics
└── Admin panel basics

Week 7-8: Waste Rewards Integration
├── Waste bag QR code system
├── QR scanner mobile app (basic)
├── Points calculation engine
├── Wallet management (points only)
├── Transaction logging
└── Household dashboard

Week 9: Testing & Launch
├── QA testing (all flows)
├── Counter POS testing
├── UAT with test group
├── Bug fixes
└── Deploy to production
```

### Phase 2: Enhanced Features (4-6 weeks after v1 launch)
```
├── Advanced product filtering
├── Vendor analytics dashboard
├── Multi-language support
├── Enhanced QR scanner (offline mode)
├── Tier system & achievements
├── Admin reporting & analytics
├── Mobile app for vendors (inventory update)
└── Promotional campaigns
```

### Phase 3: Scale & Optimization (Ongoing)
```
├── Performance optimization
├── Database indexing & caching
├── Multiple society support
├── Social features (reviews, ratings)
├── Recommendation engine
└── Payment integration (for future versions)
```

---

## 8. SECURITY CONSIDERATIONS (V1)

### Data Protection
```
├── Authentication
│   ├── JWT tokens with expiration
│   ├── Password hashing (bcrypt)
│   ├── Session management
│   └── Staff ID verification at counter
├── Data Encryption
│   ├── HTTPS for all communications
│   ├── Database encryption at rest
│   └── Sensitive data hashing
├── Authorization
│   ├── Role-based access control
│   ├── Data isolation per vendor/household
│   └── API rate limiting
├── QR Code Security
│   ├── Unique encrypted codes
│   ├── Timestamp validation
│   ├── GPS verification
│   └── Photo proof of collection
└── Cash Handling
    ├── Transaction logging
    ├── Reconciliation reports
    └── Staff audit trails
```

---

## 9. SUCCESS METRICS (V1)

### Platform Metrics
```
├── Users
│   ├── Active households: 500+ (first month)
│   ├── Monthly active users: 60%+ retention
│   └── Registered vendors: 20-30
├── Transactions
│   ├── Daily sales transactions: 100+
│   ├── Average transaction value: ₹300-500
│   └── Monthly revenue: ₹10-15 L
├── Inventory
│   ├── Inventory sync accuracy: 95%+
│   ├── Real-time update time: < 2 seconds
│   └── Counter POS uptime: 99%+
└── Vendor Performance
    ├── Vendor onboarding time: < 24 hours
    ├── Vendor satisfaction: 4.5+/5
    └── Active sellers: 80%+ monthly
```

### Waste Program Metrics
```
├── Collections
│   ├── Weekly collection rate: 60%+ of households
│   ├── Average waste per collection: 5+ kg
│   └── Contamination reduction: Target 25%
├── Participation
│   ├── Households with active QR bags: 500+
│   ├── Points redemption rate: 40%+ of earned
│   └── Tier progression: 30%+ to Silver+
└── Environmental Impact
    ├── Total waste collected: 1000+ kg/month
    ├── Estimated CO2 saved: 200+ kg
    └── Community engagement score
```

### Operational Metrics
```
├── Counter Operations
│   ├── Average transaction time: < 2 minutes
│   ├── Receipt print rate: 99%+
│   ├── Staff satisfaction: 4+/5
│   └── Cash reconciliation accuracy: 99%+
├── System Performance
│   ├── Page load time: < 2 seconds
│   ├── API response time: < 500ms
│   ├── Database query time: < 200ms
│   └── System uptime: 99.5%+
└── Support
    ├── Response time: < 4 hours
    ├── Resolution rate: 90%+ first contact
    └── User satisfaction: 4.5+/5
```

---

## 10. RISKS & MITIGATION (V1)

| Risk | Mitigation |
|------|------------|
| Poor data entry at counter | Staff training, barcode/QR scanning for products |
| Real-time sync delays | WebSocket/Socket.io for instant updates |
| Incorrect inventory counts | Periodic reconciliation, automated stock checks |
| Staff errors in sales | Simple POS design, confirmation before finalize |
| QR code fraud in waste | Photo verification, GPS tracking, encrypted QR |
| Low vendor adoption | Easy onboarding, instant visibility, support team |
| System downtime affecting sales | Offline POS mode with sync when back online |
| Cash handling discrepancies | Daily reconciliation, audit trails, staff verification |

---

## 11. NEXT STEPS FOR V1

1. **Finalize Specifications** - Get stakeholder approval on this design
2. **Database Design** - Create detailed ER diagrams
3. **API Documentation** - Define all REST endpoints in Swagger
4. **Create Prototypes** - Build interactive mockups of key flows
5. **Assemble Dev Team** - Hire frontend, backend, mobile developers
6. **Setup Development Environment** - Git repos, Docker, CI/CD pipeline
7. **Begin Development** - Start with database and backend APIs
8. **Parallel Track** - Counter POS UI development
9. **Integration Testing** - Ensure real-time sync works
10. **Beta Testing** - Test with select vendors and households
11. **Launch** - Deploy to production

---

## 12. FUTURE ENHANCEMENTS (After V1)

### Version 2 Features
```
├── Payment Gateway Integration
│   ├── Online wallet system
│   ├── UPI/Card payments
│   ├── Cash redemption at POS
│   └── Payment reports
├── Order Delivery
│   ├── Online ordering system
│   ├── Delivery logistics
│   ├── Order tracking
│   └── Delivery partner integration
├── Advanced Analytics
│   ├── Vendor dashboard analytics
│   ├── Predictive inventory
│   ├── Demand forecasting
│   └── Reports & insights
├── Customer Loyalty
│   ├── Referral program
│   ├── Seasonal promotions
│   ├── Subscriber benefits
│   └── VIP tiers
└── Multiple Society Support
    ├── Multi-tenant architecture
    ├── Society-specific customization
    ├── Centralized admin panel
    └── Cross-society reporting
```

## CONCLUSION

**Version 1 Focus:** Simple, reliable, in-person marketplace with real-time availability display + waste rewards program.

**Core Value Proposition:**
- **For Residents**: Browse fresh produce, support local farmers, earn points for waste segregation
- **For Vendors**: Direct sales channel with minimal setup, real-time inventory management
- **For Society**: Community marketplace + waste management solution
- **For Environment**: Reduced landfill waste + incentivized recycling

**Key Success Factors:**
1. Rock-solid counter POS system (staff won't use unreliable tools)
2. Real-time inventory sync (keeps web display accurate)
3. Simple vendor onboarding (no friction to join)
4. Engaging waste rewards (drives participation and behavioral change)
5. Excellent customer support (builds trust)

The platform can scale from 1 society to 100+ societies, eventually adding online ordering and delivery in v2.
