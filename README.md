# WhiteFlow

A real-time collaborative whiteboard application with integrated games, chat, and productivity features. WhiteFlow enables teams to work together seamlessly with synchronized drawing, interactive games, and communication tools.

## Features

### 🎨 Collaborative Whiteboard
- Real-time synchronized drawing and annotations
- Multiple users can draw simultaneously
- Ghost cursor tracking to see where other users are working
- Customizable user colors and themes

### 🎮 Interactive Games
- **Connect 4** - Classic strategy game for two players
- **Tic-Tac-Toe** - Quick and fun game sessions
- **Rock-Paper-Scissors** - Fast-paced decision making
- Real-time game state synchronization
- Server-authoritative seat management

### 💬 Real-time Chat
- Live messaging within board rooms
- Typing indicators
- Chat history persistence (last 50 messages)
- User presence indicators

### ⏱️ Pomodoro Timer
- Synchronized Pomodoro timer across all users in a room
- Auto-starts when first user joins
- Phase tracking (work/break)
- Real-time countdown synchronization

### 🏠 Room Management
- Create custom rooms with unique codes
- Join existing rooms via room code
- Room-based collaboration spaces
- User presence tracking with ghost mode (inactive users)

### 🔐 Authentication
- Auth0 integration for secure user authentication
- User profile management
- Persistent user preferences (colors, themes)

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - Real-time bidirectional communication
- **Redis** - Data persistence and caching
- **Auth0** - Authentication and user management
- **bcrypt** - Password hashing

### Frontend
- **Vanilla JavaScript** - Core functionality
- **Tailwind CSS** - Utility-first CSS framework
- **Interact.js** - Drag and drop interactions
- **Font Awesome** - Icon library

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** (v7 or higher)
- **Redis** server (local or cloud instance)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd WhiteFlow
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd backend
   npm install
   cd ..
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the `backend` directory with the following variables:
   ```env
   # Auth0 Configuration
   AUTH0_SECRET=your_auth0_secret_here
   AUTH0_BASE_URL=http://localhost:3000
   AUTH0_CLIENT_ID=your_auth0_client_id
   AUTH0_DOMAIN=your_auth0_domain.auth0.com
   
   # Redis Configuration
   REDIS_HOST=your_redis_host
   REDIS_USERNAME=your_redis_username
   REDIS_PASSWORD=your_redis_password
   ```

   **Note:** For local development, you can use a local Redis instance. Update `REDIS_HOST` to `localhost` and adjust the port in `backend/redis.js` if needed.

