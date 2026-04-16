import { describe, it, expect, beforeEach } from "vitest";
import { useEditorStore } from "../editor-store";
import { createDefaultPhaseData } from "@/lib/schemas/phase-data";
import type { PhaseData } from "@/types/phases";

beforeEach(() => {
  useEditorStore.getState().reset();
});

describe("useEditorStore", () => {
  it("has correct initial state", () => {
    const state = useEditorStore.getState();

    expect(state.currentPhase).toBe(0);
    expect(state.isPreviewCollapsed).toBe(false);
    expect(state.isReadOnly).toBe(false);
    expect(state.saveStatus).toBe("idle");
    expect(state.lastSavedAt).toBeNull();
    expect(state.phaseData).toBeNull();
  });

  it("setPhase updates currentPhase", () => {
    useEditorStore.getState().setPhase(3);
    expect(useEditorStore.getState().currentPhase).toBe(3);
  });

  it("togglePreview flips isPreviewCollapsed", () => {
    expect(useEditorStore.getState().isPreviewCollapsed).toBe(false);

    useEditorStore.getState().togglePreview();
    expect(useEditorStore.getState().isPreviewCollapsed).toBe(true);

    useEditorStore.getState().togglePreview();
    expect(useEditorStore.getState().isPreviewCollapsed).toBe(false);
  });

  it("setReadOnly updates isReadOnly", () => {
    useEditorStore.getState().setReadOnly(true);
    expect(useEditorStore.getState().isReadOnly).toBe(true);
  });

  it("setSaveStatus updates saveStatus", () => {
    useEditorStore.getState().setSaveStatus("saving");
    expect(useEditorStore.getState().saveStatus).toBe("saving");
  });

  it("updatePhaseData is no-op when phaseData is null", () => {
    expect(useEditorStore.getState().phaseData).toBeNull();

    useEditorStore.getState().updatePhaseData((prev) => ({
      ...prev,
      overview: { ...prev.overview, projectName: "Changed" },
    }));

    expect(useEditorStore.getState().phaseData).toBeNull();
  });

  it("updatePhaseData applies updater when phaseData exists", () => {
    const initial = createDefaultPhaseData() as unknown as PhaseData;
    useEditorStore.getState().setPhaseData(initial);

    useEditorStore.getState().updatePhaseData((prev) => ({
      ...prev,
      overview: { ...prev.overview, projectName: "Updated" },
    }));

    expect(useEditorStore.getState().phaseData!.overview.projectName).toBe("Updated");
  });

  it("reset restores initial state", () => {
    useEditorStore.getState().setPhase(5);
    useEditorStore.getState().setReadOnly(true);
    useEditorStore.getState().setSaveStatus("error");

    useEditorStore.getState().reset();

    const state = useEditorStore.getState();
    expect(state.currentPhase).toBe(0);
    expect(state.isReadOnly).toBe(false);
    expect(state.saveStatus).toBe("idle");
    expect(state.phaseData).toBeNull();
  });

  it("invariant: reset produces same state as initial", () => {
    useEditorStore.getState().setPhase(4);
    useEditorStore.getState().togglePreview();
    useEditorStore.getState().reset();

    const state = useEditorStore.getState();
    expect(state.currentPhase).toBe(0);
    expect(state.isPreviewCollapsed).toBe(false);
    expect(state.isReadOnly).toBe(false);
    expect(state.saveStatus).toBe("idle");
    expect(state.lastSavedAt).toBeNull();
    expect(state.phaseData).toBeNull();
  });
});
