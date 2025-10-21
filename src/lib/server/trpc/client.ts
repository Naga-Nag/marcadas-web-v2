import { createTRPCClient, httpBatchLink, TRPCClientError } from '@trpc/client';
import type { AppRouter } from './router';
import superjson from 'superjson';
import { browser } from '$app/environment';

// Global session expired handler
let sessionExpiredHandler: (() => void) | null = null;

export function setSessionExpiredHandler(handler: () => void) {
  sessionExpiredHandler = handler;
}

/**
 * tRPC client instance with global error handling
 */
export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: '/api/trpc',
      transformer: superjson,
      fetch: async (input, init) => {
        try {
          const response = await fetch(input, init);
          
          // Handle authentication errors globally
          if (response.status === 401 && browser) {
            console.log('tRPC Client :: Authentication error detected');
            
            // Don't trigger session expired for login/logout calls
            const url = input.toString();
            if (!url.includes('auth.login') && !url.includes('auth.logout')) {
              if (sessionExpiredHandler) {
                sessionExpiredHandler();
              }
            }
          }
          
          return response;
        } catch (error) {
          console.error('tRPC Client :: Fetch error:', error);
          throw error;
        }
      }
    }),
  ],
});

// Export types for use in components
export type { AppRouter };