4. **Configure Auth0**
   - Create an Auth0 account at [auth0.com](https://auth0.com)
   - Create a new application (Single Page Application)
   - Add `http://localhost:3000` to allowed callback URLs, logout URLs, and web origins
   - Copy your Client ID and Domain to the `.env` file
   - Generate a secret for `AUTH0_SECRET` (can be any long random string)

5. **Start Redis** (if using locally)
   ```bash
   # On macOS with Homebrew
   brew services start redis
   
   # On Linux
   sudo systemctl start redis
   
   # On Windows
   # Use Redis for Windows or WSL
   ```

6. **Start the server**
   ```bash
   npm start
   ```

   The application will be available at `http://localhost:3000`

## Project Structure

```
WhiteFlow/
├── backend/
│   ├── node_modules/
│   ├── redis.js              # Redis client configuration
│   ├── server.js             # Main Express server and Socket.IO setup
│   ├── show-redis-users.js   # Utility to view Redis users
│   ├── watch-redis.js        # Utility to monitor Redis
│   ├── package.json
│   └── .env                  # Environment variables (not in git)
├── src/
│   ├── mainapp.html          # Main SPA entry point
│   ├── mainJS.js             # Router and app initialization
│   ├── mainCSS.css           # Global styles
│   ├── Pages/                # Page templates
│   │   ├── homepage.html
│   │   ├── board.html
│   │   ├── chats.html
│   │   ├── login.html
│   │   ├── room.html
│   │   └── signin.html
│   ├── components/           # Reusable components
│   │   ├── navbar.html
│   │   └── chat.html
│   ├── javascript/           # Frontend scripts
│   │   ├── board.js          # Whiteboard functionality
│   │   ├── chat.js           # Chat functionality
│   │   ├── games.js          # Game logic
│   │   ├── homepage.js       # Homepage logic
│   │   ├── login.js          # Login handling
│   │   ├── navbar.js         # Navigation bar
│   │   ├── pomodoro.js       # Timer functionality
│   │   └── room.js           # Room management
│   └── css/                  # Stylesheets
│       ├── board.css
│       ├── chats.css
│       ├── homepage.css
│       ├── login.css
│       ├── navbar.css
│       ├── room.css
│       └── sign-in.css
├── package.json
└── README.md
```

## Usage

### Starting the Application

1. Ensure Redis is running
2. Start the server: `npm start`
3. Open your browser to `http://localhost:3000`
4. Sign in with Auth0 credentials

### Creating a Room

1. Navigate to the Room page
2. Enter a room name
3. Optionally provide a custom room code
4. Click "Create Room"
5. Share the room code with others to collaborate

### Joining a Room

1. Navigate to the Room page
2. Enter the room code
3. Click "Join Room"

### Using the Whiteboard

- Click and drag to draw
- Your cursor position is visible to other users
- Customize your color in profile settings
- All drawings are synchronized in real-time

### Playing Games

1. Navigate to a board room
2. Click on an available game (Connect 4, Tic-Tac-Toe, or Rock-Paper-Scissors)
3. Take a seat when prompted
4. Game state persists even if users disconnect and reconnect

### Using Chat

- Type messages in the chat panel
- Messages are saved and visible to all users in the room
- Typing indicators show when others are typing

### Pomodoro Timer

- Timer automatically starts when the first user joins a room
- Timer is synchronized across all users
- Use controls to pause, reset, or change phases

## Available Scripts

### Root Level
- `npm start` - Start the Express server

### Backend Directory
- `npm start` - Start the server
- `npm run show-users` - Display all users stored in Redis
- `npm run watch` - Monitor Redis activity

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `AUTH0_SECRET` | Secret key for Auth0 session encryption | Yes |
| `AUTH0_BASE_URL` | Base URL of your application | Yes |
| `AUTH0_CLIENT_ID` | Auth0 application client ID | Yes |
| `AUTH0_DOMAIN` | Your Auth0 domain | Yes |
| `REDIS_HOST` | Redis server hostname | Yes |
| `REDIS_USERNAME` | Redis username | Yes |
| `REDIS_PASSWORD` | Redis password | Yes |

## Development

### Architecture

WhiteFlow uses a **Single Page Application (SPA)** architecture:
- Client-side routing handled by `mainJS.js`
- Dynamic HTML injection for page navigation
- Socket.IO for real-time features
- Redis for persistent data storage

### Key Features Implementation

- **Real-time Synchronization**: All drawing, game moves, and chat messages are broadcast via Socket.IO
- **State Persistence**: Game states, chat history, and user profiles are stored in Redis
- **Ghost Mode**: Users become "ghosts" after 10 seconds of inactivity, visible to others but with reduced opacity
- **Server Authority**: Game seat assignments are managed server-side to prevent race conditions

## Troubleshooting

### Redis Connection Issues
- Ensure Redis is running: `redis-cli ping` should return `PONG`
- Verify Redis credentials in `.env`
- Check firewall settings if using a remote Redis instance

### Auth0 Authentication Issues
- Verify callback URLs are correctly configured in Auth0 dashboard
- Ensure `AUTH0_BASE_URL` matches your application URL
- Check that `AUTH0_SECRET` is set correctly

### Socket.IO Connection Issues
- Check browser console for connection errors
- Verify CORS settings in `server.js`
- Ensure the server is running on the expected port

## Contributing

This project was created for a beginner web development team. Contributions are welcome! Please ensure:
- Code follows existing style conventions
- New features include appropriate error handling
- Socket.IO events are properly documented

## License

ISC

## Team

Repository for Beginner Web Development Team - Beginning Oct. 14 2025 - About 12-13 members

---

**Note**: This application requires both Redis and Auth0 to function properly. Make sure both services are configured before running the application.
