import { useCallback, useState } from "react";

export function useNotifications(timeoutMs = 3000) {
  const [notification, setNotification] = useState(null);

  const notify = useCallback((type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), timeoutMs);
  }, [timeoutMs]);

  return { notification, notify };
}
