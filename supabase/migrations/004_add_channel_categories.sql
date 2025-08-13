-- Create channel categories table
CREATE TABLE IF NOT EXISTS channel_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL
);

-- Update channels table to support categories and better organization
ALTER TABLE channels ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES channel_categories(id) ON DELETE SET NULL;
ALTER TABLE channels ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;
ALTER TABLE channels ADD COLUMN IF NOT EXISTS topic TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_channel_categories_community ON channel_categories(community_id);
CREATE INDEX IF NOT EXISTS idx_channels_category ON channels(category_id);
CREATE INDEX IF NOT EXISTS idx_channels_position ON channels(position);

-- Enable RLS
ALTER TABLE channel_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for channel_categories
CREATE POLICY "Users can view channel categories in their communities" ON channel_categories
  FOR SELECT USING (
    community_id IN (
      SELECT community_id FROM community_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create channel categories in their communities" ON channel_categories
  FOR INSERT WITH CHECK (
    community_id IN (
      SELECT community_id FROM community_members WHERE user_id = auth.uid()
    )
  );

-- Insert default categories for existing communities
INSERT INTO channel_categories (name, community_id, position, created_by)
SELECT 
  'General' as name,
  id as community_id,
  0 as position,
  created_by
FROM communities
WHERE NOT EXISTS (
  SELECT 1 FROM channel_categories WHERE community_id = communities.id
);

-- Update existing channels to be in the General category
UPDATE channels 
SET category_id = (
  SELECT cc.id 
  FROM channel_categories cc 
  WHERE cc.community_id = channels.community_id 
  AND cc.name = 'General'
  LIMIT 1
)
WHERE category_id IS NULL;

-- Add some additional categories for trip planning
INSERT INTO channel_categories (name, community_id, position, created_by)
SELECT 
  'Trip Planning' as name,
  c.id as community_id,
  1 as position,
  c.created_by
FROM communities c
WHERE c.name LIKE '%Trip%' OR c.name LIKE '%Yosemite%'
ON CONFLICT DO NOTHING;

INSERT INTO channel_categories (name, community_id, position, created_by)
SELECT 
  'Activities' as name,
  c.id as community_id,
  2 as position,
  c.created_by
FROM communities c
WHERE c.name LIKE '%Trip%' OR c.name LIKE '%Yosemite%'
ON CONFLICT DO NOTHING;
