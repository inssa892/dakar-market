/*
  # Add images column to products table

  1. Changes
    - Add `images` column to products table as text array
    - This allows storing multiple images per product
    - Existing `image_url` column remains for backward compatibility
*/

-- Add images column to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'images'
  ) THEN
    ALTER TABLE products ADD COLUMN images text[];
  END IF;
END $$;