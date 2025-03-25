// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    interface Locals {
      user?: any;
      tokens?: any;
      userId?: string;
      isAuthenticated: boolean;
    }

    // interface PageData {}
    // interface Error {}
    // interface Platform {}
  }
}

export {};
