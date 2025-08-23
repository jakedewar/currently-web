# Currently Webapp

A modern, full-stack web application built with Next.js and Supabase, featuring authentication, dashboard functionality, and a beautiful user interface.

## Features

- **Authentication System**: Complete user authentication with sign-up, login, password reset, and session management
- **Protected Dashboard**: Multi-page dashboard with analytics, calendar, documents, notifications, and user management
- **Modern UI**: Built with [shadcn/ui](https://ui.shadcn.com/) components and [Tailwind CSS](https://tailwindcss.com)
- **Theme Support**: Dark/light mode toggle with persistent theme preferences
- **Responsive Design**: Mobile-first approach with responsive layouts
- **Organization Management**: Multi-tenant support with organization switching
- **Real-time Features**: Built on Supabase for real-time data synchronization
- **Type Safety**: Full TypeScript support throughout the application

## Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Language**: TypeScript
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jakedewar/currently-web.git
   cd currently-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   You can find these values in your [Supabase project settings](https://supabase.com/dashboard/project/_?showConnect=true).

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
currently-web/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── protected/         # Protected dashboard pages
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
│   └── supabase/         # Supabase client configuration
└── middleware.ts         # Next.js middleware for auth
```

## Key Features

### Authentication
- User registration and login
- Password reset functionality
- Session management with cookies
- Protected routes with middleware

### Dashboard
- **Analytics**: Data visualization and insights
- **Calendar**: Event management and scheduling
- **Documents**: File management and organization
- **Notifications**: Real-time notification system
- **Search**: Global search functionality
- **Settings**: User and application preferences
- **Users**: User management and profiles

### UI/UX
- Clean, modern design
- Responsive layout for all devices
- Smooth animations and transitions
- Accessible components
- Theme switching (dark/light mode)

## Deployment

### Deploy to Vercel

1. **Fork or clone this repository**
2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect Next.js settings

3. **Configure environment variables**
   - Add your Supabase URL and anon key in Vercel project settings
   - Deploy!

### Deploy to other platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the [Supabase documentation](https://supabase.com/docs)
- Review the [Next.js documentation](https://nextjs.org/docs)

## Acknowledgments

- Built with [Next.js](https://nextjs.org)
- Powered by [Supabase](https://supabase.com)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Styled with [Tailwind CSS](https://tailwindcss.com)
