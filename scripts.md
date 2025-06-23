# Project Scripts Documentation

This document provides detailed information about all available npm/yarn scripts in the Photo Album Glamour project.

## 📋 Available Scripts

### `npm run dev` / `yarn dev`
**Purpose**: Starts the development server with hot module replacement (HMR)

**Functionality**:
- Launches Vite development server
- Enables hot module replacement for instant updates
- Provides TypeScript type checking
- Serves the application on `http://localhost:8080`

**Usage Examples**:
```bash
npm run dev
# or
yarn dev
```

**Expected Output**:
```
  VITE v5.0.0  ready in 1200 ms

  ➜  Local:   http://localhost:8080/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

**Common Use Cases**:
- Daily development workflow
- Testing new features locally
- Debugging and troubleshooting

**Required Environment Variables**:
- `VITE_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `VITE_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

---

### `npm run build` / `yarn build`
**Purpose**: Builds the application for production deployment

**Functionality**:
- Compiles TypeScript to JavaScript
- Bundles all assets using Vite
- Optimizes code for production (minification, tree-shaking)
- Generates static files in the `dist/` directory
- Performs type checking during build

**Usage Examples**:
```bash
npm run build
# or
yarn build
```

**Expected Output**:
```
vite v5.0.0 building for production...
✓ 234 modules transformed.
dist/index.html                   0.45 kB │ gzip:  0.30 kB
dist/assets/index-DiwrgTda.css    8.15 kB │ gzip:  2.34 kB
dist/assets/index-C2PWsmkP.js   142.84 kB │ gzip: 46.11 kB
✓ built in 3.45s
```

**Common Use Cases**:
- Preparing for production deployment
- Testing production build locally
- CI/CD pipeline integration

**Required Environment Variables**:
- Same as development, but typically from production environment

---

### `npm run preview` / `yarn preview`
**Purpose**: Serves the production build locally for testing

**Functionality**:
- Serves the built application from `dist/` directory
- Simulates production environment locally
- Useful for testing production build before deployment

**Usage Examples**:
```bash
# First build the project
npm run build

# Then preview it
npm run preview
```

**Expected Output**:
```
  ➜  Local:   http://localhost:4173/
  ➜  Network: use --host to expose
```

**Common Use Cases**:
- Testing production build locally
- Verifying build optimization
- Final testing before deployment

**Prerequisites**:
- Must run `npm run build` first
- Production environment variables should be set

---

### `npm run lint` / `yarn lint` (if configured)
**Purpose**: Runs ESLint to check code quality and formatting

**Functionality**:
- Analyzes TypeScript/JavaScript code for errors
- Checks for code style violations
- Identifies potential bugs and anti-patterns
- Enforces consistent coding standards

**Usage Examples**:
```bash
npm run lint
# or with automatic fixing
npm run lint -- --fix
```

**Expected Output**:
```bash
# No issues
✨ No ESLint errors found

# With issues
src/components/Example.tsx
  12:5  error  'useState' is defined but never used  @typescript-eslint/no-unused-vars
  25:10 warning  Missing return type annotation  @typescript-eslint/explicit-function-return-type
```

**Common Use Cases**:
- Code quality assurance
- Pre-commit hooks
- CI/CD quality gates

---

### `npm run type-check` / `yarn type-check` (if configured)
**Purpose**: Runs TypeScript compiler for type checking without building

**Functionality**:
- Validates TypeScript types across the project
- Catches type errors without generating build files
- Faster than full build for type validation

**Usage Examples**:
```bash
npm run type-check
```

**Expected Output**:
```bash
# Success
No TypeScript errors found

# With errors
src/components/PhotoAlbumUploader.tsx(45,12): error TS2345: 
Argument of type 'string' is not assignable to parameter of type 'number'.
```

**Common Use Cases**:
- Quick type validation
- Pre-commit type checking
- CI/CD type safety verification

---

## 🛠️ Custom Script Additions

### Adding Test Scripts
To add testing capabilities, you could include:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

### Adding Database Scripts
For database management:

```json
{
  "scripts": {
    "db:generate-types": "supabase gen types typescript --local > src/integrations/supabase/types.ts",
    "db:reset": "supabase db reset",
    "db:migrate": "supabase migration up"
  }
}
```

### Adding Deployment Scripts
For automated deployment:

```json
{
  "scripts": {
    "deploy:vercel": "vercel --prod",
    "deploy:netlify": "netlify deploy --prod --dir=dist"
  }
}
```

## 🔧 Script Configuration Files

### Development Server Configuration
Controlled by `vite.config.ts`:
```typescript
export default defineConfig({
  server: {
    host: "::",
    port: 8080,  // Custom port
  },
  // ... other config
});
```

### Build Configuration
Also in `vite.config.ts`:
```typescript
export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
  },
  // ... other config
});
```

## 📝 Environment-Specific Scripts

### Development Environment
```bash
# Start with specific environment
NODE_ENV=development npm run dev

# Start with debug logging
DEBUG=true npm run dev
```

### Production Environment
```bash
# Build for production
NODE_ENV=production npm run build

# Preview production build
npm run preview
```

## 🚨 Troubleshooting Scripts

### Common Script Issues

1. **Port Already in Use**:
   ```bash
   # Find process using port 8080
   lsof -ti:8080
   
   # Kill the process
   kill -9 $(lsof -ti:8080)
   ```

2. **Build Failures**:
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   
   # Clear Vite cache
   rm -rf node_modules/.vite
   ```

3. **TypeScript Errors**:
   ```bash
   # Restart TypeScript server in VS Code
   # Cmd/Ctrl + Shift + P -> "TypeScript: Restart TS Server"
   
   # Check TypeScript version
   npx tsc --version
   ```

## 📊 Performance Monitoring

### Build Analysis
To analyze bundle size:
```bash
# Install bundle analyzer
npm install --save-dev vite-bundle-analyzer

# Add to vite.config.ts and run build
npm run build
```

### Development Performance
Monitor development server performance:
```bash
# Start with timing information
npm run dev -- --debug
```

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Build and Test
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run lint
      - run: npm run type-check
      - run: npm run build
```

---

**Note**: Some scripts mentioned may need to be added to your `package.json` if not already present. The core scripts (`dev`, `build`, `preview`) are automatically provided by Vite.
