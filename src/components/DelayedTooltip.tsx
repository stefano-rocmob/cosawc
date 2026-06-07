"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  content: string;
  enabled: boolean;
  delayMs?: number;
  children: ReactNode;
};

export function DelayedTooltip({
  content,
  enabled,
  delayMs = 2000,
  children,
}: Props) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const onEnter = () => {
    if (!enabled) return;
    clearTimer();
    timerRef.current = setTimeout(() => setVisible(true), delayMs);
  };

  const onLeave = () => {
    clearTimer();
    setVisible(false);
  };

  return (
    <div
      className="delayed-tooltip-wrap"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
    >
      {children}
      {visible && enabled && (
        <span className="delayed-tooltip" role="tooltip">
          {content}
        </span>
      )}
    </div>
  );
}
