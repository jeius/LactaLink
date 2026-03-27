![LactaLink Logo](../assets/images/logo.png)

# LactaLink

A Tech-driven Solution for Breastmilk Donation and Distribution

## Overview

LactaLink, built with **React Native (Expo)**, facilitates the donation and distribution of breast milk. The app provides a platform for individuals(donors/recipients) and organizations(hospitals/milkbanks) to connect while ensuring medical approval, safety, and convenience.

## Tech Stack 🛠️

### Frontend

- ⚛️ [React Native (Expo)](https://docs.expo.dev) (Mobile App: Android & iOS)
- ⚛️ [React (Next.js)](https://nextjs.org/docs) (Admin Panel: Web)

### Backend

- 🛠️ [Next.js](https://nextjs.org/docs)
- 🛠️ [Payload CMS](https://payloadcms.com/docs)

### State Management

- 🗂️ [TanStack React Query](https://tanstack.com/query/latest) (Server-side)
- 🗂️ [Zustand](https://zustand.docs.pmnd.rs/) (Client-side)

### Database

- 🗄️ [Supabase (PostgreSQL)](https://supabase.com)

### Authentication

- 🔐 [Supabase Auth](https://supabase.com)
- 🔐 [Google OAuth](https://console.cloud.google.com)

### GIS (Geographic Information System)

- 🗺️ [Google Maps API](https://console.cloud.google.com)

### Email Services

- 📧 [Supabase SMTP](https://supabase.com)
- 📧 [Resend API](https://resend.com/)

### Cloud Storage

- ☁️ [Supabase Storage](https://supabase.com)

### Hosting & Deployment

- 🌐 [Vercel](https://vercel.com) (Web Hosting, Domain & SSL)
- 📱 [Expo Application Services (EAS)](https://expo.dev) (Mobile App Distribution)

### Domain Management

- 🌍 [Vercel](https://vercel.com) (Domain & SSL)
- 🏷️ [Namecheap](https://www.namecheap.com) (Domain Registrar)

### Development Tools

- 🏗️ [Turborepo](https://turborepo.com/docs) (Monorepo Management)
- 📦 [pnpm](https://pnpm.io/motivation) (Package Manager)
- 🧪 [ESLint](https://eslint.org/docs/latest/) (Linting)
- 🛠️ [TypeScript](https://www.typescriptlang.org/) (Static Typing)
- 🎨 [Prettier](https://prettier.io/) (Code Formatting)

> More details in the [Technical Architecture](./docs/technical-architecture/INDEX.md) documentation.

## Installation & Setup ⚙️📦

### Prerequisites

- 🖥️ Node.js & pnpm installed - **Required**
- 🏛️ [Supabase Project](https://supabase.com/dashboard/new) - **Required**
- 🌐 [Google Cloud Project](https://console.cloud.google.com) with Maps API and OAuth credentials - **Required**
- 📲 [Expo Project](https://expo.dev/accounts) (for building dev client) and Expo CLI installed globally (`npm install -g expo-cli`) - **Required**
- 🌐 [Vercel Account](https://vercel.com/signup) (for hosting the web app) - **Optional**

### Steps to Run

1. 📂 Clone the repository:

   ```sh
   git clone https://github.com/Jeius/LactaLink.git
   cd lactalink
   ```

2. 📦 Install dependencies:

   ```sh
   pnpm install
   ```

3. 🏗️ Build the packages:

   ```sh
   pnpm build:packages
   ```

4. 🛠️ Setup environment variables:
   - Create a `.env` file in the `apps/mobile` and `apps/web` directory.
   - Add necessary environment variables (e.g., Supabase URL, Supabase Anon Key, Google Maps API Key, Api URL).
   - Refer to `.env.example` for guidance.

5. 🗄️ Create database triggers for Supabase Auth:
   - Go to Supabase Dashboard -> SQL Editor
   - Copy and paste into the SQL Editor all of the SQL commands from `database/sql/triggers` directory and run them.

6. ▶️ Build the Mobile app dev client:
   - Log in to your Expo account using the command:
     ```sh
     eas login
     ```
   - Build the dev client for your platform:
     ```sh
     cd apps/mobile
     ```
     ```sh
     pnpm build:android-dev # For Android
     ```
     ```sh
     pnpm build:ios-dev     # For iOS
     ```

7. 📲 Install the dev client on your device:
   - For Android, download the APK from the Expo dashboard and install it.
   - For iOS, follow this tutorial: [Installing custom iOS apps](https://docs.expo.dev/development/introduction/#installing-custom-ios-apps).

8. 🚀 Start the development servers:
   ```sh
   // In the root directory
   pnpm dev
   ```

## Docker Deployment 🐳

For production deployment using Docker and Northflank:

- 📖 **[Docker Documentation](./apps/web/DOCKER_README.md)** - Complete Docker setup guide
- 🚀 **[Quick Commands](./apps/web/DOCKER_COMMANDS.md)** - Common Docker commands

**Quick start:**

```sh
# Build the Docker image
docker build -f apps/web/Dockerfile -t lactalink-web:latest .

# Run locally
cd apps/web
docker-compose up
```

## Contributing 🤝💡📈

- 🍴 Fork the repository
- 🌱 Create a new branch (`git checkout -b feature-branch`)
- 📝 Commit changes and push (`git push origin feature-branch`)
- 🔄 Open a Pull Request

## License 📜⚖️🔓

[MIT License](./LICENSE.md)
