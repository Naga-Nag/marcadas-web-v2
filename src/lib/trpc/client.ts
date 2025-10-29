import { createTRPCClient, httpBatchLink, TRPCClientError } from '@trpc/client';
import type { AppRouter } from '$lib/server/trpc/router';
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
        // Ensure credentials are included to send cookies with requests
        const fetchInit = {
          ...init,
          credentials: 'include' as const
        };
        
        // Add a small delay to allow authentication context to be established
        // This helps with timing issues when requests are made immediately after login
        if (browser) {
          // Check if this is not a login/logout request
          const url = input.toString();
          if (!url.includes('usuarios.login') && !url.includes('usuarios.logout')) {
            // Add a small delay to ensure authentication context is ready
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
        
        try {
          const response = await fetch(input, fetchInit);
          
          // Handle authentication errors globally
          if (response.status === 401 && browser) {
            console.log('tRPC Client :: Authentication error detected');
            
            // Don't trigger session expired for login/logout calls
            const url = input.toString();
            if (!url.includes('usuarios.login') && !url.includes('usuarios.logout')) {
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