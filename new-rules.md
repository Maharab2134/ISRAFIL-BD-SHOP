# PROJECT UPGRADE: ISRAFIL BD SHOP → MULTI-TENANT SAAS PLATFORM

Act as a Principal SaaS Architect, Senior Laravel Engineer, React Architect, Database Security Engineer, and DevOps Engineer.

I have already developed a complete Retail POS and Shop Management System named ISRAFIL BD SHOP.

The existing application includes:
- React + Vite frontend.
- Laravel REST API backend.
- MySQL database.
- phpMyAdmin.
- Authentication.
- Product Management.
- Barcode POS.
- Inventory Management.
- Sales and Invoices.
- Customers and Suppliers.
- Purchases.
- Expenses.
- Accounting.
- Reports.
- Employees and Permissions.
- Google Drive Image Storage.
- Bangla and English support.
- Modern responsive UI.

NOW I WANT TO TRANSFORM THIS EXISTING APPLICATION INTO A COMPLETE COMMERCIAL MULTI-TENANT SAAS PRODUCT.

IMPORTANT: Do not rebuild the existing application from scratch.

First inspect the existing GitHub repository, frontend, backend, database schema, API routes, authentication, and all implemented features.

Preserve all working features and existing design.

Upgrade the existing application without breaking its current functionality.

==================================================
1. SAAS ARCHITECTURE
==================================================

Transform the application into a Multi-Tenant SaaS platform.

Platform Name: Israfil BD Shop SaaS.

Architecture:
- React frontend.
- Laravel backend.
- MySQL shared database.
- Tenant-based data isolation.
- REST API.
- Laravel Sanctum.
- Role and permission management.

User Types:

1. SaaS Super Admin.
2. Shop Owner.
3. Shop Manager.
4. Shop Employee.
5. Cashier.

Each registered business must have an independent tenant.

Example tenants:
- Israfil BD Shop.
- Rahman Electronics.
- Dhaka Fashion House.
- ABC Grocery.

All tenants use the same application infrastructure, but their business data must remain completely isolated.

Use a shared database and shared tenant-owned tables with tenant_id for the initial architecture.

==================================================
2. TENANT MANAGEMENT
==================================================

Implement:
- Tenant Registration.
- Tenant Profile.
- Shop Information.
- Shop Logo.
- Shop Settings.
- Tenant Users.
- Tenant Status.
- Tenant Activation.
- Tenant Suspension.
- Tenant Deactivation.
- Tenant Search.
- Tenant Analytics.

Create secure tenant resolution middleware.

IMPORTANT SECURITY RULE:

Never trust tenant_id received from the frontend.

Resolve the active tenant from authenticated server-side context.

Every tenant-owned database query must enforce tenant ownership.

Implement:
- Tenant-aware Laravel middleware.
- Tenant-aware service layer.
- Tenant-aware repository queries where useful.
- Tenant-aware authorization policies.
- Automated cross-tenant access tests.

Prevent IDOR and cross-tenant data leakage.

==================================================
3. SAAS PUBLIC WEBSITE
==================================================

Create a beautiful commercial SaaS landing website.

Pages:
- Home.
- Features.
- Pricing.
- About Us.
- Contact.
- FAQ.
- Login.
- Register.
- Terms and Conditions.
- Privacy Policy.

Design:
- Premium SaaS website.
- Professional hero section.
- Modern typography.
- Product screenshots.
- Feature cards.
- Pricing comparison.
- Customer testimonials.
- FAQ accordion.
- Clear call-to-action.
- Responsive mobile design.

Add buttons:
- Start Free Trial.
- Create Your Shop.
- View Pricing.
- Login.

Do not invent real customer testimonials or business statistics.

==================================================
4. REGISTRATION AND ONBOARDING
==================================================

Create a complete Shop Registration workflow.

Registration fields:
- Owner Name.
- Email.
- Phone.
- Password.
- Shop Name.
- Business Type.
- Shop Address.
- Country.
- Timezone.

After registration:

Step 1: Create owner account.

Step 2: Create tenant.

Step 3: Verify email or phone using a secure verification workflow.

Step 4: Select subscription plan.

Step 5: Start free trial or complete payment.

Step 6: Configure shop information.

Step 7: Create the first branch if permitted.

Step 8: Add first product.

Step 9: Complete onboarding.

Step 10: Redirect to the Shop Dashboard.

Use a beautiful onboarding wizard with progress indicators.

==================================================
5. SUBSCRIPTION MANAGEMENT
==================================================

Create a complete subscription management engine.

Initial plans should be configurable from the Super Admin dashboard.

Suggested plans:

STARTER:
- 1 Branch.
- 1 User.
- 500 Products.
- Basic Reports.

