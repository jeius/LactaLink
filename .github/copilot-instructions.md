# Copilot Instructions for LactaLink

Welcome to the LactaLink codebase! This document provides essential guidance for AI coding agents to be productive in this project. It covers the architecture, workflows, conventions, and integration points specific to LactaLink.

## Project Overview

LactaLink is a tech-driven solution for breastmilk donation and distribution. It connects donors, recipients, and organizations (e.g., hospitals, milk banks) while ensuring medical approval, safety, and convenience.

### Key Technologies

- **Frontend**:
  - **React Native (Expo)** for the mobile app (Android & iOS).
  - **React (Next.js)** for the web admin panel.
- **Backend**:
  - **Next.js** for server-side rendering and APIs.
  - **Payload CMS** for content management.
- **State Management**:
  - **TanStack React Query** for server-side state management.
  - **Zustand** for client-side state management.
- **Database**:
  - **Supabase (PostgreSQL)** for data storage.
- **API Communication**:
  - **Payload CMS RESTful APIs** for frontend-backend communication.
- **Authentication**:
  - **Supabase Auth** and **Google OAuth**.
- **GIS**:
  - **Google Maps API** for location-based features.
- **Email Services**:
  - **Supabase SMTP** for auth email notifications.
  - **Payload CMS Email Adapter** with **Resend API** for email service.
- **Cloud Storage**:
  - **Supabase Storage** for file storage.
  - **Payload CMS S3 Adapter** for managing media files and communicating with the **Supabase Storage**.
- **Identity Verification**:
  - **face-api.js** for face detection and comparison in ID Verfication.
- **Realtime Messaging**:
  - **Supabase Realtime** for instant communication.
- **Hosting**:
  - **Vercel** for deployment.
  - **Expo Application Services (EAS)** for mobile app distribution.
- **Monorepo Management**:
  - **Turborepo** for managing multiple packages and apps.
- **Documentation**:
  - **TypeDoc** for code documentation.
  - Markdown files in the `docs` folder for architectural and feature documentation.

## Codebase Structure

- **`apps/mobile`**: React Native app for mobile platforms.
- **`apps/web`**: Next.js-based admin panel.
- **`packages/api`**: Backend API services.
- **`packages/enums`**: Shared enums for consistent data handling.
- **`packages/types`**: Shared TypeScript types.
- **`packages/types/forms`**: Shared form schemas and types.
- **`packages/agents`**: Shared agent skills and TypeScript wrappers, consumed via subpath exports (`@lactalink/agents/payload`, `@lactalink/agents/supabase`, `@lactalink/agents/expo`).
- **`packages/utilities`**: Shared utility functions across apps.
- **`packages/eslint-config`**: Shared ESLint configuration.
- **`packages/typescript-config`**: Shared TypeScript configuration.
- **`.agents/skills/`**: Agent skill instruction files installed via `pnpx skills add <skill>` from the workspace root.
- **`database/sql`**: SQL scripts for database functions, indexes, and triggers.
- **`docs`**: Documentation for features and technical architecture.

## Developer Workflows

### Building and Running

- **Mobile App**:
  - Install dependencies: `pnpm install`.
  - Start development server: `pnpm dev` (Expo).
- **Web App**:
  - Install dependencies: `pnpm install`.
  - Start development server: `pnpm dev:web` (Next.js).

### Testing

- None specified.

### Debugging

- Use Expo's debugging tools for mobile.
- Use browser developer tools for the web admin panel.

## Project-Specific Conventions

- **Styling**: Tailwind CSS is used for styling both mobile and web apps. Refer to `tailwind.config.js` in respective directories.
- **Component Organization**: Shared components are in `apps/mobile/components` and `apps/web/src/components`.
- **TypeScript**: Strongly typed codebase with shared types in `packages/types`.
- **API Integration**: Use Supabase client for authentication interactions.
- **API**: Backend logic is in `packages/api/src`. Follow existing patterns for new endpoints.
- **Documentation**: TypeDoc for code documentations. Follow modern best practices for documenting functions and conditions.

## Integration Points

- **Google Maps API**: Used in `apps/mobile/components/GooglePlacesInput.tsx` for location search.
- **Supabase**: Centralized authentication provider.
- **Payload CMS**: Content management for the admin panel.

## Key Files

- `apps/web/next.config.mjs`: Configuration for the web app.
- `apps/web/src/app/(payload)`: Payload CMS integration.
- `apps/web/src/collections`: Payload CMS collections.
- `apps/web/src/components`: Shared React components for the web app.
- `apps/web/src/endpoints`: Payload CMS custom api endpoints.
- `apps/mobile/entry.js`: Entry point for the mobile app bundler.
- `apps/mobile/app/index.tsx`: Entry point for the mobile app.
- `apps/mobile/components`: Shared React components for the mobile app.
- `apps/mobile/lib`: Utility functions for the mobile app.
- `packages/agents`: Shared agent skills — `src/payload/` (web), `src/expo/` (mobile), `src/supabase/` (shared).
- `packages/api`: Backend API logic.
- `packages/enums`: Shared enums.
- `packages/types`: Shared TypeScript types.
- `packages/types/forms`: Shared form schema and types.
- `packages/utilities`: Shared utility functions.
- `.agents/skills/payload/SKILL.md`: PayloadCMS agent skill reference.
- `skills-lock.json`: Tracks installed agent skills.
- `database/sql`: Database scripts.
- `docs/technical-architecture/INDEX.md`: Overview of the technical architecture.
- `docs/features/INDEX.md`: Detailed feature documentation.

## Notes for AI Agents

- Follow the established folder structure and naming conventions.
- Follow DRY (Don't Repeat Yourself) principles by utilizing shared packages.
- Follow modern React practices, including hooks and functional components.
- Follow best practices for payload CMS when working with collections and custom endpoints.
- Write clear and readable, maintainable, and well-documented code.
- Follow modern best practices for documenting functions, including parameters, return types, and conditions.
- Use TypeScript for all new code.
- Ensure compatibility with both react native and next.js platforms when adding shared features.
- Refer to the `README.md` files in each directory for additional context.
- When working with PayloadCMS collections, hooks, fields, or access control, consult `.agents/skills/payload/SKILL.md` and its `reference/` files.
- Always run `pnpx skills add <skill>` from the **workspace root** so new skills are installed into `.agents/skills/` and tracked in `skills-lock.json`.
- Place TypeScript runtime wrappers for library-specific logic in the corresponding `packages/agents/src/<library>/` directory.

For further details, consult the documentation in the `docs` folder or reach out to the maintainers.
