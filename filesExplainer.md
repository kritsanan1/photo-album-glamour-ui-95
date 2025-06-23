
# Project File Structure Explanation

## Root Directory
```
photo-album-glamour/
├── 🟢 package.json - Project configuration and dependencies
├── 🟢 vite.config.ts - Vite bundler configuration with React and path aliases
├── 🟢 tailwind.config.ts - Tailwind CSS configuration for styling
├── 🟢 tsconfig.json - TypeScript compiler configuration
├── 🟡 tsconfig.app.json - App-specific TypeScript configuration
├── 🟡 tsconfig.node.json - Node.js TypeScript configuration
├── 🟡 postcss.config.js - PostCSS configuration for Tailwind
├── 🟡 components.json - Shadcn/ui components configuration
├── 🟡 eslint.config.js - ESLint linting configuration
├── 🔴 .gitignore - Git ignore patterns
├── 🔴 bun.lockb - Bun package manager lock file
├── 🔴 package-lock.json - NPM lock file
└── 🟢 README.md - Project documentation and setup guide
```

## Source Directory (`src/`)
```
src/
├── 🟢 main.tsx - Application entry point, renders React app
├── 🟢 App.tsx - Root component with routing and providers setup
├── 🟡 index.css - Global CSS styles and Tailwind imports
├── 🔴 vite-env.d.ts - Vite environment type definitions
└── 🔴 App.css - Additional global styles (unused)
```

## Pages Directory (`src/pages/`)
```
pages/
├── 🟢 Index.tsx - Main landing page with photo album uploader
└── 🟡 NotFound.tsx - 404 error page for unmatched routes
```

## Components Directory (`src/components/`)
```
components/
├── 🟢 PhotoAlbumUploader.tsx - Main photo album management component (602 lines)
│   ├── Dependencies: AuthButton, photoAlbumApi, GSAP animations
│   ├── Features: Album creation, photo upload, drag & drop, photo grid
│   └── Note: Large file that handles core functionality
├── 🟢 AuthButton.tsx - Google OAuth authentication component
│   ├── Dependencies: Supabase client
│   ├── Features: Login/logout, user state management
│   └── UI: Thai language interface
└── ui/ - Shadcn/ui component library (40+ components)
    ├── 🟢 button.tsx - Reusable button component
    ├── 🟢 toast.tsx - Toast notification system
    ├── 🟢 toaster.tsx - Toast container component
    ├── 🟡 dialog.tsx - Modal dialog component
    ├── 🟡 form.tsx - Form handling components
    ├── 🟡 input.tsx - Input field component
    └── ... (35+ other UI components)
```

## Library Directory (`src/lib/`)
```
lib/
├── 🟢 photoAlbumApi.ts - Core API functions for photo album operations
│   ├── Dependencies: Supabase client
│   ├── Functions: CRUD operations for albums and photos
│   └── Features: File upload, storage management, database operations
└── 🟢 utils.ts - Utility functions (className merging)
```

## Hooks Directory (`src/hooks/`)
```
hooks/
├── 🟢 use-toast.ts - Toast notification hook
└── 🟡 use-mobile.tsx - Mobile detection hook
```

## Integrations Directory (`src/integrations/`)
```
integrations/
└── supabase/
    ├── 🟢 client.ts - Supabase client configuration
    └── 🔴 types.ts - Auto-generated database types (read-only)
```

## Supabase Directory
```
supabase/
├── 🟢 config.toml - Supabase project configuration
└── migrations/
    └── 🟢 20250622153643-0ed971a0-631d-49e7-ab26-ad766f73221c.sql
        └── Database schema for photo albums and storage
```

## Public Directory
```
public/
├── 🟡 favicon.ico - Website favicon
├── 🔴 robots.txt - Search engine crawling rules
└── 🔴 placeholder.svg - Placeholder image
```

## Configuration Files
```
├── 🟢 .env - Environment variables (Supabase credentials)
├── 🟡 index.html - HTML template for Vite
```

## Importance Legend
- 🟢 **High Importance**: Core functionality, frequently imported/modified
- 🟡 **Medium Importance**: Supporting functionality, occasionally modified
- 🔴 **Low Importance**: Configuration, rarely modified, or auto-generated

## Key Dependencies & Relationships

### Core Flow
1. `main.tsx` → `App.tsx` → `Index.tsx` → `PhotoAlbumUploader.tsx`
2. Authentication: `AuthButton.tsx` ↔ `supabase/client.ts`
3. Data Operations: `PhotoAlbumUploader.tsx` → `photoAlbumApi.ts` → `supabase/client.ts`
4. UI Components: All components → `ui/` components
5. Styling: All components → `tailwind.config.ts` + `index.css`

### Critical Files for Functionality
1. **PhotoAlbumUploader.tsx** - Main application logic
2. **photoAlbumApi.ts** - Database operations
3. **AuthButton.tsx** - User authentication
4. **supabase/client.ts** - Backend connection
5. **Database migration** - Data structure
