import { trpc } from '$lib/trpc/client';
import { browser } from '$app/environment';
import { onDestroy } from 'svelte';
import { getContext, setContext } from 'svelte';
import type { QueryClient } from '@tanstack/svelte-query';
import { TRPCClientError } from '@trpc/client';
import { createTRPCQueryStore } from '@trpc/svelte-query';

// Create a context key for the TRPC query store
const TRPC_QUERY_STORE_KEY = Symbol('trpc-query-store');

/**
 * Provides TRPC query store to child components
 */
export function provideTRPCQueryStore() {
  const store = createTRPCQueryStore();
  setContext(TRPC_QUERY_STORE_KEY, store);
  return store;
}

/**
 * Gets the TRPC query store from context
 */
export function useTRPCQueryStore(): QueryClient {
  return getContext<QueryClient>(TRPC_QUERY_STORE_KEY);
}

/**
 * Hook for using tRPC queries in Svelte components
 */
export function useQuery<TInput, TOutput>(
  path: string[],
  input: TInput,
  options?: {
    enabled?: boolean;
    refetchOnWindowFocus?: boolean;
    staleTime?: number;
    cacheTime?: number;
  }
) {
  const [data, setData] = $state<TOutput | null>(null);
  const [error, setError] = $state<TRPCClientError<any> | null>(null);
  const [isLoading, setIsLoading] = $state<boolean>(true);
  const [isRefetching, setIsRefetching] = $state<boolean>(false);

  let queryPromise: Promise<any> | null = null;

  const refetch = async () => {
    if (!browser) return;
    
    setIsRefetching(true);
    setError(null);
    
    try {
      const result = await trpc[path[0]][path[1]].query(input);
      setData(result);
    } catch (err) {
      setError(err as TRPCClientError<any>);
    } finally {
      setIsRefetching(false);
    }
  };

  const executeQuery = async () => {
    if (!browser || options?.enabled === false) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await trpc[path[0]][path[1]].query(input);
      setData(result);
    } catch (err) {
      setError(err as TRPCClientError<any>);
    } finally {
      setIsLoading(false);
    }
  };

  // Execute the query when component mounts
  if (browser) {
    executeQuery();
  }

  // Cleanup function
 onDestroy(() => {
    // Cancel any ongoing requests
    queryPromise = null;
  });

  return {
    data,
    error,
    isLoading,
    isRefetching,
    refetch,
    executeQuery
  };
}

/**
 * Hook for using tRPC mutations in Svelte components
 */
export function useMutation<TInput, TOutput>(
  path: string[],
  options?: {
    onSuccess?: (data: TOutput) => void;
    onError?: (error: TRPCClientError<any>) => void;
  }
) {
  const [data, setData] = $state<TOutput | null>(null);
  const [error, setError] = $state<TRPCClientError<any> | null>(null);
  const [isLoading, setIsLoading] = $state<boolean>(false);
  const [isSuccess, setIsSuccess] = $state<boolean>(false);

  const mutate = async (input: TInput) => {
    if (!browser) return;

    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      const result = await trpc[path[0]][path[1]].mutate(input);
      setData(result);
      setIsSuccess(true);
      
      if (options?.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const trpcError = err as TRPCClientError<any>;
      setError(trpcError);
      
      if (options?.onError) {
        options.onError(trpcError);
      }
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data,
    error,
    isLoading,
    isSuccess,
    mutate
  };
}

/**
 * Hook for using tRPC subscriptions in Svelte components
 */
export function useSubscription<TInput, TOutput>(
  path: string[],
  input: TInput,
  options?: {
    onData?: (data: TOutput) => void;
    onError?: (error: TRPCClientError<any>) => void;
  }
) {
  const [data, setData] = $state<TOutput | null>(null);
  const [error, setError] = $state<TRPCClientError<any> | null>(null);
  const [isConnected, setIsConnected] = $state<boolean>(false);

  let subscription: any = null;

  const subscribe = () => {
    if (!browser) return;

    try {
      subscription = trpc[path[0]][path[1]].subscribe(input, {
        onData: (data: TOutput) => {
          setData(data);
          if (options?.onData) {
            options.onData(data);
          }
        },
        onError: (error: TRPCClientError<any>) => {
          setError(error);
          if (options?.onError) {
            options.onError(error);
          }
        },
        onStarted: () => {
          setIsConnected(true);
        }
      });
    } catch (err) {
      setError(err as TRPCClientError<any>);
    }
  };

  const unsubscribe = () => {
    if (subscription) {
      subscription.unsubscribe();
      setIsConnected(false);
    }
  };

  // Cleanup function
  onDestroy(unsubscribe);

  return {
    data,
    error,
    isConnected,
    subscribe,
    unsubscribe
  };
}