-- Add channel categories table
CREATE TABLE IF NOT EXISTS channel_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Add category_id to channels table
ALTER TABLE channels ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES channel_categories(id) ON DELETE SET NULL;
ALTER TABLE channels ADD COLUMN IF NOT EXISTS topic TEXT;
ALTER TABLE channels ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_channel_categories_community_id ON channel_categories(community_id);
CREATE INDEX IF NOT EXISTS idx_channel_categories_position ON channel_categories(position);
CREATE INDEX IF NOT EXISTS idx_channels_category_id ON channels(category_id);
CREATE INDEX IF NOT EXISTS idx_channels_position ON channels(position);

-- Enable RLS
ALTER TABLE channel_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for channel_categories
CREATE POLICY "Users can view channel categories in communities they're members of" ON channel_categories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM community_members 
      WHERE community_members.community_id = channel_categories.community_id 
      AND community_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Community members can create channel categories" ON channel_categories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM community_members 
      WHERE community_members.community_id = channel_categories.community_id 
      AND community_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Community members can update channel categories" ON channel_categories
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM community_members 
      WHERE community_members.community_id = channel_categories.community_id 
      AND community_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Community members can delete channel categories" ON channel_categories
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM community_members 
      WHERE community_members.community_id = channel_categories.community_id 
      AND community_members.user_id = auth.uid()
    )
  );

-- Insert default categories for existing communities
INSERT INTO channel_categories (name, community_id, position, created_by)
SELECT 
  'General' as name,
  c.id as community_id,
  0 as position,
  c.created_by as created_by
FROM communities c
WHERE NOT EXISTS (
  SELECT 1 FROM channel_categories cc WHERE cc.community_id = c.id
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
