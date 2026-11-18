import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { api } from "../lib/api";

export function useResource(path, initial = null) {
  const initialValue = useRef(initial);

  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(Boolean(path));
  const [error, setError] = useState(null);
  const [revision, setRevision] = useState(0);

  const reload = useCallback(() => {
    setRevision((previous) => previous + 1);
  }, []);

  useEffect(() => {
    if (!path) {
      setData(initialValue.current);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    let active = true;

    const fetchResource = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get(path, {
          signal: controller.signal,
        });

        if (active && !controller.signal.aborted) {
          setData(response.data);
        }
      } catch (requestError) {
        if (
          active &&
          !controller.signal.aborted &&
          requestError.code !== "ERR_CANCELED"
        ) {
          setError(requestError);
        }
      } finally {
        if (active && !controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchResource();

    return () => {
      active = false;
      controller.abort();
    };
  }, [path, revision]);

  return {
    data,
    setData,
    loading,
    error,
    reload,
  };
}

export function useAction() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const locked = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(async (action) => {
    if (locked.current || !mounted.current) {
      return undefined;
    }

    locked.current = true;
    setBusy(true);
    setError(null);

    try {
      return await action();
    } catch (actionError) {
      if (
        mounted.current &&
        actionError.code !== "ERR_CANCELED"
      ) {
        setError(actionError);
      }

      return undefined;
    } finally {
      locked.current = false;

      if (mounted.current) {
        setBusy(false);
      }
    }
  }, []);

  return {
    busy,
    error,
    setError,
    run,
  };
}