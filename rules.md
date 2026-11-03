# MASTER PROJECT PROMPT
# ISRAFIL BD SHOP – PREMIUM POS & SHOP MANAGEMENT SYSTEM

You are an expert Senior Software Architect, Full-Stack Developer, UI/UX Designer, Database Engineer, and Application Security Specialist.

Your mission is to design and develop a complete, secure, premium-quality Retail POS and Shop Management System called:

**ISRAFIL BD SHOP**

This is a real business application. Do not build a basic student project, static dashboard, or frontend-only prototype.

Build a complete, functional, production-oriented application with beautiful UI, secure backend architecture, reliable database operations, and professional user experience.

==================================================
1. TECHNOLOGY STACK
==================================================

Frontend:
- React.js
- Vite
- JavaScript
- Tailwind CSS
- React Router DOM
- Axios
- Lucide React
- Recharts
- React Hook Form
- Zod or equivalent validation

Backend:
- Laravel
- PHP
- Laravel REST API
- Laravel Sanctum authentication
- Laravel validation
- Laravel Policies and Middleware

Database:
- MySQL
- phpMyAdmin

Image Storage:
- Google Drive API
- Backend-managed image uploads
- Store file ID and image URL in MySQL

Development:
- Localhost
- XAMPP
- Git
- GitHub

The complete system must run locally.

==================================================
2. PREMIUM DESIGN SYSTEM
==================================================

The visual quality of the application is a top priority.

Create an elegant, modern, premium SaaS interface inspired by professional enterprise dashboards and modern retail management applications.

DESIGN DIRECTION:

- Premium and minimal.
- Clean white and soft-gray surfaces.
- Elegant indigo/blue primary color.
- Subtle shadows.
- Soft rounded corners.
- Carefully balanced whitespace.
- Beautiful typography.
- Consistent icon system.
- Smooth transitions.
- Professional charts.
- Clear visual hierarchy.

Avoid:
- Excessive gradients.
- Overly colorful cards.
- Unnecessary animations.
- Cluttered layouts.
- Oversized headings.
- Random colors.
- Inconsistent spacing.
- Unprofessional icons.
- Generic template appearance.

Create a complete design token system for:
- Primary colors.
- Secondary colors.
- Background colors.
- Surface colors.
- Text colors.
- Border colors.
- Status colors.
- Typography.
- Spacing.
- Shadows.
- Border radius.

Use consistent design tokens across all pages.

==================================================
3. APPLICATION LAYOUT
==================================================

Build a premium application shell.

LEFT SIDEBAR:
- Israfil BD Shop logo.
- Brand name.
- Main navigation.
- Grouped navigation sections.
- Clear active navigation indicator.
- Beautiful Lucide icons.
- Collapsible sidebar.
- Tooltips for collapsed navigation.
- Bottom profile section.
- Logout option.

TOP NAVIGATION:
- Breadcrumbs.
- Global search.
- Language switcher.
- Theme switcher.
- Notification center.
- Current date.
- User profile.

MAIN CONTENT:
- Page title.
- Short description.
- Primary action button.
- Breadcrumb navigation.
- Page-specific content.
- Responsive layout.

The sidebar must remain consistent throughout the application.

==================================================
4. LOGIN PAGE – SPECIAL DESIGN PRIORITY
==================================================

Create an exceptionally beautiful and professional login page.

Design concept:
- Premium split-screen layout.
- Left section with Israfil BD Shop branding.
- Elegant abstract retail illustration or decorative geometric visuals.
- Right section containing the login form.
- Clean typography.
- Beautiful input fields.
- Password visibility toggle.
- Remember me.
- Forgot password.
- Secure login button.
- Loading state.
- Validation messages.
- Responsive mobile layout.

Do not expose system information or technical error details on the login page.

Never use default browser alerts.

Login must connect to the actual Laravel authentication API.

==================================================
5. DASHBOARD DESIGN
==================================================

Create a premium business overview dashboard.

Top KPI cards:
- Today's Sales.
- Total Orders.
- Today's Profit.
- Total Expenses.
- Total Products.
- Low Stock.

