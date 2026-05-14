# OmniPDF - Local Setup & Testing Guide

This guide will help you run OmniPDF locally on your machine to test all features before deploying to production.

## Prerequisites

Before you start, make sure you have the following installed on your system:

### Required Software
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **pnpm** (v8 or higher) - Install globally: `npm install -g pnpm`
- **Git** (optional, for version control) - [Download](https://git-scm.com/)

### Verify Installation
Open your terminal and run:
```bash
node --version    # Should show v18.0.0 or higher
pnpm --version    # Should show 8.0.0 or higher
```

## Step 1: Extract & Navigate to Project

```bash
# Extract the downloaded ZIP file
unzip omipdf-v2.zip
cd omipdf-v2
```

## Step 2: Install Dependencies

```bash
# Install all project dependencies
pnpm install

# This will take 2-3 minutes and install:
# - React 19 + TypeScript
# - Express 4 + tRPC 11
# - PDF processing libraries (pdf-lib, pdf-parse, pdfkit)
# - UI components (shadcn/ui, Tailwind CSS 4)
# - And many more...
```

## Step 3: Configure Environment (Optional)

The project comes with default environment variables pre-configured. If you want to customize:

1. Create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local  # If .env.example exists
# Or create manually
```

2. Add these optional variables:
```
VITE_APP_TITLE=OmniPDF
VITE_APP_LOGO=https://your-logo-url.com/logo.png
```

**Note:** Most features work without additional configuration for local testing.

## Step 4: Start the Development Server

```bash
# Start the dev server
pnpm dev

# You should see output like:
# Server running on http://localhost:3000/
# Vite dev server ready in XXms
```

The server will be available at: **http://localhost:3000**

## Step 5: Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

You should see the OmniPDF landing page with all 10 tools.

---

## Testing Checklist

### Landing Page Tests
- [ ] Page loads without errors
- [ ] All 10 tools are visible in the grid
- [ ] Hero section displays correctly
- [ ] Trust signals (100% Private, Lightning Fast, Always Free) are visible
- [ ] FAQ section expands/collapses properly
- [ ] Buttons are clickable

### Navigation Tests
- [ ] Click each tool - verify page scrolls to top
- [ ] Each tool page has unique title and description
- [ ] Back button works (browser back)
- [ ] URL changes correctly (e.g., `/merge-pdf`, `/split-pdf`)
- [ ] Refresh page maintains correct tool

### Tool Pages to Test

#### 1. **Merge PDF** (`/merge-pdf`)
- [ ] Page loads with upload area
- [ ] Features section displays 3 steps
- [ ] Trust signals visible
- [ ] FAQ section present

#### 2. **Split PDF** (`/split-pdf`)
- [ ] Page loads correctly
- [ ] Unique content from merge page
- [ ] All feature cards display

#### 3. **Compress PDF** (`/compress-pdf`)
- [ ] Page has quality options mentioned
- [ ] Different content from other tools

#### 4. **PDF to Images** (`/pdf-to-images`)
- [ ] Format options (JPG/PNG) mentioned
- [ ] ZIP export feature described

#### 5. **PDF to Text** (`/pdf-to-text`)
- [ ] Text extraction features listed
- [ ] Download option mentioned

#### 6. **PDF to Word** (`/pdf-to-docx`)
- [ ] DOCX conversion described
- [ ] Formatting preservation mentioned

#### 7. **Images to PDF** (`/images-to-pdf`)
- [ ] Image arrangement mentioned
- [ ] Rotation feature described

#### 8. **AI Summarizer** (`/pdf-summarizer`)
- [ ] AI features described
- [ ] Chat interface mentioned

#### 9. **PDF Editor** (`/pdf-editor`)
- [ ] Reorder pages feature listed
- [ ] Delete pages feature listed
- [ ] Rotate pages feature listed
- [ ] Duplicate pages feature listed
- [ ] Insert blank pages feature listed
- [ ] Extract pages feature listed

#### 10. **P2P Transfer** (`/p2p-transfer`)
- [ ] Peer-to-peer transfer described
- [ ] Code generation mentioned

### SEO Tests

#### Meta Tags
- [ ] Open DevTools (F12) → Elements tab
- [ ] Check each page has unique `<title>` tag
- [ ] Check `<meta name="description">` exists
- [ ] Check `<meta name="keywords">` exists

#### Structured Data
- [ ] Right-click page → View Page Source
- [ ] Search for `<script type="application/ld+json">`
- [ ] Verify JSON-LD data is present

#### Sitemap
- [ ] Navigate to `http://localhost:3000/sitemap.xml`
- [ ] Should see all 10 tool URLs listed
- [ ] Each URL has priority and lastmod

#### Robots.txt
- [ ] Navigate to `http://localhost:3000/robots.txt`
- [ ] Should allow all crawlers

### Responsive Design Tests

#### Mobile (375px width)
- [ ] Open DevTools → Toggle device toolbar (Ctrl+Shift+M)
- [ ] Select iPhone SE (375px)
- [ ] All text readable without horizontal scroll
- [ ] Buttons clickable with thumb
- [ ] Images scale properly

#### Tablet (768px width)
- [ ] Select iPad (768px)
- [ ] Layout adapts properly
- [ ] Grid items stack appropriately

#### Desktop (1920px width)
- [ ] Full layout displays correctly
- [ ] No excessive whitespace
- [ ] Content centered properly

### Performance Tests

#### Page Load Speed
- [ ] Open DevTools → Network tab
- [ ] Reload page
- [ ] Check load time (should be < 3 seconds)
- [ ] Verify no 404 errors

#### Console Errors
- [ ] Open DevTools → Console tab
- [ ] Reload page
- [ ] Should see no red errors
- [ ] Warnings are acceptable

### Browser Compatibility

Test on these browsers:
- [ ] Chrome/Chromium (latest)
- [ ] Firefox (latest)
- [ ] Safari (if on Mac)
- [ ] Edge (if on Windows)

---

## Troubleshooting

### Port 3000 Already in Use
```bash
# On Mac/Linux: Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# On Windows: Find and kill process
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use a different port
PORT=3001 pnpm dev
```

### Dependencies Installation Fails
```bash
# Clear pnpm cache
pnpm store prune

# Remove lock file and node_modules
rm -rf pnpm-lock.yaml node_modules

# Reinstall
pnpm install
```

### TypeScript Errors
```bash
# Check TypeScript compilation
pnpm check

# Fix any issues found
pnpm format  # Auto-format code
```

### Vite Dev Server Issues
```bash
# Clear Vite cache
rm -rf .vite

# Restart dev server
pnpm dev
```

---

## Development Tips

### Hot Module Replacement (HMR)
- Changes to React components auto-reload
- No need to manually refresh browser
- Changes appear instantly

### Debug Mode
```bash
# Run with debug logging
DEBUG=* pnpm dev
```

### Build for Production
```bash
# Create optimized production build
pnpm build

# Preview production build locally
pnpm preview
```

### Run Tests
```bash
# Run all tests
pnpm test

# Watch mode (re-run on file changes)
pnpm test:watch

# Coverage report
pnpm test:coverage
```

---

## File Structure

```
omipdf-v2/
├── client/                 # Frontend (React)
│   ├── src/
│   │   ├── pages/         # Page components
│   │   │   ├── Home.tsx   # Landing page
│   │   │   └── tools/     # Tool pages
│   │   ├── components/    # Reusable components
│   │   ├── lib/           # Utilities (tRPC client)
│   │   └── App.tsx        # Main app with routing
│   └── public/            # Static files (favicon, sitemap, robots.txt)
├── server/                # Backend (Express + tRPC)
│   ├── routers/           # tRPC routers
│   ├── utils/             # PDF processing utilities
│   └── _core/             # Core server setup
├── drizzle/               # Database schema
├── package.json           # Dependencies
├── pnpm-lock.yaml         # Lock file
└── README.md              # Main documentation
```

---

## Next Steps After Testing

### If Everything Works ✅
1. Review the code in `client/src/pages/tools/` for any customizations
2. Update branding (logo, colors) if needed
3. Add your custom domain in Manus UI
4. Click **Publish** to deploy

### If You Find Issues ❌
1. Check the console for error messages
2. Review the troubleshooting section above
3. Check individual tool pages for missing content
4. Verify all dependencies installed correctly

---

## Deploying to Production

Once you've tested everything locally:

1. **Save your changes** (if any)
2. **Go to Manus Dashboard**
3. **Click "Publish"** button
4. **Configure domain** (optional)
5. **Deploy** - Your site goes live!

---

## Support & Documentation

- **Main README**: See `README.md` for project overview
- **Architecture**: See `ARCHITECTURE.md` for technical details
- **Implementation Guide**: See `IMPLEMENTATION_GUIDE.md` for code examples
- **Setup Guide**: See `SETUP_GUIDE.md` for deployment details

---

## Quick Commands Reference

```bash
# Start development
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Format code
pnpm format

# Check TypeScript
pnpm check

# Clean install
rm -rf node_modules pnpm-lock.yaml && pnpm install
```

---

**Happy Testing! 🚀**

If you encounter any issues, check the troubleshooting section or review the error messages in the browser console.
