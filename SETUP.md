# DakarMarket Setup Guide

## Quick Start

1. **Configure Supabase Credentials**
   
   This application requires Supabase for authentication and database functionality. Follow these steps:

   a. Create a Supabase project at [https://supabase.com](https://supabase.com)
   
   b. Get your credentials from Project Settings > API:
      - Project URL
      - Anon/Public Key
   
   c. Add them to Replit Secrets:
      - Go to Tools > Secrets in the Replit sidebar
      - Add `NEXT_PUBLIC_SUPABASE_URL` with your Project URL
      - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` with your Anon Key
   
   d. Restart the development server

2. **Set Up Database Tables**
   
   The database migrations are located in `supabase/migrations/`. You can run them in your Supabase project:
   
   a. Go to your Supabase Dashboard > SQL Editor
   
   b. Run the migration files in order:
      - `20250927175831_broad_marsh.sql` (Creates tables and RLS policies)
      - `20250929083000_gentle_star.sql` (Adds images column)
      - `20251001000000_add_profile_trigger.sql` (Adds automatic profile creation trigger - IMPORTANT for email confirmation flow)

3. **Test the Application**
   
   - Register a new account
   - Choose merchant or client role
   - If merchant: Add products
   - If client: Browse and add to cart

## Features

- User authentication (Register/Login)
- Role-based access (Merchant/Client)
- Product catalog with search and filters
- Shopping cart
- Favorites
- Real-time messaging between users
- Order management
- Dark mode support

## Deployment

The app is configured for Replit Autoscale deployment:
- Build command: `npm run build`
- Start command: `npm run start`
- Port: 5000

Click the "Publish" button in Replit to deploy to production.

## Troubleshooting

**Issue: "Supabase credentials required" error**
- Make sure you've added the environment variables to Replit Secrets
- Restart the development server after adding secrets

**Issue: Database errors**
- Verify your Supabase project is active
- Ensure database migrations have been run
- Check that Row Level Security (RLS) policies are enabled

**Issue: Authentication not working**
- Verify your Supabase URL and keys are correct
- Check that the auth schema is properly set up in Supabase
