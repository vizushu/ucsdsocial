-- Communities policies
CREATE POLICY "Communities are viewable by everyone" ON public.communities
    FOR SELECT USING (true);

CREATE POLICY "Users can create communities" ON public.communities
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own communities" ON public.communities
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own communities" ON public.communities
    FOR DELETE USING (auth.uid() = created_by);

-- Channels policies
CREATE POLICY "Channels are viewable by community members" ON public.channels
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.community_members 
            WHERE community_id = channels.community_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Community creators can manage channels" ON public.channels
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.communities 
            WHERE id = channels.community_id 
            AND created_by = auth.uid()
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

-- Itinerary activities policies
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

-- Checklist items policies
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

-- Food items policies
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
