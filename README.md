# Battleship Carnage

A multiplayer top-down retro naval battle game where players engage in combat on an endless water map, collect wreckage to upgrade their ships, and climb the leaderboard.

## Project Overview

Battleship Carnage is a browser-based multiplayer game featuring naval battles with realistic physics, various weapon systems, and a progression system. Players start with a small ship and can upgrade their vessels by collecting wreckage from defeated enemies.

## Key Features

- **Endless Water Map**: Open sea with no predefined borders
- **Realistic Naval Physics**: Momentum-based movement with inertia
- **Varied Arsenal**: Cannons, torpedoes, and missiles with distinct tactical advantages
- **Ship Upgrades**: Improve hull durability, engine power, and weapon systems
- **Multiplayer**: Real-time battles with other players
- **Leaderboards**: Compete for high scores based on kills and survival time

## Development Status

This project is currently in development. See the [Development Plan](development-plan.md) for details on the phased approach.

## Project Structure

The project follows a client-server architecture:

- **Frontend**: React with WebGL for rendering
- **Backend**: Node.js with Socket.IO for real-time communication
- **Database**: PostgreSQL for persistent storage
- **Cache**: Redis for session data and real-time events

For more details, see the [Architecture Document](architecture.md).

## Getting Started

### Prerequisites

- Node.js (v18.0.0 or higher)
- npm or yarn
- PostgreSQL
- Redis

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/battleship-carnage.git
   cd battleship-carnage
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   ```
   cp .env.example .env
   ```
   Edit the `.env` file with your database and Redis credentials.

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Controls

- **W/S**: Increase/decrease ship speed (throttle control)
- **A/D**: Steer left/right (rudder control)
- **Mouse Movement**: Rotate gun turrets
- **Left Mouse Button**: Fire cannons
- **Right Mouse Button**: Fire missiles (target must be locked)
- **F Key**: Fire surface-to-surface missiles
- **R Key**: Fire torpedoes

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by classic naval battle games
- Built with modern web technologies
- Special thanks to all contributors 