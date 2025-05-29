# Speech Analysis Application

A multilingual speech analysis application with field interview capabilities, real-time metrics, and advanced visualization features.

## Features

- Real-time speech analysis
- Multiple language support (including African languages)
- Field interview mode with GPS tracking
- Advanced metrics and visualizations
- Multilingual interface
- Dark/Light theme
- Practice modes
- Social sharing capabilities

## Requirements

- Node.js >= 14.0.0
- Modern web browser with support for:
  - MediaRecorder API
  - Web Speech API
  - Web Audio API
  - Geolocation API

## Quick Start

1. Clone the repository:
   ```bash
   git clone [your-repository-url]
   cd speech-analysis-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000 in your browser

## Deployment

### Vercel (Recommended)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

### Netlify

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Deploy:
   ```bash
   netlify deploy
   ```

### Manual Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Upload the contents to your web server
3. Ensure HTTPS is enabled
4. Configure CORS if necessary

## Browser Support

- Chrome (recommended)
- Firefox
- Edge
- Safari (latest versions)

## Security Considerations

- HTTPS is required for microphone access
- Ensure proper CORS configuration
- Handle user data according to privacy regulations
- Secure any API keys used in the application

## License

MIT 