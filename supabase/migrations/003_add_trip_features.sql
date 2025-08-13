-- Add category column to checklist_items
ALTER TABLE public.checklist_items 
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'other';

-- Add more columns to itinerary_activities for better organization
ALTER TABLE public.itinerary_activities 
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS estimated_duration INTEGER; -- in minutes

-- Create a trips table for organizing multiple trips
CREATE TABLE IF NOT EXISTS public.trips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    destination VARCHAR(255),
    start_date DATE,
    end_date DATE,
    community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'planning' CHECK (status IN ('planning', 'confirmed', 'active', 'completed', 'cancelled'))
);

-- Create trip_participants table
CREATE TABLE IF NOT EXISTS public.trip_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'interested' CHECK (status IN ('interested', 'confirmed', 'declined')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(trip_id, user_id)
);

-- Enable RLS on new tables
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_participants ENABLE ROW LEVEL SECURITY;

-- Policies for trips
CREATE POLICY "Trips are viewable by community members" ON public.trips
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.community_members 
            WHERE community_id = trips.community_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Community members can create trips" ON public.trips
    FOR INSERT WITH CHECK (
        auth.uid() = created_by AND
        EXISTS (
            SELECT 1 FROM public.community_members 
            WHERE community_id = trips.community_id 
            AND user_id = auth.uid()
        )
    );

-- Policies for trip participants
CREATE POLICY "Trip participants are viewable by community members" ON public.trip_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.trips t
            JOIN public.community_members cm ON t.community_id = cm.community_id
            WHERE t.id = trip_participants.trip_id 
            AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can join trips" ON public.trip_participants
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.trips t
            JOIN public.community_members cm ON t.community_id = cm.community_id
            WHERE t.id = trip_participants.trip_id 
            AND cm.user_id = auth.uid()
        )
    );

-- Insert sample trip data
INSERT INTO public.trips (id, name, description, destination, start_date, end_date, community_id, created_by, status) VALUES
    ('770e8400-e29b-41d4-a716-446655440001', 'Yosemite Climbing Adventure', 'Epic 4-day climbing trip to Yosemite National Park with camping at Camp 4', 'Yosemite National Park, CA', '2024-06-19', '2024-06-23', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'planning')
ON CONFLICT (id) DO NOTHING;

-- Update existing itinerary activities to link to the trip
UPDATE public.itinerary_activities 
SET location = CASE 
    WHEN day_index = 0 THEN 'Camp 4, Yosemite Valley'
    WHEN day_index = 1 THEN 'Yosemite Falls Trail'
    WHEN day_index = 2 THEN 'Half Dome'
    ELSE 'Yosemite Valley'
END
WHERE channel_id = '660e8400-e29b-41d4-a716-446655440002';
