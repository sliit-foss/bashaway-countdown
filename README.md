# Bashaway Countdown

Real-time countdown timer for Bashaway events with admin controls.

## Features

### Public Countdown Display (`/`)
- Real-time countdown timer with animated UI
- Shows event name, status, and remaining time
- Displays pause status and reasons
- Auto-refreshes every 3 seconds
- Responsive design for all screen sizes

### Admin Control Panel (`/admin`)
- **Controls Tab**: Start, pause, resume, reset, and end countdown
- **Settings Tab**: Configure event name, target date/time, and display message
- **Theme Tab**: Customize colors (primary, background, text, accent) with live preview
- **Activity Log**: View all actions performed with timestamps

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ (recommended 20+)
- pnpm
- MongoDB database

### Installation

```bash
# Clone the repository
git clone https://github.com/sliit-foss/bashaway-countdown.git
cd bashaway-countdown

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your MongoDB connection string

# Run development server
pnpm dev
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |

## Deployment on Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add the `MONGODB_URI` environment variable in Vercel settings
4. Deploy!

## Pages

| Route | Description |
|-------|-------------|
| `/` | Public countdown display (read-only) |
| `/admin` | Admin control panel |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/countdown` | Get current countdown state |
| POST | `/api/countdown` | Perform action (start, pause, resume, reset, end, update) |
| PUT | `/api/countdown` | Update countdown settings |
| GET | `/api/countdown/logs` | Get activity logs |

## License

MIT © SLIIT FOSS
