-- Add 'delivery_confirmed' to booking_status enum
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'delivery_confirmed' AFTER 'completed';
