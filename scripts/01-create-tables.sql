-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create communities table
CREATE TABLE IF NOT EXISTS public.communities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(10) DEFAULT '🏔️',
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
