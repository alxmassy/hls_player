# UCT HLS Player

A modern, feature-rich HLS player that supports both live and VOD streams over HTTP/HTTPS.

## Features

- ✅ **HTTP & HTTPS HLS Support** - Play any `.m3u8` stream
- ✅ **Live Stream Detection** - Auto-detects and shows live badge
- ✅ **Quality Info** - Real-time resolution and bitrate display
- ✅ **Latency Monitoring** - Live stream latency tracking
- ✅ **Auto Recovery** - Handles network/media errors gracefully
- ✅ **Modern UI** - Dark theme with glassmorphism effects
- ✅ **Responsive** - Works on desktop and mobile

## Quick Start

### Local Development

```bash
# Clone the repo
git clone https://github.com/alxmassy/hls_player.git
cd hls_player

# Serve locally (requires Node.js)
npx serve .

# Open http://localhost:3000
```

### Deploy to Vercel

1. **Sign up** at [vercel.com](https://vercel.com) (GitHub login recommended)
2. **Import Project** → Select your GitHub repo `alxmassy/hls_player`
3. **Click Deploy** - No configuration needed
4. Access at `https://your-project.vercel.app`

Or use Vercel CLI:

```bash
npm i -g vercel
vercel --prod
```

## Usage

1. Enter any HLS URL ending in `.m3u8`
2. Click **Play** or try a sample stream
3. Player shows live status, quality, and latency

## Technology Stack

- **hls.js** - HLS playback library
- **Vanilla JS** - No framework overhead
- **CSS3** - Modern gradients and animations
- **Vercel** - Zero-config deployment

## Browser Support

- Chrome/Edge (hls.js)
- Firefox (hls.js)
- Safari (native HLS)

## License

MIT