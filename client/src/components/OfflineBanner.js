import React, { useEffect, useRef, useState } from 'react';
import { Alert } from '@mui/material';
import { subscribeCacheFallback, useOnline } from '../utils/offline';

const OfflineBanner = () => {
  const online = useOnline();
  const wasOnline = useRef(online);
  const [cacheNotice, setCacheNotice] = useState(null);
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(
    () =>
      subscribeCacheFallback((detail) => {
        if (detail?.clear) {
          setCacheNotice(null);
          return;
        }
        setCacheNotice(detail);
      }),
    []
  );

  useEffect(() => {
    if (!wasOnline.current && online) {
      setCacheNotice(null);
      setJustReconnected(true);
      const timer = window.setTimeout(() => setJustReconnected(false), 3000);
      wasOnline.current = true;
      return () => window.clearTimeout(timer);
    }

    wasOnline.current = online;
    if (!online) setJustReconnected(false);
    return undefined;
  }, [online]);

  if (!online) {
    return (
      <Alert severity="warning" variant="filled" sx={{ borderRadius: 0 }}>
        You're offline. Topics you already opened on this device are still available. Adding,
        editing, and deleting need a connection.
      </Alert>
    );
  }

  if (cacheNotice && !cacheNotice.clear) {
    return (
      <Alert severity="warning" variant="filled" sx={{ borderRadius: 0 }}>
        {cacheNotice.stale
          ? 'The server did not respond. Showing a saved copy from more than a day ago.'
          : 'The server did not respond. Showing the saved copy from this device.'}
      </Alert>
    );
  }

  if (justReconnected) {
    return (
      <Alert severity="success" variant="filled" sx={{ borderRadius: 0 }}>
        Back online.
      </Alert>
    );
  }

  return null;
};

export default OfflineBanner;
