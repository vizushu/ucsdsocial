# UCSD Social App

A modern social platform for UCSD students to connect, join communities, and plan activities together.

## Features

- 🔐 **Secure Authentication** - Sign in with UCSD email or Google
- 🏘️ **Communities** - Join and create communities for different interests
- 💬 **Real-time Chat** - Live messaging in community channels
- ⭐ **Favorites** - Star your favorite communities
- 📱 **Responsive Design** - Works perfectly on mobile and desktop

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Styling**: Tailwind CSS, shadcn/ui
- **Icons**: Lucide React

## Quick Start

1. **Clone and install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

2. **Set up Supabase**:
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Copy `.env.local.example` to `.env.local`
   - Add your Supabase URL and anon key

3. **Set up the database**:
   - Run the SQL migrations in `supabase/migrations/` in your Supabase SQL editor
   - First run `001_initial_schema.sql` to create tables and policies
   - Then run `002_seed_data.sql` to add sample communities and data

4. **Start the development server**:
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open the app**:
   - Visit [http://localhost:3000](http://localhost:3000)
   - Sign up with any `@ucsd.edu` email address
   - Start exploring communities!

## Database Schema

The app uses the following main tables:
- `communities` - Community information and metadata
- `channels` - Text/voice channels within communities  
- `community_members` - User memberships and starred communities
- `messages` - Real-time chat messages
- `itinerary_activities` - Trip planning activities
- `checklist_items` - Shared checklists for trips
- `food_items` - Food planning for group activities

## Environment Variables

Create a `.env.local` file with:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
\`\`\`

## Deployment

This app is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy!

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project as a starting point for your own UCSD community app!
