-- Insert sample communities
INSERT INTO public.communities (id, name, description, icon, created_by) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'UCSD Climbing', 'Rock climbing adventures and trips', '🧗', '550e8400-e29b-41d4-a716-446655440000'),
    ('550e8400-e29b-41d4-a716-446655440002', 'CSE Students', 'Computer Science & Engineering community', '💻', '550e8400-e29b-41d4-a716-446655440000'),
    ('550e8400-e29b-41d4-a716-446655440003', 'Triton Gaming', 'Gaming community for UCSD students', '🎮', '550e8400-e29b-41d4-a716-446655440000'),
    ('550e8400-e29b-41d4-a716-446655440004', 'Pre-Med Tritons', 'Pre-medical students support group', '🏥', '550e8400-e29b-41d4-a716-446655440000'),
    ('550e8400-e29b-41d4-a716-446655440005', 'UCSD Surf Club', 'Surfing and beach activities', '🏄', '550e8400-e29b-41d4-a716-446655440000'),
    ('550e8400-e29b-41d4-a716-446655440006', 'UCSD Photography', 'Photography enthusiasts and workshops', '📸', '550e8400-e29b-41d4-a716-446655440000')
ON CONFLICT (id) DO NOTHING;

-- Insert channels for UCSD Climbing community
INSERT INTO public.channels (id, name, type, community_id, href) VALUES
    ('660e8400-e29b-41d4-a716-446655440001', 'chat', 'text', '550e8400-e29b-41d4-a716-446655440001', NULL),
    ('660e8400-e29b-41d4-a716-446655440002', 'itinerary', 'text', '550e8400-e29b-41d4-a716-446655440001', NULL),
    ('660e8400-e29b-41d4-a716-446655440003', 'gear-checklist', 'text', '550e8400-e29b-41d4-a716-446655440001', NULL),
    ('660e8400-e29b-41d4-a716-446655440004', 'food-dietary', 'text', '550e8400-e29b-41d4-a716-446655440001', NULL),
    ('660e8400-e29b-41d4-a716-446655440005', 'spotify-jam', 'link', '550e8400-e29b-41d4-a716-446655440001', 'https://open.spotify.com/jam/placeholder-jam-id')
ON CONFLICT (id) DO NOTHING;

-- Insert channels for other communities
INSERT INTO public.channels (name, type, community_id) VALUES
    ('general', 'text', '550e8400-e29b-41d4-a716-446655440002'),
    ('homework-help', 'text', '550e8400-e29b-41d4-a716-446655440002'),
    ('job-postings', 'text', '550e8400-e29b-41d4-a716-446655440002'),
    
    ('general', 'text', '550e8400-e29b-41d4-a716-446655440003'),
    ('lfg', 'text', '550e8400-e29b-41d4-a716-446655440003'),
    ('tournaments', 'text', '550e8400-e29b-41d4-a716-446655440003'),
    
    ('general', 'text', '550e8400-e29b-41d4-a716-446655440004'),
    ('study-groups', 'text', '550e8400-e29b-41d4-a716-446655440004'),
    ('mcat-prep', 'text', '550e8400-e29b-41d4-a716-446655440004'),
    
    ('general', 'text', '550e8400-e29b-41d4-a716-446655440005'),
    ('surf-reports', 'text', '550e8400-e29b-41d4-a716-446655440005'),
    ('events', 'text', '550e8400-e29b-41d4-a716-446655440005'),
    
    ('general', 'text', '550e8400-e29b-41d4-a716-446655440006'),
    ('photo-sharing', 'text', '550e8400-e29b-41d4-a716-446655440006'),
    ('workshops', 'text', '550e8400-e29b-41d4-a716-446655440006')
ON CONFLICT DO NOTHING;

-- Insert sample checklist items for gear-checklist channel
INSERT INTO public.checklist_items (text, checked, channel_id, created_by) VALUES
    ('Crash pads (Umair?)', false, '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000'),
    ('Chalk & chalk bag', true, '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000'),
    ('Climbing shoes', false, '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000'),
    ('Tape + brushes', false, '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000'),
    ('First aid kit', false, '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000'),
    ('Harnesses', false, '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000'),
    ('Water bottle / hydration pack', true, '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000'),
    ('Sunscreen, hat', false, '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000'),
    ('Warm layers', false, '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000'),
    ('Hiking poles (recommended for Half Dome)', false, '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000'),
    ('Snacks / protein bars', false, '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000')
