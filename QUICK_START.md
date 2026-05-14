# OmniPDF - Quick Start (5 Minutes)

## TL;DR - Get Running in 3 Commands

```bash
# 1. Install dependencies
pnpm install

# 2. Start development server
pnpm dev

# 3. Open browser
# Navigate to http://localhost:3000
```

That's it! 🎉

---

## What You'll See

1. **Landing Page** - Beautiful hero with 10 PDF tools
2. **Navigation** - Click any tool to see its dedicated page
3. **Tool Pages** - Each with unique features and descriptions
4. **Responsive Design** - Works on mobile, tablet, desktop

---

## Test Each Tool Page

| Tool | URL | What to Check |
|------|-----|---------------|
| Merge PDF | `http://localhost:3000/merge-pdf` | Upload area, features, FAQ |
| Split PDF | `http://localhost:3000/split-pdf` | Page extraction features |
| Compress PDF | `http://localhost:3000/compress-pdf` | Quality options |
| PDF to Images | `http://localhost:3000/pdf-to-images` | Format options (JPG/PNG) |
| PDF to Text | `http://localhost:3000/pdf-to-text` | Text extraction |
| PDF to Word | `http://localhost:3000/pdf-to-docx` | DOCX conversion |
| Images to PDF | `http://localhost:3000/images-to-pdf` | Image arrangement |
| AI Summarizer | `http://localhost:3000/pdf-summarizer` | AI features |
| PDF Editor | `http://localhost:3000/pdf-editor` | Page reordering, rotation |
| P2P Transfer | `http://localhost:3000/p2p-transfer` | File transfer |

---

## Key Features to Verify

✅ **Routing** - Pages scroll to top when navigating  
✅ **SEO** - Each page has unique title and description  
✅ **Responsive** - Works on all screen sizes  
✅ **No Login** - 100% free, no account required  
✅ **Privacy** - All processing in browser  

---

## Troubleshooting

**Port 3000 in use?**
```bash
# Use different port
PORT=3001 pnpm dev
```

**Dependencies fail?**
```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**See errors in console?**
- Open DevTools (F12)
- Check Console tab
- Most errors are safe to ignore for local testing

---

## Ready to Deploy?

Once you've tested everything:

1. **Extract the ZIP** to your local machine
2. **Run `pnpm install`** to install dependencies
3. **Run `pnpm dev`** to start the server
4. **Test all pages** using the checklist above
5. **Upload the ZIP** to Manus
6. **Click Publish** to go live

---

## Need Help?

- Check `LOCAL_SETUP.md` for detailed setup guide
- Check `README.md` for project overview
- Check browser console (F12) for error messages

**Happy testing! 🚀**
