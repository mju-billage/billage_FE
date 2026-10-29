import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

type RunOptions = { keepLockedOnSuccess?: boolean };

export function useSubmitLock() {
  const lockedRef = useRef(false);
  const [isLocked, setIsLocked] = useState(false);
  const heldAfterSuccessRef = useRef(false);

  const release = useCallback(() => {
    lockedRef.current = false;
    setIsLocked(false);
    heldAfterSuccessRef.current = false;
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
        } else {
          heldAfterSuccessRef.current = true;
        }
      }
    },
    [release],
  );

  useFocusEffect(
    useCallback(() => {
      if (heldAfterSuccessRef.current) {
        release();
      }
    }, [release]),
  );

  return { isLocked, run, release };
}
