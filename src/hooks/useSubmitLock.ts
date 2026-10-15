import { useCallback, useRef, useState } from 'react';

type RunOptions = { keepLockedOnSuccess?: boolean };

export function useSubmitLock() {
  const lockedRef = useRef(false);
  const [isLocked, setIsLocked] = useState(false);

  const release = useCallback(() => {
    lockedRef.current = false;
    setIsLocked(false);
  }, []);

  const run = useCallback(
    async (task: () => Promise<boolean>, options: RunOptions = {}) => {
      if (lockedRef.current) {
        return;
      }
      lockedRef.current = true;
      setIsLocked(true);
      let succeeded = false;
      try {
        succeeded = await task();
      } finally {
        if (!succeeded || !options.keepLockedOnSuccess) {
          release();
        }
      }
    },
    [release],
  );

  return { isLocked, run, release };
}
