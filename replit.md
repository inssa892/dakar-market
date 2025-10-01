# DakarMarket - E-commerce Platform

## Overview
DakarMarket is a Next.js-based e-commerce platform for local merchants in Dakar. The application uses Supabase for authentication and database management, featuring real-time messaging, product listings, cart management, and order processing.

## Technology Stack
- **Frontend**: Next.js 13 (App Router), React 18, TypeScript
- **UI Components**: Radix UI, Tailwind CSS, Shadcn UI
- **Backend**: Supabase (PostgreSQL database, Authentication, Real-time subscriptions)
- **Forms**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with dark mode support

## Project Structure
- `/app` - Next.js App Router pages
- `/components` - React components (including Shadcn UI components)
- `/hooks` - Custom React hooks for auth, messages, orders
- `/lib` - Utility functions and Supabase client configuration
- `/types` - TypeScript type definitions
- `/supabase/migrations` - Database migration files

## Database Schema
The application uses the following main tables:
- `profiles` - User profiles with role management (client/merchant)
- `products` - Product catalog with merchant ownership
- `orders` - Order management system
- `messages` - Real-time messaging between users
- `cart_items` - Shopping cart items
- `favorites` - Client favorite products

## Configuration

### Required Environment Variables
The following Supabase credentials must be set in Replit Secrets:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

### Development Setup
- Development server runs on port 5000
- Host configured as 0.0.0.0 for Replit compatibility
- Next.js configured to allow all hosts for iframe proxy support

## Recent Changes (October 1, 2025)
- ✅ GitHub project successfully imported and configured for Replit
- ✅ Fixed dependency conflicts (date-fns downgraded to v3, zod to v3.22)
- ✅ Configured Next.js to run on port 5000 with host 0.0.0.0
- ✅ Updated Next.js config for Replit proxy compatibility with remote image patterns
- ✅ Installed all dependencies with legacy peer deps flag
- ✅ Created .env.example and .env.local with placeholder Supabase credentials
- ✅ Modified middleware to gracefully handle missing/placeholder credentials
- ✅ Set up development workflow running on port 5000
- ✅ Configured autoscale deployment (build: npm run build, start: npm run start)
- ✅ Created SETUP.md guide for Supabase configuration and deployment
- ✅ **CRITICAL FIX**: Added database trigger for automatic profile creation (20251001000000_add_profile_trigger.sql)
  - Solves profile creation failures during email confirmation flow
  - Removed manual profile insert from useAuth.signUp (now handled by trigger)
  - Trigger uses SECURITY DEFINER to bypass RLS (no additional policy needed)
  - Validates role to prevent privilege escalation (only 'client' or 'merchant' allowed)
- ✅ Fixed hydration warning on homepage search input (added suppressHydrationWarning)
- ✅ Removed unused import (CheckCircle) from login page

## Important Setup Notes
⚠️ **Supabase Configuration Required**: The app currently runs with placeholder credentials. To enable full functionality:
1. Add real Supabase credentials to Replit Secrets
2. Run database migrations from `supabase/migrations/` in your Supabase project
3. See SETUP.md for detailed instructions

## Deployment Status
- Development workflow: ✅ Running on port 5000
- Deployment config: ✅ Configured for autoscale deployment
- Ready to publish: ⚠️ Requires Supabase credentials for production

## User Preferences
None documented yet.
