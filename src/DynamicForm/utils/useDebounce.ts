import { useRef, useState, useEffect } from "react";

interface UseDebounceReturn {
  loading: boolean;
  trigger: <T>(fn: () => Promise<T> | T, delayMs?: number) => void;
}

export function useDebounce(): UseDebounceReturn {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const trigger = <T>(fn: () => Promise<T> | T, delayMs = 500) => {
    if (timer.current) clearTimeout(timer.current);
    setLoading(true);
    timer.current = setTimeout(async () => {
      await fn();
      setLoading(false);
    }, delayMs);
  };

  return { loading, trigger };
}
