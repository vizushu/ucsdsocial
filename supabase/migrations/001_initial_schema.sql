-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create communities table
CREATE TABLE IF NOT EXISTS public.communities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(10) DEFAULT '🏔️',
    member_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create channels table
CREATE TABLE IF NOT EXISTS public.channels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) DEFAULT 'text' CHECK (type IN ('text', 'voice', 'link')),
    community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
    href TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create community_members table
CREATE TABLE IF NOT EXISTS public.community_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
    is_starred BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, community_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE,
    user_name VARCHAR(255),
    user_avatar VARCHAR(10),
    reply_to UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create itinerary_activities table
CREATE TABLE IF NOT EXISTS public.itinerary_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    text TEXT NOT NULL,
    time VARCHAR(20) NOT NULL,
    day_index INTEGER NOT NULL DEFAULT 0,
    channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE,
    icon_type VARCHAR(50) DEFAULT 'clock',
    icon_color VARCHAR(100) DEFAULT 'bg-gray-100 dark:bg-gray-700',
    border_color VARCHAR(100) DEFAULT 'border-gray-500 dark:border-gray-400',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create checklist_items table
CREATE TABLE IF NOT EXISTS public.checklist_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    text TEXT NOT NULL,
    checked BOOLEAN DEFAULT FALSE,
    channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create food_items table
CREATE TABLE IF NOT EXISTS public.food_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    text TEXT NOT NULL,
    checked BOOLEAN DEFAULT FALSE,
    channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security on all tables
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;

-- Communities policies
CREATE POLICY "Communities are viewable by everyone" ON public.communities
    FOR SELECT USING (true);

CREATE POLICY "Users can create communities" ON public.communities
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own communities" ON public.communities
    FOR UPDATE USING (auth.uid() = created_by);

-- Channels policies
CREATE POLICY "Channels are viewable by community members" ON public.channels
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.community_members 
            WHERE community_id = channels.community_id 
            AND user_id = auth.uid()
        )
    );

-- Community members policies
CREATE POLICY "Users can view community memberships" ON public.community_members
    FOR SELECT USING (true);

CREATE POLICY "Users can join communities" ON public.community_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own memberships" ON public.community_members
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can leave communities" ON public.community_members
    FOR DELETE USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Messages are viewable by channel members" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.channels c
            JOIN public.community_members cm ON c.community_id = cm.community_id
            WHERE c.id = messages.channel_id 
            AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can send messages to channels they're members of" ON public.messages
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.channels c
            JOIN public.community_members cm ON c.community_id = cm.community_id
            WHERE c.id = messages.channel_id 
            AND cm.user_id = auth.uid()
        )
    );

-- Similar policies for other tables...
CREATE POLICY "Activities are viewable by channel members" ON public.itinerary_activities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.channels c
            JOIN public.community_members cm ON c.community_id = cm.community_id
            WHERE c.id = itinerary_activities.channel_id 
            AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage activities in their channels" ON public.itinerary_activities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.channels c
            JOIN public.community_members cm ON c.community_id = cm.community_id
            WHERE c.id = itinerary_activities.channel_id 
            AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Checklist items are viewable by channel members" ON public.checklist_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.channels c
            JOIN public.community_members cm ON c.community_id = cm.community_id
            WHERE c.id = checklist_items.channel_id 
            AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage checklist items in their channels" ON public.checklist_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.channels c
            JOIN public.community_members cm ON c.community_id = cm.community_id
            WHERE c.id = checklist_items.channel_id 
            AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Food items are viewable by channel members" ON public.food_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.channels c
            JOIN public.community_members cm ON c.community_id = cm.community_id
            WHERE c.id = food_items.channel_id 
            AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage food items in their channels" ON public.food_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.channels c
            JOIN public.community_members cm ON c.community_id = cm.community_id
            WHERE c.id = food_items.channel_id 
            AND cm.user_id = auth.uid()
        )
    );
