
# Odoo 19 Integration Guide for Horizon Stays

## Overview
Horizon Stays is now fully integrated with Odoo 19, the latest version of the world's most popular open-source ERP. This integration automates your hospitality business, connecting your property rental website directly to Odoo's powerful suite of apps.

## Integrated Features
| Feature | Odoo Module | Integration Logic |
| :--- | :--- | :--- |
| **Rental** | `rental` | Automatically creates Rental Orders for every booking. |
| **Invoicing** | `account` | Generates invoices for guests upon booking confirmation. |
| **Accounting** | `account_accountant` | Records payments and posts entries to the General Ledger. |
| **Expenses** | `hr_expense` | Tracks property-related expenses and maintenance costs. |
| **Sign** | `sign` | Triggers digital signature requests for rental agreements. |
| **Forum** | `forum` | Connects your website community to Odoo Forums. |
| **Equity** | `equity` | Manages shareholder distribution and cap tables (Odoo 19 native). |
| **ESG** | `esg` | Automates sustainability reporting and carbon footprint tracking. |

## Configuration
To enable the integration, ensure the following environment variables are set in your Vercel project:

- `ODOO_URL`: The URL of your Odoo instance (e.g., `https://horizonstays.odoo.com`).
- `ODOO_DATABASE`: Your Odoo database name.
- `ODOO_USERNAME`: The email address associated with your Odoo admin account.
- `ODOO_API_KEY`: Your Odoo Personal Access Token (PAT).

## Automatic Workflow
1. **iCal Sync**: Every 10 minutes, the system pulls the latest availability from Airbnb and Gatherin.
2. **Booking Ingestion**: New external bookings are automatically added to your Horizon Stays database.
3. **Odoo Sync**: For every new booking, the system triggers a sync to Odoo:
   - Creates a **Customer** if they don't exist.
   - Creates a **Rental Order** in the Rental app.
   - Generates an **Invoice** in the Invoicing app.
   - Records the **Payment** in the Accounting app.
4. **ESG & Equity**: Metrics are periodically synced from Odoo to your Horizon Stays dashboard for real-time monitoring.

## Manual Actions
You can manually trigger a sync for any booking through the Admin Dashboard under the "Integrations" section.

---
*Horizon Stays - Perfectly Integrated Hospitality Management.*