PROFESSIONAL:
- 1 Branch.
- 5 Users.
- 5,000 Products.
- Advanced Reports.
- Accounting.

BUSINESS:
- 3 Branches.
- 15 Users.
- 20,000 Products.
- Advanced Analytics.
- Priority Support.

ENTERPRISE:
- Custom Branch Limits.
- Custom User Limits.
- Custom Product Limits.
- Advanced Features.
- Dedicated Support.

These values and prices must never be hardcoded in business logic.

Store plan features, limits, and pricing in MySQL.

Subscription features:
- Monthly Subscription.
- Yearly Subscription.
- Free Trial.
- Upgrade.
- Downgrade.
- Renewal.
- Cancellation.
- Expiration.
- Grace Period.
- Suspension.
- Reactivation.
- Payment History.
- Subscription Invoice.

Subscription statuses:
- Trial.
- Active.
- Past Due.
- Expired.
- Suspended.
- Cancelled.

Enforce subscription limits on the Laravel backend.

Examples:
- Block additional users after reaching user limit.
- Block additional products after reaching product limit.
- Block additional branches after reaching branch limit.

Never rely only on frontend restrictions.

Define clear rules for existing data when a subscription expires. Do not delete customer business data automatically.

==================================================
6. BILLING AND PAYMENT GATEWAYS
==================================================

Build a complete Billing System.

Support integration with:
- bKash Merchant Payment API.
- Nagad Merchant Payment API.
- SSLCommerz.

Use official merchant integration documentation.

Payment workflow:
1. Select plan.
2. Select billing cycle.
3. Generate payment transaction.
4. Redirect or initiate payment.
5. Verify payment on the backend.
6. Process verified webhook or callback.
7. Activate or renew subscription.
8. Generate subscription invoice.
9. Save payment history.

Security:
- Verify gateway signatures and transactions.
- Use idempotency.
- Prevent duplicate payments.
- Never activate subscriptions from unverified frontend responses.
- Never store card information.
- Keep gateway credentials in .env.
- Provide sandbox and production configuration.

If merchant credentials are unavailable, implement a working sandbox/test mode and clearly document what is required for live activation.

==================================================
7. SUPER ADMIN DASHBOARD
==================================================

Build a separate premium Super Admin Dashboard.

Overview metrics:
- Total Tenants.
- Active Tenants.
- Trial Tenants.
- Suspended Tenants.
- Total Subscriptions.
- Monthly Recurring Revenue (MRR).
- Annual Recurring Revenue (ARR).
- Monthly Payments.
- Yearly Revenue.
- Failed Payments.
- Churn Rate.

Management:
- All Shops.
- Shop Details.
- Subscription Plans.
- Subscription Management.
- Payment Transactions.
- Subscription Invoices.
- User Management.
- Support Tickets.
- Platform Settings.
- Platform Notifications.
- Audit Logs.

Super Admin must have a separate authorization boundary.

All administrative actions must be audited.

==================================================
8. SHOP OWNER DASHBOARD
==================================================

Preserve the existing POS dashboard and business features.

Add:
- Subscription Overview.
- Current Plan.
- Usage Statistics.
- User Usage.
- Product Usage.
- Branch Usage.
- Billing History.
- Upcoming Renewal.
- Upgrade Plan.
- Payment History.
- Subscription Invoices.

Do not mix platform revenue with individual shop revenue.

==================================================
9. MULTI-BRANCH MANAGEMENT
==================================================

Add multi-branch functionality.

Features:
- Branch List.
- Add Branch.
- Edit Branch.
- Branch Details.
- Branch Employees.
- Branch Inventory.
- Branch Sales.
- Branch Purchases.
- Stock Transfer.
- Branch Reports.

All branches must belong to their parent tenant.

Validate both tenant_id and branch_id during every branch-level operation.

A branch must never access another tenant's inventory.

==================================================
10. SAAS NOTIFICATION SYSTEM
==================================================

Implement:
- In-App Notifications.
- Email Notifications.
- Subscription Expiry Reminder.
- Payment Success.
- Payment Failure.
- Trial Expiry.
- Renewal Reminder.
- Account Suspension Notice.
- Plan Upgrade Confirmation.

Use Laravel queues where appropriate.

==================================================
11. SUPPORT TICKET SYSTEM
==================================================

Create:
- Create Support Ticket.
- Ticket Categories.
- Ticket Priority.
- Ticket Status.
- Ticket Replies.
- Admin Responses.
- Attachment Support.
- Ticket History.

Each tenant must only access its own tickets.

==================================================
12. SAAS SECURITY
==================================================

Perform a complete security upgrade.