ON CONFLICT DO NOTHING;

-- Insert sample food items for food-dietary channel
INSERT INTO public.food_items (text, checked, channel_id, created_by) VALUES
    ('S''mores supplies (graham crackers, marshmallows, chocolate)', false, '660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000'),
    ('BBQ items (burgers, hot dogs, buns, condiments)', false, '660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000'),
    ('Soup (canned or instant)', false, '660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000'),
    ('Rice / Pasta / Quinoa', false, '660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000'),
    ('Drinks (juice, soda, coffee, tea)', false, '660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000'),
    ('Water (lots of it!)', true, '660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000'),
    ('Fruits (apples, bananas, oranges)', false, '660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000'),
    ('PB&J supplies (bread, peanut butter, jelly)', false, '660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000'),
    ('Snacks (trail mix, granola bars, chips)', false, '660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000')
ON CONFLICT DO NOTHING;

-- Insert sample itinerary activities
INSERT INTO public.itinerary_activities (text, time, day_index, channel_id, icon_type, icon_color, border_color, created_by) VALUES
    ('Arrive early, set up camp at Upper Pines', '2:00 PM', 0, '660e8400-e29b-41d4-a716-446655440002', 'tent', 'bg-green-100 dark:bg-green-800', 'border-green-500 dark:border-green-400', '550e8400-e29b-41d4-a716-446655440000'),
    ('Warm-up bouldering session at Camp 4 boulders', '4:00 PM', 0, '660e8400-e29b-41d4-a716-446655440002', 'mountain', 'bg-sky-100 dark:bg-sky-800', 'border-sky-500 dark:border-sky-400', '550e8400-e29b-41d4-a716-446655440000'),
    ('Cruise around Yosemite Village, explore Ansel Adams Gallery & gift shop', '5:30 PM', 0, '660e8400-e29b-41d4-a716-446655440002', 'map', 'bg-yellow-100 dark:bg-yellow-800', 'border-yellow-500 dark:border-yellow-400', '550e8400-e29b-41d4-a716-446655440000'),
    ('Chill cookout at camp, group hang, s''mores', '7:30 PM', 0, '660e8400-e29b-41d4-a716-446655440002', 'flame', 'bg-orange-100 dark:bg-orange-800', 'border-orange-500 dark:border-orange-400', '550e8400-e29b-41d4-a716-446655440000'),
    
    ('Bouldering Sesh Continued', '9:00 AM', 1, '660e8400-e29b-41d4-a716-446655440002', 'mountain', 'bg-sky-100 dark:bg-sky-800', 'border-sky-500 dark:border-sky-400', '550e8400-e29b-41d4-a716-446655440000'),
    ('Explore valley floor / Sentinel Meadow / Mirror Lake', '1:00 PM', 1, '660e8400-e29b-41d4-a716-446655440002', 'camera', 'bg-purple-100 dark:bg-purple-800', 'border-purple-500 dark:border-purple-400', '550e8400-e29b-41d4-a716-446655440000'),
    ('Night campfire, hangout', '8:00 PM', 1, '660e8400-e29b-41d4-a716-446655440002', 'flame', 'bg-orange-100 dark:bg-orange-800', 'border-orange-500 dark:border-orange-400', '550e8400-e29b-41d4-a716-446655440000')
ON CONFLICT DO NOTHING;

-- Insert sample messages
INSERT INTO public.messages (content, user_id, channel_id, user_name, user_avatar) VALUES
    ('4 days off grid with UCSD climbers at Yosemite''s legendary Camp 4. Morning sends, afternoon waterfall swims, sunset hangs, soup and s''mores by the camper (ft. Levi the husky). If you know, you know. If you don''t—well, you''ll just be watching the IG stories wishing you came. 🏔️', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', 'Renier', 'R'),
    ('Count me in! Been wanting to try some Yosemite granite 🧗‍♂️', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', 'Alex', 'A'),
    ('Levi the husky?? 😍 I''m definitely coming now', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', 'Sarah', 'S'),
    ('What''s the climbing grade range we''re looking at? I''m still pretty new to outdoor climbing', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', 'Mike', 'M'),
    ('Perfect for beginners! Lots of 5.6-5.9 routes. Plus I''m bringing extra gear for anyone who needs it 👍', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', 'Renier', 'R'),
    ('Just submitted my RSVP! Can''t wait for this adventure 🎒✨', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', 'Jess', 'J')
ON CONFLICT DO NOTHING;