Each card should include:
- Relevant icon.
- Metric value.
- Comparison with previous period.
- Subtle visual indicator.

Charts:
- Sales Overview.
- Revenue Trends.
- Monthly Performance.
- Expense Analysis.
- Profit and Loss.

Other sections:
- Recent Transactions.
- Best Selling Products.
- Low Stock Alerts.
- Recent Activities.
- Payment Method Breakdown.

All metrics must use real backend data.

==================================================
6. COMPLETE APPLICATION PAGES
==================================================

AUTHENTICATION:
- Login.
- Forgot Password.
- Reset Password.
- Profile.
- Change Password.

DASHBOARD:
- Overview.
- Analytics.

POS:
- POS Terminal.
- Barcode Scanner.
- Product Search.
- Shopping Cart.
- Checkout.
- Payment Processing.
- Checkout Success.

PRODUCTS:
- Product List.
- Add Product.
- Edit Product.
- Product Details.
- Categories.
- Brands.
- Units.
- Barcode Generator.

INVENTORY:
- Stock Overview.
- Stock In.
- Stock Out.
- Stock Adjustment.
- Stock History.
- Low Stock.
- Out of Stock.

CUSTOMERS:
- Customer List.
- Add Customer.
- Edit Customer.
- Customer Details.
- Purchase History.
- Customer Ledger.
- Due Management.

SUPPLIERS:
- Supplier List.
- Add Supplier.
- Edit Supplier.
- Supplier Details.
- Supplier Ledger.

PURCHASES:
- Purchase List.
- New Purchase.
- Purchase Details.
- Purchase Invoice.
- Purchase Returns.

SALES:
- Sales List.
- Sales Details.
- Sales Invoice.
- Sales Returns.
- Refund History.

EXPENSES:
- Expense List.
- Add Expense.
- Edit Expense.
- Expense Categories.
- Expense Details.

ACCOUNTING:
- Income.
- Payments.
- Customer Due.
- Supplier Due.
- Cash Flow.
- Profit and Loss.

REPORTS:
- Daily Reports.
- Weekly Reports.
- Monthly Reports.
- Yearly Reports.
- Product Reports.
- Inventory Reports.
- Sales Reports.
- Purchase Reports.
- Expense Reports.
- Custom Date Reports.

EMPLOYEES:
- Employee List.
- Add Employee.
- Employee Details.
- Roles.
- Permissions.
- Activity Logs.

SETTINGS:
- Shop Profile.
- Logo.
- Invoice Settings.
- Receipt Settings.
- Tax Settings.
- Currency.
- Language.
- Theme.
- Backup.
- System Settings.

==================================================
7. NO DIALOG / NO MODAL POLICY
==================================================

This requirement is mandatory.

Never use:
- Browser alert().
- Browser confirm().
- Browser prompt().
- Modal dialogs.
- Popup-based CRUD forms.

Instead:

- Add Product → Dedicated Add Product Page.
- Edit Product → Dedicated Edit Product Page.
- Product Details → Dedicated Details Page.
- Add Customer → Dedicated Add Customer Page.
- Edit Customer → Dedicated Edit Customer Page.
- Add Expense → Dedicated Add Expense Page.
- Edit Expense → Dedicated Edit Expense Page.

Use dedicated pages and inline components.

For destructive operations, create a dedicated confirmation screen or confirmation route.

Use beautiful toast notifications for:
- Success.
- Error.
- Warning.
- Information.

==================================================
8. POS TERMINAL
==================================================

The POS screen must be exceptionally fast, practical, and visually beautiful.

Layout:
- Product search and category area.
- Barcode scanning input.
- Product grid.
- Cart panel.
- Customer selection.
- Payment summary.

Features:
- USB barcode scanner.
- Automatic barcode detection.
- Product search.
- Category filters.
- Cart management.
- Quantity adjustment.
- Item discount.
- Order discount.
- Tax calculation.
- Customer selection.
- Walk-in customer.
- Cash.
- bKash.
- Nagad.
- Card.
- Bank.
- Split payment.
- Partial payment.
- Due payment.

When scanning a barcode:
1. Identify the product.
2. Verify stock.
3. Add product to cart.
4. Increase quantity for duplicate scans.
5. Update totals instantly.

