-- Seed script to add UK food items to the database
-- Run this to add Fish and Chips and Shepherd's Pie

-- Insert UK Food Item 1: Fish and Chips
INSERT OR IGNORE INTO menu_items (
  id,
  name,
  description,
  price,
  basePrice,
  image,
  category,
  isAvailable,
  inStock,
  seasonalMenuId,
  createdAt,
  updatedAt
) VALUES (
  'uk-001',
  'Fish and Chips',
  'Classic British dish with battered cod and crispy chips',
  14.99,
  14.99,
  'https://images.unsplash.com/photo-1579208030886-b937da0925dc?w=400',
  'Main Course',
  1,
  1,
  NULL,
  datetime('now'),
  datetime('now')
);

-- Insert UK Food Item 2: Shepherd's Pie
INSERT OR IGNORE INTO menu_items (
  id,
  name,
  description,
  price,
  basePrice,
  image,
  category,
  isAvailable,
  inStock,
  seasonalMenuId,
  createdAt,
  updatedAt
) VALUES (
  'uk-002',
  'Shepherd''s Pie',
  'Traditional pie with minced lamb and mashed potato topping',
  13.99,
  13.99,
  'https://images.unsplash.com/photo-1584672049763-73d41d9584a9?w=400',
  'Main Course',
  1,
  1,
  NULL,
  datetime('now'),
  datetime('now')
);
