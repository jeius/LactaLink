# LactaLink Mobile

Mobile app for the LactaLink platform, built with **React Native (Expo)** and **NativeWind**.

## Tech Stack

- **Framework**: [Expo](https://expo.dev) (React Native)
- **Styling**: [NativeWind v4](https://www.nativewind.dev) (Tailwind CSS)
- **UI Components**: [gluestack-ui v4](https://gluestack.io)
- **State Management**: [TanStack React Query](https://tanstack.com/query) + [Zustand](https://zustand-demo.pmnd.rs)
- **Authentication**: [Supabase Auth](https://supabase.com) + Google OAuth
- **Maps**: [Google Maps API](https://developers.google.com/maps)
- **Realtime**: [Supabase Realtime](https://supabase.com)

## Development

### Prerequisites

- Node.js 22.x
- pnpm 10.x
- Expo CLI
- Android Studio or Xcode (for emulators)

### Setup

1. **Install dependencies** (from monorepo root):

   ```bash
   pnpm install
   ```

2. **Configure environment variables**:

   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

3. **Start development server**:
   ```bash
   pnpm dev
   ```

## Scripts

- `pnpm dev` - Start Expo development server
- `pnpm lint` - Run ESLint

## Project Structure

```
apps/mobile/
├── app/                  # Expo Router app directory
│   ├── (root)/           # Authenticated app routes
│   └── auth/             # Authentication screens
├── components/           # Shared React Native components
├── features/             # Feature-specific modules
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
└── assets/               # Fonts, images, icons, and animations
```
