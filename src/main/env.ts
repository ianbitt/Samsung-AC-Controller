import { config } from 'dotenv'

// Dev-only convenience: electron-vite runs with cwd = project root, so dotenv's default
// lookup (process.cwd()) finds the author's own .env there and seeds config.ts's
// envSeed(). Packaged builds carry no .env at all (never bundled - see config.ts for
// why), so this is simply a no-op there and every install configures itself via Setup.
config()
