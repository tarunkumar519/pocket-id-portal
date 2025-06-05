# Pocket ID Portal

> [!WARNING]
> This project is meant to be an example of how API Keys can be used to build certain things using information from PocketID.

## Overview

The Pocket ID Portal provides a user-friendly interface for accessing and managing applications that use Pocket ID for authentication. It offers a seamless single sign-on experience with secure OIDC authentication flow.

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

### Callback URL

The callback url to use for Pocket ID is `/callback`
