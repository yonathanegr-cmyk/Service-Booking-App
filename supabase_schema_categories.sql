-- Categories Table Schema for Beedy
-- This table stores all service categories available in the platform

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  name_he VARCHAR(50) NOT NULL,
  icon VARCHAR(10) NOT NULL,
  color VARCHAR(7) DEFAULT '#3B82F6',
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories(sort_order);

-- Insert default categories
INSERT INTO categories (name, name_he, icon, color, sort_order) VALUES
  ('cleaning', 'ניקיון', '🧹', '#3B82F6', 1),
  ('plumbing', 'אינסטלציה', '🔧', '#6366F1', 2),
  ('electrical', 'חשמל', '💡', '#F59E0B', 3),
  ('beauty', 'יופי', '💅', '#EC4899', 4),
  ('renovation', 'שיפוצים', '🔨', '#8B5CF6', 5),
  ('gardening', 'גינון', '🌱', '#10B981', 6),
  ('ac', 'מיזוג', '❄️', '#06B6D4', 7),
  ('painting', 'צביעה', '🎨', '#F97316', 8),
  ('moving', 'הובלות', '📦', '#84CC16', 9)
ON CONFLICT (name) DO UPDATE SET
  name_he = EXCLUDED.name_he,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_categories_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_categories_updated ON categories;
CREATE TRIGGER trigger_categories_updated
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_categories_timestamp();

-- RLS Policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Categories are editable by admins only"
  ON categories FOR ALL
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );
