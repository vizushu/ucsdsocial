-- Insert sample communities
INSERT INTO public.communities (id, name, description, icon, member_count, created_by) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'UCSD Climbing', 'Rock climbing adventures and trips', '🧗', 234, '550e8400-e29b-41d4-a716-446655440000'),
    ('550e8400-e29b-41d4-a716-446655440002', 'CSE Students', 'Computer Science & Engineering community', '💻', 1205, '550e8400-e29b-41d4-a716-446655440000'),
    ('550e8400-e29b-41d4-a716-446655440003', 'Triton Gaming', 'Gaming community for UCSD students', '🎮', 892, '550e8400-e29b-41d4-a716-446655440000'),
    ('550e8400-e29b-41d4-a716-446655440004', 'Pre-Med Tritons', 'Pre-medical students support group', '🏥', 567, '550e8400-e29b-41d4-a716-446655440000'),
    ('550e8400-e29b-41d4-a716-446655440005', 'UCSD Surf Club', 'Surfing and beach activities', '🏄', 445, '550e8400-e29b-41d4-a716-446655440000'),
    ('550e8400-e29b-41d4-a716-446655440006', 'UCSD Photography', 'Photography enthusiasts and workshops', '📸', 321, '550e8400-e29b-41d4-a716-446655440000')
ON CONFLICT (id) DO NOTHING;

-- Insert channels for UCSD Climbing community
INSERT INTO public.channels (id, name, type, community_id, href) VALUES
    ('660e8400-e29b-41d4-a716-446655440001', 'chat', 'text', '550e8400-e29b-41d4-a716-446655440001', NULL),
    ('660e8400-e29b-41d4-a716-446655440002', 'itinerary', 'text', '550e8400-e29b-41d4-a716-446655440001', NULL),
    ('660e8400-e29b-41d4-a716-446655440003', 'gear-checklist', 'text', '550e8400-e29b-41d4-a716-446655440001', NULL),
    ('660e8400-e29b-41d4-a716-446655440004', 'food-dietary', 'text', '550e8400-e29b-41d4-a716-446655440001', NULL),
    ('660e8400-e29b-41d4-a716-446655440005', 'spotify-jam', 'link', '550e8400-e29b-41d4-a716-446655440001', 'https://open.spotify.com/jam/placeholder-jam-id')
ON CONFLICT (id) DO NOTHING;

-- Insert sample messages
INSERT INTO public.messages (content, user_id, channel_id, user_name, user_avatar) VALUES
    ('Welcome to UCSD Climbing! 🧗‍♂️ Ready for some epic adventures?', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', 'Renier', 'R'),
    ('Count me in! Been wanting to try some Yosemite granite 🏔️', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', 'Alex', 'A'),
    ('What gear should I bring for the trip?', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', 'Sarah', 'S')
ON CONFLICT DO NOTHING;

-- Insert sample checklist items
INSERT INTO public.checklist_items (text, checked, channel_id, created_by) VALUES
    ('Crash pads', false, '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000'),
    ('Chalk & chalk bag', true, '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000'),
    ('Climbing shoes', false, '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000'),
    ('First aid kit', false, '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000'),
    ('Water bottles', true, '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000')
ON CONFLICT DO NOTHING;

-- Insert sample food items
INSERT INTO public.food_items (text, checked, channel_id, created_by) VALUES
    ('S''mores supplies', false, '660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000'),
    ('Trail mix', false, '660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000'),
    ('Water (lots!)', true, '660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000'),
    ('Energy bars', false, '660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000')
ON CONFLICT DO NOTHING;
