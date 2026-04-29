"use client";

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useLoading } from '@/lib/providers/LoadingProvider';

export const NavigationHandler = () => {
  const { startLoading, stopLoading } = useLoading();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Intercept all link clicks
    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const anchor = target.closest('a');

      if (!anchor) return;

      const href = anchor.getAttribute('href');
      const targetAttr = anchor.getAttribute('target');

      // Only handle internal links that are not opening in a new tab
      if (
        href && 
        href.startsWith('/') && 
        (!targetAttr || targetAttr === '_self') &&
        !event.metaKey && 
        !event.ctrlKey
      ) {
        // Resolve the full URL to compare with current pathname
        const url = new URL(href, window.location.origin);
        
        // Don't trigger if it's the same page (ignoring hash)
        if (url.pathname === window.location.pathname) return;
        
        // Synchronous start is fine for user-initiated clicks
        startLoading();
      }
    };

    // Also intercept programmatic navigation via history API
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function(...args) {
      const newUrl = args[2];
      if (newUrl) {
        const url = new URL(String(newUrl), window.location.origin);
        if (url.pathname !== window.location.pathname) {
          // Defer to avoid React state update issues during internal router logic
          setTimeout(() => startLoading(), 0);
        }
      }
      return originalPushState.apply(this, args);
    };

    window.history.replaceState = function(...args) {
      const newUrl = args[2];
      if (newUrl) {
        const url = new URL(String(newUrl), window.location.origin);
        if (url.pathname !== window.location.pathname) {
          setTimeout(() => startLoading(), 0);
        }
      }
      return originalReplaceState.apply(this, args);
    };

    document.addEventListener('click', handleAnchorClick);
    return () => {
      document.removeEventListener('click', handleAnchorClick);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, [pathname, startLoading]);

  // Handle the end of navigation
  useEffect(() => {
    // We add a tiny delay to stopLoading to ensure it runs AFTER 
    // any deferred startLoading calls from the history monkey-patch.
    const timer = setTimeout(() => {
      stopLoading();
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname, searchParams, stopLoading]);

  return null;
};
