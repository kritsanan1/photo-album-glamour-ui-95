
# Photo Album Glamour 📸✨

A modern, responsive photo album management application built with React, TypeScript, and Supabase. Features drag-and-drop upload, Google OAuth authentication, and beautiful GSAP animations with Thai language support.

## 🌟 Features

- **🔐 Google OAuth Authentication** - Secure login with Google accounts
- **📁 Album Management** - Create, organize, and delete photo albums
- **🖼️ Photo Upload** - Drag & drop or click to upload multiple images
- **🎨 Beautiful Animations** - Smooth GSAP-powered interactions
- **📱 Responsive Design** - Works perfectly on all devices
- **🌏 Thai Language Support** - Fully localized interface
- **☁️ Cloud Storage** - Powered by Supabase storage
- **🔒 Secure Access** - Row-level security for user data

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **Animations**: GSAP
- **State Management**: React Query (@tanstack/react-query)
- **Icons**: Lucide React
- **Build Tool**: Vite

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18.0 or higher)
- **npm** or **yarn** package manager
- **Git** for version control
- A **Supabase account** (free tier available)
- A **Google Cloud Platform account** (for OAuth)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <YOUR_GIT_URL>
cd photo-album-glamour
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Create a `.env` file in the root directory with your Supabase credentials:

```env
VITE_PUBLIC_SUPABASE_URL=your_supabase_project_url
VITE_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Supabase Setup

#### Database Schema
The required database tables are automatically created via the migration file:
- `photo_albums` - Stores album information
- `album_photos` - Stores photo metadata
- `profiles` - User profile data

#### Storage Bucket
A `photo-albums` storage bucket is created for image storage with public access.

#### Row Level Security (RLS)
All tables have RLS policies ensuring users can only access their own data.

### 5. Google OAuth Configuration

1. **Create Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Configure OAuth Consent Screen**:
   - Go to APIs & Services → OAuth consent screen
   - Add your domain: `<PROJECT_ID>.supabase.co`
   - Configure required scopes:
     - `...auth/userinfo.email`
     - `...auth/userinfo.profile`
     - `openid`

3. **Create OAuth Credentials**:
   - Go to APIs & Services → Credentials
   - Create OAuth 2.0 Client ID
   - Application type: Web application
   - Authorized origins: Your site URL
   - Authorized redirect URLs: Your Supabase callback URL

4. **Configure in Supabase**:
   - Go to Authentication → Providers in Supabase dashboard
   - Enable Google provider
   - Add your Client ID and Client Secret

5. **Set URLs in Supabase**:
   - Authentication → URL Configuration
   - Site URL: Your application URL
   - Redirect URLs: Include your preview and production URLs

## 🏃‍♂️ Local Development

1. **Start the development server**:
```bash
npm run dev
# or
yarn dev
```

2. **Access the application**:
   - Open `http://localhost:8080` in your browser
   - The port is configured to 8080 in `vite.config.ts`

3. **Development features**:
   - Hot module replacement (HMR)
   - TypeScript type checking
   - ESLint linting
   - Tailwind CSS IntelliSense

## 🧪 Testing

### Manual Testing Checklist

1. **Authentication Flow**:
   - [ ] Google OAuth login works
   - [ ] User session persists on refresh
   - [ ] Logout functionality works
   - [ ] Unauthenticated users see login prompt

2. **Album Management**:
   - [ ] Create new albums
   - [ ] Select different albums
   - [ ] Delete albums (with confirmation)
   - [ ] Albums load on page refresh

3. **Photo Upload**:
   - [ ] Drag and drop files
   - [ ] Click to select files
   - [ ] Multiple file upload
   - [ ] Upload progress indicators
   - [ ] Error handling for invalid files

4. **Photo Management**:
   - [ ] Photos display in grid
   - [ ] Photo deletion works
   - [ ] Hover animations function
   - [ ] Images load properly

5. **Responsive Design**:
   - [ ] Mobile layout works
   - [ ] Tablet layout works
   - [ ] Desktop layout works

### Running Tests

Currently, the project doesn't include automated tests. To add testing:

```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest

# Add test scripts to package.json
"scripts": {
  "test": "vitest",
  "test:ui": "vitest --ui"
}
```

## 🚢 Deployment

### Option 1: Lovable Deployment (Recommended)

1. Open your [Lovable project](https://lovable.dev/projects/927c16d2-f758-459a-8304-90ade9184e20)
2. Click "Share" → "Publish"
3. Your app will be deployed automatically

### Option 2: Manual Deployment

#### Build for Production
```bash
npm run build
# or
yarn build
```

#### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### Deploy to Netlify
```bash
# Build first
npm run build

# Deploy dist folder to Netlify
```

### Environment Variables for Production

Ensure your production environment has:
- `VITE_PUBLIC_SUPABASE_URL`
- `VITE_PUBLIC_SUPABASE_ANON_KEY`

## 🔧 Configuration

### Tailwind CSS
Customizations in `tailwind.config.ts`:
- Extended color palette
- Custom animations
- Responsive breakpoints

### TypeScript
Configuration in `tsconfig.json`:
- Strict type checking enabled
- Path aliases configured (`@/` → `src/`)
- React JSX support

### Vite
Configuration in `vite.config.ts`:
- React SWC plugin for fast builds
- Path resolution
- Development server on port 8080

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Shadcn/ui components
│   ├── AuthButton.tsx  # Authentication component
│   └── PhotoAlbumUploader.tsx # Main app component
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
│   └── supabase/      # Supabase client and types
├── lib/               # Utility functions
├── pages/             # Route components
└── main.tsx          # Application entry point
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Coding Standards

- Use TypeScript for all new files
- Follow existing code style and formatting
- Add proper error handling
- Include descriptive commit messages
- Test your changes thoroughly

### Component Guidelines

- Create focused, single-responsibility components
- Use TypeScript interfaces for props
- Implement proper error boundaries
- Follow React best practices
- Use Tailwind CSS for styling

## 🐛 Troubleshooting

### Common Issues

1. **"localhost refused to connect"**
   - Ensure dev server is running on port 8080
   - Check if another process is using the port

2. **Google OAuth not working**
   - Verify OAuth credentials in Supabase
   - Check Site URL and Redirect URLs configuration
   - Ensure domains match exactly

3. **Images not uploading**
   - Check Supabase storage bucket permissions
   - Verify storage policies are configured
   - Check file size limits

4. **Database connection errors**
   - Verify Supabase URL and keys
   - Check RLS policies
   - Ensure tables exist via migrations

### Getting Help

- Check the [Lovable Documentation](https://docs.lovable.dev/)
- Visit the [Supabase Documentation](https://supabase.com/docs)
- Join the [Lovable Discord Community](https://discord.com/channels/1119885301872070706/1280461670979993613)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev/)
- Powered by [Supabase](https://supabase.com/)
- UI components from [Shadcn/ui](https://ui.shadcn.com/)
- Animations by [GSAP](https://greensock.com/gsap/)
- Icons from [Lucide](https://lucide.dev/)

---

**Made with ❤️ using React + GSAP + TailwindCSS**

✨ Glamorous Photo Album Experience ✨
