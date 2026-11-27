import { useCallback, useEffect, useRef, useState } from 'react';

export type AsyncStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface AsyncResource<T> {
  status: AsyncStatus;
  /** Último dado carregado (continua visível enquanto recarrega). */
  data: T | null;
  error: unknown;
  refresh: () => void;
  /** Atualização otimista do dado atual (ex.: curtir). */
  mutate: (updater: (data: T) => T) => void;
}

interface Result<T> {
  key: string;
  data: T | null;
  error: unknown;
}

/**
 * Carrega um recurso do servidor. `key` identifica a consulta (muda = recarrega);
 * `enabled = false` não busca nada (ex.: Free sem acesso ao feed).
 */
export function useAsync<T>(fetcher: () => Promise<T>, key: string, enabled = true): AsyncResource<T> {
  const [nonce, setNonce] = useState(0);
  const [result, setResult] = useState<Result<T> | null>(null);
  const fetcherRef = useRef(fetcher);
  const requestKey = `${key}#${nonce}`;

  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    fetcherRef.current().then(
      (data) => {
        if (active) setResult({ key: requestKey, data, error: null });
      },
      (error: unknown) => {
        if (active) setResult((prev) => ({ key: requestKey, data: prev?.data ?? null, error }));
      },
    );
    return () => {
      active = false;
    };
  }, [requestKey, enabled]);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);
  const mutate = useCallback((updater: (data: T) => T) => {
    setResult((prev) => (prev && prev.data !== null ? { ...prev, data: updater(prev.data) } : prev));
  }, []);

  const settled = result?.key === requestKey;
  const status: AsyncStatus = !enabled ? 'idle' : settled ? (result.error ? 'error' : 'ready') : 'loading';
  return { status, data: enabled ? (result?.data ?? null) : null, error: settled ? result.error : null, refresh, mutate };
}
