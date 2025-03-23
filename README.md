# Pocket ID Portal

> [!WARNING]
> This project is meant to be an example of how API Keys can be used to build certain things using information from PocketID. There may be certain things (outside of the pocket-id api info) that dont work currently.

## Overview

The Pocket ID Portal provides a user-friendly interface for accessing and managing applications that use Pocket ID for authentication. It offers a seamless single sign-on experience with secure OIDC authentication flow.

## Current Features

- **OIDC Authentication**: Secure login via your Pocket ID instance.
- **Application Dashboard**: View and access all authorized applications
- **User Profile**: View your profile information
- **Passkeys**: View the passkeys assigned to your Pocket ID Account
- **Group Management**: See which groups you belong to
- **Preferences**: Customize the portal experience with theme and landing page settings
- **Responsive Design**: Works well on desktop and mobile devices

## Tech Stack

- **SvelteKit**: Fast, reactive UI framework
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Shadcn-Svelte**: UI component library with dark/light mode support
- **TypeScript**: Static typing for better developer experience

## Getting Started

### Prerequisites

- Node.js 22 or higher
- npm

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/kmendell/pocket-id-portal.git
   cd pocket-id-portal
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Create a .env file based on .env.example

   ```bash
   cp .env.example .env
   ```

4. Update the variables with your OIDC provider details.

# Development

Run the development server:

```bash
npm run dev
```

The portal will be available at http://localhost:5173

### Environment Variables

Key environment variables include:

```env
PUBLIC_OIDC_ISSUER: URL of your OIDC provider
PUBLIC_OIDC_CLIENT_ID: Your client ID
OIDC_CLIENT_SECRET: Your client secret
PUBLIC_OIDC_SCOPES: Space-separated list of scopes to request
POCKET_ID_API_KEY: API key for server-side API calls
PUBLIC_APP_URL: The external URL this portal will run on
```

### Project Structure

- routes: SvelteKit routes and pages
- components: Reusable UI components
- utils.ts: Utility functions
- stores: Svelte stores for state management
- services: API service integrations
