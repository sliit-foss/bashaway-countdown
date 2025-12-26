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
- **Protected by secret key authentication**
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

- Node.js 20+ 
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
# Edit .env.local with your MongoDB connection string and admin key

# Run development server
pnpm dev
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `ADMIN_SECRET_KEY` | Secret key for admin panel access | Yes |

## Admin Authentication

The admin panel is protected by a secret key. You can access it in two ways:

1. **Login Form**: Navigate to `/admin` and enter the secret key
2. **URL Parameter**: Navigate to `/admin?key=YOUR_SECRET_KEY`

The key is stored in localStorage after successful authentication, so you won't need to enter it again until you log out.

## Deployment on Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel settings:
   - `MONGODB_URI` - Your MongoDB connection string
   - `ADMIN_SECRET_KEY` - A secure random string for admin access
4. Deploy!

## Pages

| Route | Description | Authentication |
|-------|-------------|----------------|
| `/` | Public countdown display (read-only) | None |
| `/admin` | Admin control panel | Secret Key |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/countdown` | Get current countdown state |
| POST | `/api/countdown` | Perform action (start, pause, resume, reset, end, update) |
| PUT | `/api/countdown` | Update countdown settings |
| GET | `/api/countdown/logs` | Get activity logs |
| POST | `/api/admin/verify` | Verify admin secret key |

## Database Schema

The application automatically creates the required MongoDB collections:

- `countdowns` - Stores countdown state
- `countdownlogs` - Stores activity history

## License

MIT © SLIIT FOSS
