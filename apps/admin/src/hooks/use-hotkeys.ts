import { useEffect, useRef } from 'react';

type HotkeyCallback = (event: KeyboardEvent) => void;

/**
 * A simple hook to listen for keyboard shortcuts.
 * @param key The key to listen for (e.g., '+', 'f', 'Escape')
 * @param callback The function to call when the key is pressed
 * @param options Configuration options
 */
export function useHotkeys(
  key: string,
  callback: HotkeyCallback,
  options: { enabled?: boolean; preventDefault?: boolean } = { enabled: true, preventDefault: true }
) {
  const callbackRef = useRef<HotkeyCallback>(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!options.enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger if user is typing in an input, textarea, or contentEditable element
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (event.key === key) {
        if (options.preventDefault) {
          event.preventDefault();
        }
        callbackRef.current(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [key, options.enabled, options.preventDefault]);
}
