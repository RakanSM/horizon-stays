# Odoo Integration Setup Guide for Horizon Stays

## Overview

This guide explains how to set up a **free Odoo Community Edition** instance and integrate it with Horizon Stays for complete ERP functionality including Rental Management, Invoicing, Accounting, Expenses, and more.

## Option 1: Free Odoo Cloud (Recommended for Beginners)

### Step 1: Create a Free Odoo Account
1. Go to [Odoo Online](https://www.odoo.com/web/signup)
2. Sign up with your email
3. Create a new database (choose "Rental Management" as your industry)
4. Odoo will automatically set up your instance

### Step 2: Get Your Odoo Credentials
1. Log in to your Odoo instance
2. Go to **Settings > Users & Companies > Users**
3. Click on your user profile
4. Note your **Username** (usually your email)
5. Create an API token:
   - Go to **Settings > Users & Companies > Users**
   - Select your user
   - Scroll to **Access Tokens**
   - Click **New** and copy the generated token

### Step 3: Configure Environment Variables in Vercel

Add these to your Vercel project settings:

```
ODOO_URL=https://yourdomain.odoo.com
ODOO_DATABASE=yourdomain
ODOO_USERNAME=your-email@example.com
ODOO_PASSWORD=your-password
ODOO_API_KEY=your-api-token
```

---

## Option 2: Self-Hosted Odoo (Advanced)

### Prerequisites
- Docker and Docker Compose installed
- At least 2GB RAM available
- PostgreSQL database

### Step 1: Create Docker Setup

Create a `docker-compose.yml` file:

```yaml
version: '3.8'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: odoo
      POSTGRES_USER: odoo
      POSTGRES_PASSWORD: odoo_secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  odoo:
    image: odoo:17.0
    depends_on:
      - db
    environment:
      HOST: db
      PORT: 5432
      USER: odoo
      PASSWORD: odoo_secure_password
    volumes:
      - odoo_data:/var/lib/odoo
    ports:
      - "8069:8069"
    command: odoo --addons-path=/mnt/extra-addons,/usr/lib/python3/dist-packages/odoo/addons

volumes:
  postgres_data:
  odoo_data:
```

### Step 2: Start Odoo

```bash
docker-compose up -d
```

Access Odoo at `http://localhost:8069`

### Step 3: Initial Setup
1. Create a new database
2. Set admin password
3. Install required modules (see below)

---

## Required Odoo Modules

Install these modules in your Odoo instance for full functionality:

1. **Rental Management** (`rental`)
   - Manage rental orders and contracts
   - Track rental periods and pricing

2. **Invoicing** (`account`)
   - Create and manage invoices
   - Track payment status

3. **Accounting** (`account_accountant`)
   - Full accounting features
   - Financial reporting

4. **Expenses** (`hr_expense`)
   - Track property expenses
   - Categorize maintenance costs

5. **Digital Signatures** (`sign`)
   - Create rental agreements
   - Collect e-signatures

6. **Analytic Accounting** (`analytic`)
   - Track costs per property
   - Generate profit/loss reports

7. **Sale Management** (`sale`)
   - Manage sales orders
   - Track quotations

### How to Install Modules

1. Go to **Apps** in Odoo
2. Search for each module name
3. Click **Install**

---

## Integration with Horizon Stays

### Automatic Workflow

When a guest books a property on your website:

1. **Booking Created** → Triggers Odoo integration
2. **Rental Order Created** → In Odoo Rental module
3. **Guest Added** → As a customer in Odoo
4. **Invoice Generated** → Automatically
5. **Payment Recorded** → From MyFatoorah
6. **Accounting Entry** → Posted to GL

### API Endpoints

#### Create Rental Order
```
POST /api/integrations/odoo
Content-Type: application/json

{
  "action": "create_rental_order",
  "bookingId": "booking-uuid"
}
```

#### Create Invoice
```
POST /api/integrations/odoo
Content-Type: application/json

{
  "action": "create_invoice",
  "bookingId": "booking-uuid"
}
```

#### Record Payment
```
POST /api/integrations/odoo
Content-Type: application/json

{
  "action": "record_payment",
  "bookingId": "booking-uuid"
}
```

#### Check Integration Status
```
GET /api/integrations/odoo?action=status
```

---

## Database Schema Updates

Your Supabase `bookings` table should include these columns to track Odoo references:

```sql
ALTER TABLE bookings ADD COLUMN odoo_rental_order_id INTEGER;
ALTER TABLE bookings ADD COLUMN odoo_invoice_id INTEGER;
ALTER TABLE bookings ADD COLUMN odoo_payment_id INTEGER;
ALTER TABLE bookings ADD COLUMN odoo_sync_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE bookings ADD COLUMN odoo_sync_date TIMESTAMP;
```

---

## Odoo Configuration for Rental Management

### 1. Set Up Rental Products

In Odoo:
1. Go to **Inventory > Products**
2. Create a product for each property type:
   - Name: Property name
   - Type: Service
   - Category: Rental

### 2. Configure Rental Pricing

1. Go to **Rental > Pricing**
2. Set daily/weekly/monthly rates
3. Define minimum rental periods

### 3. Create Rental Agreements

1. Go to **Rental > Agreements**
2. Create standard rental contract template
3. Include terms and conditions

### 4. Set Up Customers

1. Go to **Contacts**
2. Manually add or import guest list
3. Set payment terms

---

## Financial Reporting

### Monthly Rental Revenue Report

1. Go to **Accounting > Reports > Profit & Loss**
2. Filter by date range
3. View revenue from rental accounts

### Property-Wise Expense Tracking

1. Go to **Accounting > Analytic Accounting**
2. Create analytic accounts for each property
3. Track expenses per property

### Guest Payment Status

1. Go to **Accounting > Customers**
2. View outstanding invoices
3. Track payment history

---

## Troubleshooting

### Connection Issues

**Problem:** "Failed to authenticate with Odoo"

**Solution:**
- Verify Odoo URL is correct
- Check username and password
- Ensure API token is valid
- Check firewall/network access

### Missing Modules

**Problem:** "Module not found" error

**Solution:**
- Install required modules (see above)
- Restart Odoo service
- Clear browser cache

### Payment Not Recording

**Problem:** Payment not appearing in Odoo

**Solution:**
- Check invoice exists in Odoo
- Verify payment method is configured
- Check MyFatoorah webhook is enabled

---

## Support & Documentation

- **Odoo Documentation:** https://www.odoo.com/documentation
- **Rental Module Guide:** https://www.odoo.com/documentation/17.0/applications/sales/rental.html
- **API Reference:** https://www.odoo.com/documentation/17.0/developer/reference/external_api.html

---

## Next Steps

1. ✅ Set up Odoo (Cloud or Self-Hosted)
2. ✅ Install required modules
3. ✅ Configure environment variables
4. ✅ Deploy updated code to Vercel
5. ✅ Test integration with a test booking
6. ✅ Monitor Odoo for synced data

Once everything is working, all your bookings will automatically flow into Odoo for complete business management!