Mandatory:
- Secure authentication.
- Role-based access.
- Permission-based access.
- Tenant isolation.
- API authorization.
- CSRF protection where applicable.
- XSS prevention.
- SQL injection prevention.
- IDOR prevention.
- Rate limiting.
- Password hashing.
- Session security.
- Secure file uploads.
- Payment verification.
- Webhook signature verification.
- Audit logging.
- Database backup.
- Secure environment variables.

Never trust:
- Frontend tenant_id.
- Frontend role values.
- Frontend subscription status.
- Frontend payment success.
- User-supplied prices.
- User-supplied discounts.

All sensitive operations must be validated by Laravel.

Write automated tests proving that Tenant A cannot access Tenant B's data.

==================================================
13. DATABASE UPGRADE
==================================================

Inspect the current database before modifying it.

Create migrations for:

- tenants
- tenant_users
- tenant_settings
- subscription_plans
- plan_features
- subscriptions
- subscription_payments
- subscription_invoices
- payment_transactions
- branches
- tenant_domains
- usage_records
- usage_limits
- notifications
- support_tickets
- support_replies
- platform_settings
- platform_audit_logs

Add tenant_id to every appropriate existing tenant-owned business table.

Maintain proper foreign keys and indexes.

IMPORTANT:
- Preserve existing records.
- Create a safe migration strategy.
- Back up the database before migration.
- Assign existing business records to the correct initial tenant.
- Never accidentally expose legacy records.
- Never run destructive migrations without explicit confirmation.

==================================================
14. SAAS UI/UX
==================================================

Preserve the existing premium Israfil BD Shop design.

Create three distinct design experiences:

1. Public SaaS Marketing Website.
2. Super Admin Dashboard.
3. Shop Owner and Employee Dashboard.

Maintain:
- Modern sidebar.
- Professional top navigation.
- Elegant cards.
- Beautiful tables.
- Responsive charts.
- Dark mode.
- Light mode.
- Bangla and English.
- Mobile responsive pages.
- Toast notifications.
- Dedicated CRUD pages.
- No modal dialogs.
- No browser alerts.

==================================================
15. GITHUB DEVELOPMENT WORKFLOW
==================================================

Inspect existing branches first.

Use:
- main
- develop
- feature/multi-tenancy
- feature/tenant-registration
- feature/subscriptions
- feature/billing
- feature/payment-gateway
- feature/super-admin
- feature/multi-branch
- feature/notifications
- feature/support

Never overwrite existing working branches.

Create meaningful commits.

Update:
- README.md.
- Architecture Documentation.
- Database Documentation.
- API Documentation.
- Security Documentation.
- Installation Guide.
- SaaS Deployment Guide.

==================================================
16. TESTING
==================================================

Test:

- Tenant Registration.
- Tenant Isolation.
- Tenant User Management.
- Role Permissions.
- Subscription Creation.
- Trial Expiration.
- Subscription Renewal.
- Subscription Upgrade.
- Subscription Downgrade.
- Plan Limits.
- Payment Verification.
- Duplicate Webhooks.
- Payment Failure.
- Invoice Generation.
- Branch Isolation.
- Support Ticket Isolation.
- Super Admin Authorization.
- Data Export and Backup.

Use Laravel automated tests and frontend integration tests.

==================================================
17. IMPLEMENTATION PLAN
==================================================

Do not attempt to modify everything in one operation.

First perform a complete project audit.

Then provide:

1. Existing Project Architecture Report.
2. Existing Database Analysis.
3. Existing Feature Completion Report.
4. Security Risk Report.
5. SaaS Migration Plan.
6. Required Database Changes.
7. Required API Changes.
8. Required Frontend Changes.

After approval, implement in this order:

PHASE 1: Existing Project Audit and Backup.

PHASE 2: Multi-Tenant Database Architecture.

PHASE 3: Tenant Resolution and Isolation Security.

PHASE 4: Tenant Registration and Onboarding.

PHASE 5: Super Admin Dashboard.

PHASE 6: Subscription Plans and Billing.

PHASE 7: Payment Gateway Integration.

PHASE 8: Plan Limits and Usage Management.

PHASE 9: Multi-Branch System.

PHASE 10: Notifications and Support Tickets.

PHASE 11: SaaS Landing Website and Pricing.

PHASE 12: Security Audit and Testing.

PHASE 13: Production Deployment Preparation.

For every phase:
- Provide exact file paths.
- Implement complete code.
- Explain migrations.
- Explain API changes.
- Test frontend and backend.
- Preserve existing features.
- Fix errors before proceeding.

Do not claim features are completed without verification.

FINAL OBJECTIVE:

Transform the existing ISRAFIL BD SHOP into a secure, scalable, professional, multi-tenant SaaS POS platform that can serve hundreds or thousands of independent businesses.

This must be a real commercial SaaS product, not a demo.