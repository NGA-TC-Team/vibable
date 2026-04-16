"use client";

import { useEffect, useRef } from "react";
import { useUpdateProject } from "@/hooks/use-project.hook";
import { useEditorStore } from "@/services/store/editor-store";
import type { PhaseData } from "@/types/phases";
import {
  AUTOSAVE_DEBOUNCE_MS,
  AUTOSAVE_RETRY_DELAY_MS,
  AUTOSAVE_MAX_RETRIES,
} from "@/lib/constants";

interface UseAutoSaveOptions {
  projectId: string;
  enabled?: boolean;
}

export function useAutoSave({ projectId, enabled = true }: UseAutoSaveOptions) {
  const updateProject = useUpdateProject();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);
  const pendingDataRef = useRef<PhaseData | null>(null);
  const isSavingRef = useRef(false);

  const doSave = async (data: PhaseData) => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;

    const { setSaveStatus, setLastSavedAt } = useEditorStore.getState();
    setSaveStatus("saving");

    try {
      await updateProject.mutateAsync({ id: projectId, phases: data as never });
      setSaveStatus("saved");
      setLastSavedAt(Date.now());
      retryCountRef.current = 0;
      pendingDataRef.current = null;
    } catch {
      if (retryCountRef.current < AUTOSAVE_MAX_RETRIES) {
        retryCountRef.current++;
        setSaveStatus("error");
        setTimeout(() => {
          isSavingRef.current = false;
          if (pendingDataRef.current) doSave(pendingDataRef.current);
        }, AUTOSAVE_RETRY_DELAY_MS);
        return;
      }
      setSaveStatus("error");
      pendingDataRef.current = null;
    } finally {
      isSavingRef.current = false;
    }
  };

  const scheduleSave = (data: PhaseData) => {
    if (!enabled) return;
    pendingDataRef.current = data;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (pendingDataRef.current) doSave(pendingDataRef.current);
    }, AUTOSAVE_DEBOUNCE_MS);
  };

  const flushNow = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const data = pendingDataRef.current ?? useEditorStore.getState().phaseData;
    if (data) doSave(data);
  };

  useEffect(() => {
    if (!enabled) return;

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") flushNow();
    };
    const handleBeforeUnload = () => flushNow();

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, projectId]);

  useEffect(() => {
    const unsub = useEditorStore.subscribe((state, prev) => {
      if (!enabled) return;
      if (state.phaseData && state.phaseData !== prev.phaseData) {
        scheduleSave(state.phaseData);
      }
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, projectId]);

  return { flushNow };
}
