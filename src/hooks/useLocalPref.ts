"use client";

import { useCallback, useEffect, useState } from "react";

export function useLocalPref<T extends string>(
  key: string,
  defaultValue: T,
  valid: readonly T[],
): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    const stored = localStorage.getItem(key) as T | null;
    if (stored && valid.includes(stored)) {
      setValue(stored);
    }
  }, [key, valid]);

  const update = useCallback(
    (next: T) => {
      setValue(next);
      localStorage.setItem(key, next);
    },
    [key],
  );

  return [value, update];
}
