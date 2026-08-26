<!-- impeccable:product-schema 1 -->

# PRODUCT.md — ECP Admin (E-Commerce Platform Administration)

## Overview
ECP Admin is an internal management application for the E-Commerce Platform. It empowers store operations teams, inventory managers, procurement specialists, and system administrators to manage products, SKUs, inventory, purchase orders, suppliers, warehouses, users, and audit logs.

## Surface Lane
- **Type**: Product UI / Internal Admin Dashboard
- **Focus**: Operational efficiency, data density, fast data entry, quick scanning, structured workflows, clear status visibility, and robust data filtering/export.

## Target Audience
- **Inventory & Operations Managers**: Stock tracking, warehouse management, supplier interactions, and purchase orders.
- **Product Catalog Managers**: Category management, brand setup, product variant & SKU configuration.
- **Store Administrators**: Role-based access control, user management, system setting updates, and audit trail inspection.

## Key Operational Workflows
1. **Catalog Management**: Creation, maintenance, and categorization of brands, categories, products, and SKUs.
2. **Inventory & Procurement**: Stock level monitoring across warehouses, supplier management, purchase order generation, and fulfillment tracking.
3. **Administration & Audit**: User administration, role management, file attachments, and audit log analysis.

## Voice & Tone
- **Direct & Action-Oriented**: Clear labels, unambiguous action names (e.g., "Create SKU", "Approve Order", "Export Report").
- **Concise & Informative**: Informative tooltips, explicit error messaging, and immediate inline feedback.
- **Uncluttered & High-Contrast**: Minimal fluff, prominent status indicators, and clean numerical tabular data.

## Anti-Patterns & Constraints
- Avoid decorative/excessive animations that delay user interaction or page rendering.
- Avoid low-contrast badge colors or ambiguous status chips.
- Avoid hidden key actions inside deep menus; keep bulk actions and common filters readily accessible.
- Ensure strict TypeScript typing (`AGENTS.md` compliance) and never suppress ESLint rules.
