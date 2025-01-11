# Project Overview
Use this guide to build a web app that allows podcast editing clients to easily pay their invoices, with optional account features for returning clients.

# Feature Requirements

## Core Features
- Simple, shareable invoice payment links (`/invoice/[id]`)
- Stripe integration for secure payments
- Optional user accounts with Google OAuth
- Mobile-first, responsive design
- Invoice status tracking (paid/unpaid)

## User Experience
- No login required for paying invoices
- Authenticated users can view their invoice history
- Clean, professional interface
- Fast loading times
- Clear payment confirmation

## Technical Requirements
- The website will be hosted at pay.podcasts.geoffvrijmoet.com
- The website will be deployed on Vercel
- The website code will be hosted on GitHub, at my personal account (geoffvrijmoet), in a repository called "pay-podcasts-geoffvrijmoet-com"
- The web app should have lightning-fast performance
- The entire app should be extremely mobile-friendly
- We will use Next.js, Shadcn, Lucid, Clerk, MongoDB, and Tailwind CSS to build the app

## Data Structure
### Invoice
interface Invoice {
    id: string;
    clientEmail: string;
    amount: number;
    currency: string;
    status: 'pending' | 'paid' | 'cancelled';
    dueDate: Date;
    createdAt: Date;
    updatedAt: Date;
    description: string;
    userId?: string; // Optional, linked to Clerk user if they create account
}


## Routes
- `/` - Landing page
- `/invoice/[id]` - Public invoice payment page
- `/invoices` - Protected route for viewing all invoices (authenticated users only)
- `/sign-in` - Sign in page
- `/sign-up` - Sign up page

## API Routes
- `/api/invoices` - Invoice management
- `/api/webhooks/stripe` - Stripe webhook handler
- `/api/webhooks/clerk` - Clerk webhook handler

# Relevant Docs
- Clerk: https://clerk.com/docs/references/nextjs/
- Stripe: https://stripe.com/docs/payments
- Next.js: https://nextjs.org/docs
- MongoDB: https://www.mongodb.com/docs/

# Current File Structure
📦 PAY-PODCASTS-GEOFFVRIJMOET-COM
├── 📁 app
│   ├── 📁 api
│   │   ├── 📁 invoices
│   │   └── 📁 webhooks
│   │       ├── 📁 clerk
│   │       └── 📁 stripe
│   ├── 📁 invoice
│   │   └── 📁 [id]
│   │       └── 📄 page.tsx
│   ├── 📁 invoices
│   │   └── 📄 page.tsx
│   ├── 📁 sign-in
│   │   └── 📁 [[...sign-in]]
│   │       └── 📄 page.tsx
│   ├── 📁 sign-up
│   │   └── 📁 [[...sign-up]]
│   │       └── 📄 page.tsx
│   ├── 📄 favicon.ico
│   ├── 📄 globals.css
│   ├── 📄 layout.tsx
│   └── 📄 page.tsx
├── 📁 components
│   ├── 📁 ui
│   │   ├── 📄 button.tsx
│   │   ├── 📄 card.tsx
│   │   ├── 📄 dialog.tsx
│   │   ├── 📄 input.tsx
│   │   ├── 📄 label.tsx
│   │   ├── 📄 progress.tsx
│   │   ├── 📄 select.tsx
│   │   └── 📄 sheet.tsx
│   ├── 📄 header.tsx
│   ├── 📄 invoice-card.tsx
│   ├── 📄 main-nav.tsx
│   └── 📄 mobile-nav.tsx
├── 📁 lib
│   ├── 📁 models
│   │   └── 📄 invoice.ts
│   ├── 📁 types
│   │   └── 📄 index.ts
│   └── 📁 utils
│       ├── 📄 db.ts
│       └── 📄 stripe.ts
├── 📁 guidelines
│   └── 📄 feature-doc-guideline.md
├── 📄 .cursorrules
├── 📄 .env.local
├── 📄 .eslintrc.json
├── 📄 .gitignore
├── 📄 components.json
├── 📄 middleware.ts
├── 📄 next-env.d.ts
├── 📄 next.config.mjs
├── 📄 package-lock.json
├── 📄 package.json
├── 📄 postcss.config.mjs
├── 📄 README.md
├── 📄 tailwind.config.ts
└── 📄 tsconfig.json

# Rules
- All new components should go in /components and be named like example-component.tsx unless otherwise specified
- All new pages go in /app
- All API routes go in /app/api
- All database models go in /lib/models
- All utility functions go in /lib/utils
- All types go in /lib/types