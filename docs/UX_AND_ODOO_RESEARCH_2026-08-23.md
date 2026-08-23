# Horizon experience and Odoo research

## Experience principles

The revised Horizon home page follows a narrow first-decision path: destination, date range, guests, and stay type. Supporting discovery content, the property collection, map, and owner information follow after this initial decision. This applies progressive disclosure: show frequent, task-critical controls first and delay secondary material until the user is ready.[1]

The main performance targets are an LCP within 2.5 seconds, INP below 200 milliseconds, and CLS below 0.1, consistent with Google’s Core Web Vitals guidance.[2] The implementation therefore keeps real property media but uses async image decoding, responsive image sizing, a lazy map chunk, and a viewport-gated map mount.

Travel-accommodation UX research covers search, listing comparison, map use, property details, and booking checkout; these are treated as one connected booking journey rather than separate decorative sections.[3]

## Odoo findings

Horizon’s existing server-side flow uses Odoo JSON-RPC, validates the connection without mutation, and only syncs a booking after that unit is mapped to an Odoo product. The production Odoo configuration currently has no enabled connection and none of the required values is configured.

Odoo’s official documentation states that external API access depends on the Odoo plan, and that API keys replace the password in API calls and must be treated with equivalent care.[4] The Rental documentation describes product and rental-price configuration; this supports mapping a Horizon unit to an Odoo rental product once the Odoo environment exists.[5]

## Sources

1. [Nielsen Norman Group — Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/)
2. [Google Search Central — Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals)
3. [Baymard Institute — Travel Accommodations UX Research](https://baymard.com/research/travel-accommodations)
4. [Odoo 18 — External API](https://www.odoo.com/documentation/18.0/developer/reference/external_api.html)
5. [Odoo 19 — Physical Rental Products](https://www.odoo.com/documentation/19.0/applications/sales/rental/configure_products/products.html)
