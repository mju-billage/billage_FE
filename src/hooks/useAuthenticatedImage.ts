import { useEffect, useState } from 'react';
import { fetchAuthenticatedDataUri } from '../services/apiClient';

export type AuthenticatedImageStatus = 'idle' | 'loading' | 'ready' | 'error';

export type AuthenticatedImageState = {
  uri?: string;
  status: AuthenticatedImageStatus;
};

function isDirectlyUsable(url: string): boolean {
  return (
    url.startsWith('file://') ||
    url.startsWith('content://') ||
    url.startsWith('data:')
  );
}

/**
 * 인증(Authorization 헤더)이 필요한 서버 이미지를 그릴 때 쓰는 공용 훅(QA-042).
 * `file://`·`content://`·`data:` 로 시작하는 url(로컬 미리보기 등)은 fetch 없이
 * 그대로 돌려준다. 그 외엔 `fetchAuthenticatedDataUri` 로 받은 data URI 를 쓴다.
 */
export function useAuthenticatedImage(url?: string | null): AuthenticatedImageState {
  const [state, setState] = useState<AuthenticatedImageState>(() =>
    resolveInitialState(url),
  );

  useEffect(() => {
    if (!url) {
      setState({ uri: undefined, status: 'idle' });
      return;
    }
    if (isDirectlyUsable(url)) {
      setState({ uri: url, status: 'ready' });
      return;
    }

    let alive = true;
    setState({ uri: undefined, status: 'loading' });

    fetchAuthenticatedDataUri(url)
      .then(dataUri => {
        if (alive) {
          setState({ uri: dataUri, status: 'ready' });
        }
      })
      .catch(() => {
        if (alive) {
          setState({ uri: undefined, status: 'error' });
        }
      });

    return () => {
      alive = false;
    };
  }, [url]);

  return state;
}

function resolveInitialState(url?: string | null): AuthenticatedImageState {
  if (!url) {
    return { uri: undefined, status: 'idle' };
  }
  if (isDirectlyUsable(url)) {
    return { uri: url, status: 'ready' };
  }
  return { uri: undefined, status: 'loading' };
}
