# OmniPDF Architecture & Design

## Project Overview

OmniPDF is a premium, SEO-optimized PDF tools platform built with React + Express + tRPC. The application provides 8 core PDF manipulation tools plus an AI-powered PDF summarizer with multi-turn chat capabilities. All file processing is designed to be client-side where possible, with server-side processing for complex operations like AI summarization.

## Database Schema

### Users Table
Already provided by template. Tracks user authentication and profile info.

### PDFConversions Table
Tracks user PDF tool usage for analytics and history.

```sql
CREATE TABLE pdf_conversions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  toolType VARCHAR(50) NOT NULL, -- 'merge', 'split', 'compress', etc.
  inputFileName VARCHAR(255),
  outputFileName VARCHAR(255),
  inputSize INT,
  outputSize INT,
  status VARCHAR(20), -- 'pending', 'completed', 'failed'
  errorMessage TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

### ChatHistory Table
Stores multi-turn conversations for PDF summarizer.

```sql
CREATE TABLE chat_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  pdfFileName VARCHAR(255),
  pdfContent LONGTEXT, -- Extracted text from PDF
  messages JSON, -- Array of {role, content} objects
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

## tRPC Router Structure

### PDF Tools Router (`server/routers/pdfTools.ts`)
- `mergePDF` - Combine multiple PDFs
- `splitPDF` - Extract pages from PDF
- `compressPDF` - Reduce file size
- `pdfToImages` - Convert PDF pages to images
- `pdfToText` - Extract text from PDF
- `pdfToDocx` - Convert PDF to Word document
- `imagesToPDF` - Create PDF from images

### AI Chat Router (`server/routers/aiChat.ts`)
- `uploadPDF` - Upload and extract text from PDF
- `sendMessage` - Send message and get AI response
- `getChatHistory` - Retrieve conversation history
- `clearChat` - Delete conversation

### Analytics Router (`server/routers/analytics.ts`)
- `trackConversion` - Log tool usage
- `getStats` - Get user statistics

## Frontend Routes

```
/                    - Landing page (hero, features, FAQ)
/merge-pdf           - Merge PDF tool page
/split-pdf           - Split PDF tool page
/compress-pdf        - Compress PDF tool page
/pdf-to-images       - PDF to images converter
/pdf-to-text         - PDF to text extractor
/pdf-to-docx         - PDF to Word converter
/images-to-pdf       - Image to PDF converter
/pdf-summarizer      - AI PDF summarizer with chat
```

## File Processing Strategy

### Client-Side Processing (Browser)
- PDF merge (using PDF.js)
- PDF split (page extraction)
- Image to PDF conversion
- File drag-and-drop handling
- File validation and preview

### Server-Side Processing
- PDF compression (using server-side libraries)
- PDF to images conversion (complex rendering)
- PDF to text/DOCX conversion (OCR and formatting)
- AI summarization (LLM API calls)

## SEO Architecture

### Meta Tags Strategy
Each page includes:
- Unique `<title>` tag with primary keyword
- `<meta name="description">` (150-160 chars)
- `<meta name="keywords">` (tool-specific keywords)
- Open Graph tags for social sharing
- Canonical tags to prevent duplicate content

### Structured Data (JSON-LD)
- Organization schema on landing page
- Tool/HowTo schema on each tool page
- FAQ schema for FAQ section
- BreadcrumbList for navigation

### Technical SEO
- `sitemap.xml` with all tool pages
- `robots.txt` allowing all crawlers
- Fast page load times (optimized assets)
- Mobile responsive design
- Internal linking between related tools

## Design System

### Color Palette
- Primary: Blue (#3B82F6) - Trust, professionalism
- Secondary: Indigo (#4F46E5) - Premium feel
- Accent: Emerald (#10B981) - Success, conversion
- Neutral: Gray scale for text and backgrounds
- Error: Red (#EF4444) - Warnings and errors

### Typography
- Headings: Inter or Geist (modern, clean)
- Body: Inter or Geist (readable, professional)
- Monospace: JetBrains Mono (code snippets)

### Components
- Buttons: Primary, secondary, outline variants
- Cards: Elevated with subtle shadows
- Inputs: Clean, with clear focus states
- Modals: Centered, with backdrop blur
- Alerts: Color-coded (success, error, warning, info)

## Trust Signals & Privacy

### Key Messages
1. "100% Browser-Based Processing" - Files never leave your device
2. "No Server Upload" - All processing happens locally
3. "Privacy First" - No tracking, no data collection
4. "Secure & Encrypted" - TLS encryption for all transfers
5. "Free & No Account Required" - Frictionless access

### Privacy Policy Sections
- Data collection practices
- File handling (deleted after session)
- Encryption and security measures
- GDPR and privacy compliance
- Cookie policy

## Performance Optimization

### Frontend
- Code splitting by route
- Lazy loading of PDF libraries
- Image optimization and compression
- Caching strategies for static assets
- Service worker for offline capability (optional)

### Backend
- Connection pooling for database
- Caching for frequently accessed data
- Async processing for heavy operations
- Rate limiting for API endpoints
- Error handling and logging

## Deployment Considerations

- Environment variables for API keys and secrets
- Database migration strategy
- File upload size limits
- Temporary file cleanup
- Monitoring and error tracking
- CDN for static assets
