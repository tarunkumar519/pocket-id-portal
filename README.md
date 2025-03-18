# Pocket ID Portal

A modern, secure user portal for managing Pocket ID authentication applications built with SvelteKit, Tailwind CSS, and OIDC integration.

## Overview

> [!WARNING]
> This project is meant to be an example of how API Keys can be used to build certain things using information from PocketID. There may be certain things (outside of the pocket-id api info) that dont work currently.

The Pocket ID Portal provides a user-friendly interface for accessing and managing applications that use Pocket ID for authentication. It offers a seamless single sign-on experience with secure OIDC authentication flow.

## Features

- **OIDC Authentication**: Secure login via OpenID Connect protocol
- **Application Dashboard**: View and access all authorized applications
- **User Profile**: View and manage your profile information
- **Group Management**: See which groups you belong to
- **Preferences**: Customize the portal experience with theme and landing page settings
- **Responsive Design**: Works well on desktop and mobile devices

## Tech Stack

- **SvelteKit**: Fast, reactive UI framework
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Shadcn-Svelte**: UI component library with dark/light mode support
- **TypeScript**: Static typing for better developer experience
- **OIDC Client**: Integration with OpenID Connect authentication

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or pnpm

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
```

### Project Structure

- routes: SvelteKit routes and pages
- components: Reusable UI components
- utils.ts: Utility functions
- stores: Svelte stores for state management
- services: API service integrations
