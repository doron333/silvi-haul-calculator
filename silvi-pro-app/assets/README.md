# Assets Folder

This folder contains application icons and branding assets.

## Required Files

You need to create the following icon files:

1. **icon.png** (512x512 pixels)
   - Main application icon
   - Used for Linux builds

2. **icon.ico** (Windows)
   - Windows application icon
   - Should contain multiple sizes: 256, 128, 64, 48, 32, 16

3. **icon.icns** (Mac)
   - macOS application icon
   - Required for .dmg builds

## How to Create Icons

### Option 1: Use Online Tools (Easiest)
- **PNG to ICO**: https://convertio.co/png-ico/
- **PNG to ICNS**: https://cloudconvert.com/png-to-icns

### Option 2: Use Command Line Tools

**For Windows (.ico):**
```bash
# Using ImageMagick
convert icon.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico
```

**For Mac (.icns):**
```bash
# Create iconset directory
mkdir icon.iconset

# Generate different sizes
sips -z 16 16     icon.png --out icon.iconset/icon_16x16.png
sips -z 32 32     icon.png --out icon.iconset/icon_16x16@2x.png
sips -z 32 32     icon.png --out icon.iconset/icon_32x32.png
sips -z 64 64     icon.png --out icon.iconset/icon_32x32@2x.png
sips -z 128 128   icon.png --out icon.iconset/icon_128x128.png
sips -z 256 256   icon.png --out icon.iconset/icon_128x128@2x.png
sips -z 256 256   icon.png --out icon.iconset/icon_256x256.png
sips -z 512 512   icon.png --out icon.iconset/icon_256x256@2x.png
sips -z 512 512   icon.png --out icon.iconset/icon_512x512.png
sips -z 1024 1024 icon.png --out icon.iconset/icon_512x512@2x.png

# Convert to icns
iconutil -c icns icon.iconset
```

## Design Guidelines

- **Keep it simple**: Icons should be recognizable at small sizes
- **Use your brand colors**: Match your company branding
- **Professional look**: This is B2B software, avoid cartoon styles
- **Clear silhouette**: Should be recognizable even in monochrome

## Temporary Placeholder

Until you create your icons, the app will use Electron's default icon.