On checkout:
1. Validate cart.
2. Validate stock on the backend.
3. Create sale using a database transaction.
4. Save sale items.
5. Save payment records.
6. Update stock.
7. Generate unique invoice.
8. Generate printable receipt.

==================================================
9. SECURITY – HIGHEST PRIORITY
==================================================

Security must be implemented at every layer.

AUTHENTICATION:
- Laravel Sanctum.
- Secure session or token authentication.
- Password hashing using Laravel Hash.
- Login rate limiting.
- Account lockout protection where appropriate.
- Secure logout.
- Session expiration.
- Password reset with expiring, single-use tokens.

AUTHORIZATION:
- Role-based access control.
- Permission-based API authorization.
- Backend middleware.
- Laravel Policies.
- Never trust frontend-only permissions.
- Cashier must not access administrative operations.
- Admin must not automatically have unrestricted Super Admin privileges.

API SECURITY:
- Validate every request.
- Use Form Request validation.
- Restrict mass assignment.
- Use Eloquent ORM or parameterized queries.
- Protect against SQL injection.
- Protect against unauthorized ID access (IDOR).
- Configure CORS correctly.
- Use CSRF protection where applicable.
- Rate-limit sensitive endpoints.
- Return safe error responses.
- Never expose stack traces or secrets in production.

FILE SECURITY:
- Validate MIME types.
- Validate extensions.
- Limit upload size.
- Generate safe filenames.
- Never trust user-supplied file paths.
- Store credentials outside public directories.
- Validate Google Drive upload permissions.
- Do not expose Google service account credentials.

FRONTEND SECURITY:
- Never store passwords in localStorage.
- Avoid unsafe HTML rendering.
- Do not expose private API keys.
- Handle expired sessions safely.
- Protect private routes.
- Do not rely on hidden buttons for authorization.

FINANCIAL SECURITY:
- Use database transactions.
- Validate payments server-side.
- Prevent duplicate checkout.
- Use unique invoice numbers.
- Prevent negative stock unless explicitly authorized.
- Use row locking for concurrent stock updates.
- Maintain immutable transaction records.
- Log refunds and stock adjustments.
- Never allow unauthorized changes to completed sales.

BACKUP:
- Provide database backup and restore.
- Restrict backup access to authorized administrators.
- Protect downloaded backup files.
- Test restore procedures.

ENVIRONMENT:
- Keep APP_DEBUG=false in production.
- Keep credentials in .env.
- Never commit .env.
- Provide .env.example without real secrets.
- Use HTTPS in production.
- Disable unnecessary server features.

==================================================
10. DATABASE AND FINANCIAL ACCURACY
==================================================

Design a normalized relational MySQL database.

Use:
- Foreign keys.
- Appropriate indexes.
- Unique constraints.
- Decimal types for money.
- Proper timestamps.
- Soft deletes where appropriate.

Create tables for:
users, roles, permissions, role_permissions, categories, brands, units, products, product_images, stock_movements, customers, suppliers, purchases, purchase_items, purchase_payments, sales, sale_items, sale_payments, expenses, expense_categories, returns, customer_payments, supplier_payments, cash_transactions, settings, activity_logs.

Maintain:
- Purchase cost snapshots.
- Selling price snapshots.
- Discount snapshots.
- Tax snapshots.
- Payment history.
- Stock movement history.

Correctly calculate:
- Gross Revenue.
- Net Revenue.
- Cost of Goods Sold.
- Gross Profit.
- Operating Expenses.
- Net Profit.
- Customer Due.
- Supplier Due.

Never treat total sales as actual profit.

==================================================
11. BANGLA AND ENGLISH SUPPORT
==================================================

Implement complete bilingual support.

Default language: Bangla.

Alternative language: English.

Requirements:
- Language switcher.
- All navigation translated.
- All page titles translated.
- All buttons translated.
- Form labels translated.
- Validation messages translated.
- Toast messages translated.
- Reports translated.
- Invoice labels translated.

Use a proper translation architecture instead of hardcoding text in components.

