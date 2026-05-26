# IP Diagnostics — Enhanced Version

A fast, lightweight IP and device diagnostics page. Check your public IP address, geolocation, ISP, timezone, browser details, and more in one view.

## About This Project

This is an enhanced version of [internet.yaosamo.com](https://internet.yaosamo.com/) by **[Yaroslav Samoylov](https://yaosamo.com/about)**. 

### Enhancements Made

This version includes improvements built with [Claude](https://claude.ai/):

- **Separate copy buttons** for IPv4 and IPv6 addresses — choose which IP to copy independently
- **Responsive layout** with proper spacing and button visibility on all screen sizes
- **Improved button styling** with clear visual feedback (COPIED state)
- **Better font sizing** for long IPv6 addresses to ensure accessibility
- **Button placement** below IP addresses for guaranteed visibility

## Original Attribution

All credit for the original concept, design, and core functionality goes to **Yaroslav Samoylov**. This enhanced version builds on that excellent foundation with quality-of-life improvements.

- Original: [internet.yaosamo.com](https://internet.yaosamo.com/)
- Author: [Yaroslav Samoylov](https://yaosamo.com/about)

## Features

- 🌐 **IP Detection** — Display both IPv4 and IPv6 with independent copy buttons
- 📍 **Geolocation** — Country, city, ISP, and timezone information
- ⏰ **Time Data** — Browser timezone vs. geolocation timezone
- 💻 **Device Info** — Viewport size, screen resolution, browser details
- 🚀 **Network Diagnostics** — Connection type, speed test, and more
- 📋 **Raw JSON** — Live dump of all collected data

## Installation

1. Clone this repository
2. Serve the `/ip` directory via HTTP (local or remote)
3. Open in your browser

```bash
git clone https://github.com/alexbloemendal/ip-diagnostics.git
cd ip-diagnostics/ip
# Serve with your preferred web server (Python, Node, etc.)
python3 -m http.server 8000
```

Then visit `http://localhost:8000`

## File Structure

```
ip/
├── index.html          # Main HTML structure with enhanced UI
├── src/
│   ├── app.js          # Application logic
│   └── styles.css      # Responsive styling
└── public/
    └── fonts/          # Departure Mono font files
```

## Browser Support

Modern browsers (Chrome, Firefox, Safari, Edge). Requires:
- ES6 JavaScript support
- Clipboard API (with fallback to execCommand)
- Fetch API

## License

This enhanced version respects the original work. Please acknowledge [Yaroslav Samoylov](https://yaosamo.com/about) when using or referencing this project.

## Gratitude

Special thanks to **Yaroslav Samoylov** for creating the original internet.yaosamo.com. This enhancement is built in the spirit of respecting and improving upon great open work.

---

**Built with Claude** — An AI assistant by Anthropic
