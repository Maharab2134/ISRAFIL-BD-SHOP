import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Universal Scroll Restoration Manager for Israfil BD Shop
 * - Restores exact scroll position on POP (browser back/forward or navigate(-1))
 * - Scrolls to top on PUSH (new page navigation)
 * - Actively watches DOM mutations to restore scroll as soon as async data renders
 */
export const ScrollRestorationManager = () => {
  const location = useLocation();
  const navigationType = useNavigationType(); // 'POP' | 'PUSH' | 'REPLACE'
  const isPop = navigationType === 'POP';
  const observerRef = useRef(null);
  const intervalRef = useRef(null);

  // Continuously record scroll position of the active page in sessionStorage
  useEffect(() => {
    const getStorageKey = () => `israfil_scroll_${location.pathname}${location.search}`;

    const saveScroll = () => {
      try {
        sessionStorage.setItem(getStorageKey(), String(Math.round(window.scrollY)));
      } catch (e) {
        // Ignore quota errors if storage is restricted
      }
    };

    // Throttle scroll events for peak performance
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          saveScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      saveScroll(); // Save final scroll position before unmount/route change
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location.pathname, location.search]);

  // Handle route navigation scroll behavior
  useEffect(() => {
    // Clear any pending scroll observers/intervals from previous navigation
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const currentKey = `israfil_scroll_${location.pathname}${location.search}`;

    if (isPop) {
      // Navigating backwards or forwards: restore previous scroll position
      let savedY = 0;
      try {
        savedY = Number(sessionStorage.getItem(currentKey) || 0);
      } catch (e) {
        savedY = 0;
      }

      if (savedY > 0) {
        // Attempt immediate restore
        window.scrollTo({ top: savedY, behavior: 'instant' });

        let attempts = 0;
        const maxAttempts = 60; // Check for up to ~2.4 seconds for heavy lists

        const tryScroll = () => {
          attempts++;
          const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
          
          if (maxScroll >= savedY || attempts >= maxAttempts) {
            window.scrollTo({ top: savedY, behavior: 'instant' });
            if (observerRef.current) {
              observerRef.current.disconnect();
              observerRef.current = null;
            }
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            return true;
          }
          return false;
        };

        if (!tryScroll()) {
          // If page height hasn't expanded yet (e.g. data still loading from API),
          // observe DOM mutations and check periodically
          const observer = new MutationObserver(() => {
            tryScroll();
          });

          observer.observe(document.body, {
            childList: true,
            subtree: true,
          });
          observerRef.current = observer;

          intervalRef.current = setInterval(() => {
            tryScroll();
          }, 40);
        }
      }
    } else if (navigationType === 'PUSH') {
      // Fresh navigation: reset scroll to top of page
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [location.pathname, location.search, navigationType, isPop]);

  return null;
};

export default ScrollRestorationManager;