Support:
- Bangla Unicode.
- English.
- BDT (৳).
- Asia/Dhaka timezone.
- Bangla and English number formatting options.

==================================================
12. GOOGLE DRIVE INTEGRATION
==================================================

Create a dedicated Laravel service for Google Drive.

Requirements:
- Secure image upload.
- Store Google Drive file ID.
- Store image URL.
- Update image.
- Delete image.
- Handle failed uploads.
- Handle inaccessible images.
- Validate uploaded files.

Keep Google credentials in backend environment variables.

For private files, use controlled backend access or secure authorized retrieval.

Never trust arbitrary image URLs submitted by users.

==================================================
13. REPORTS AND INVOICES
==================================================

Generate:
- Daily Sales.
- Monthly Sales.
- Yearly Sales.
- Daily Expenses.
- Monthly Expenses.
- Yearly Expenses.
- Profit and Loss.
- Stock Reports.
- Customer Ledger.
- Supplier Ledger.

Allow:
- PDF Export.
- Excel Export.
- Print.

Invoice designs:
- Premium A4 Invoice.
- 58mm Thermal Receipt.
- 80mm Thermal Receipt.

Invoices must be readable, compact, and printer-friendly.

==================================================
14. GITHUB AND DEVELOPMENT STRUCTURE
==================================================

Maintain a professional GitHub repository.

Branches:
- main
- develop
- feature/auth
- feature/dashboard
- feature/pos
- feature/products
- feature/inventory
- feature/sales
- feature/purchases
- feature/reports
- feature/security

Use meaningful commit messages.

Provide:
- README.md
- .gitignore
- .env.example
- Database documentation.
- API documentation.
- Installation instructions.
- Security documentation.

Never commit credentials or database passwords.

==================================================
15. TESTING REQUIREMENTS
==================================================

Implement tests for:

- Authentication.
- Role permissions.
- Product CRUD.
- Barcode lookup.
- Stock updates.
- Sales creation.
- Duplicate checkout prevention.
- Purchase creation.
- Customer payments.
- Supplier payments.
- Returns and refunds.
- Financial calculations.
- Report calculations.
- File uploads.
- Unauthorized API requests.

Test the complete POS checkout workflow.

Do not mark a feature as complete until its backend, frontend, validation, and database integration work correctly.

==================================================
16. FINAL UI QUALITY REQUIREMENTS
==================================================

Every page must look like part of the same premium application.

Maintain:
- Consistent sidebar.
- Consistent top navigation.
- Consistent button styles.
- Consistent form layouts.
- Consistent table designs.
- Consistent cards.
- Consistent typography.
- Consistent responsive behavior.

Create realistic empty states, loading states, and error states.

Do not use fake functionality or dead buttons.

Every action must perform its actual intended operation.

==================================================
17. DEVELOPMENT EXECUTION PLAN
==================================================

Build the project in these phases:

Phase 1: Architecture, repository and database design.

Phase 2: Laravel backend setup and authentication.

Phase 3: React design system and application layout.

Phase 4: Dashboard and analytics.

Phase 5: Product, category and barcode management.

Phase 6: Inventory management.

Phase 7: POS and checkout.

Phase 8: Sales and invoice.

Phase 9: Customers, suppliers and purchases.

Phase 10: Expenses and accounting.

Phase 11: Reports.

Phase 12: Google Drive integration.

Phase 13: Employee management and permissions.

Phase 14: Bangla/English, dark/light theme.

Phase 15: Security audit, testing and optimization.

IMPORTANT EXECUTION RULES:

- Start with project architecture.
- Explain every implementation step.
- Provide complete working source code.
- Mention exact file paths.
- Provide terminal commands.
- Never skip required files.
- Never use placeholder backend functionality.
- Never invent API responses.
- Verify frontend/backend integration.
- Fix errors before continuing.
- Maintain a working application at every phase.

If the output becomes too large, stop at a logical checkpoint and continue from the exact next file when requested.

FINAL GOAL:

Deliver a complete, beautiful, secure, responsive, bilingual and fully functional retail management platform.

Product Name: ISRAFIL BD SHOP.

Quality Standard: Professional Commercial POS Software.
