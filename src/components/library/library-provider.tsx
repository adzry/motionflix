"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Video } from "@/types/video";
import { HoverPreview, type PreviewState } from "./hover-preview";
import { TitleModal } from "./title-modal";
import { Toast } from "./toast";

/**
 * Client-side UI state shared by every card, row and hero:
 * - the Netflix-style hover preview (one at a time, rendered in a portal),
 * - the "More info" details modal,
 * - short toasts explaining features that aren't built yet.
 */
interface LibraryUI {
  videos: Video[];
  isNew: (id: string) => boolean;
  openDetails: (video: Video) => void;
  notify: (message: string) => void;
  schedulePreview: (video: Video, anchor: HTMLElement, progress?: number) => void;
  leaveCard: () => void;
}

const LibraryContext = createContext<LibraryUI | null>(null);

export function useLibraryUI() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibraryUI must be used inside <LibraryProvider>");
  return ctx;
}

const PREVIEW_DELAY_MS = 450;
const HIDE_DELAY_MS = 120;
/** How many of the newest titles get a "New" badge. */
const NEW_COUNT = 6;

export function LibraryProvider({
  videos,
  children,
}: {
  videos: Video[];
  children: ReactNode;
}) {
  const [details, setDetails] = useState<Video | null>(null);
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const showTimer = useRef<number | undefined>(undefined);
  const hideTimer = useRef<number | undefined>(undefined);

  const newIds = useMemo(() => {
    const sorted = [...videos].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return new Set(sorted.slice(0, NEW_COUNT).map((v) => v.id));
  }, [videos]);

  const clearTimers = () => {
    window.clearTimeout(showTimer.current);
    window.clearTimeout(hideTimer.current);
  };

  const hidePreview = useCallback(() => {
    clearTimers();
    setPreview(null);
  }, []);

  const schedulePreview = useCallback(
    (video: Video, anchor: HTMLElement, progress?: number) => {
      // Hover previews only make sense with a real mouse on a wide screen.
      if (!window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 768px)").matches) {
        return;
      }
      clearTimers();
      showTimer.current = window.setTimeout(() => {
        setPreview({ video, rect: anchor.getBoundingClientRect(), progress });
      }, PREVIEW_DELAY_MS);
    },
    [],
  );

  const leaveCard = useCallback(() => {
    window.clearTimeout(showTimer.current);
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setPreview(null), HIDE_DELAY_MS);
  }, []);

  // Any scroll (page or row) or resize invalidates the preview position.
  useEffect(() => {
    if (!preview) return;
    window.addEventListener("scroll", hidePreview, { capture: true, passive: true });
    window.addEventListener("resize", hidePreview);
    window.addEventListener("blur", hidePreview);
    return () => {
      window.removeEventListener("scroll", hidePreview, { capture: true });
      window.removeEventListener("resize", hidePreview);
      window.removeEventListener("blur", hidePreview);
    };
  }, [preview, hidePreview]);

  useEffect(() => () => clearTimers(), []);

  const openDetails = useCallback(
    (video: Video) => {
      hidePreview();
      setDetails(video);
    },
    [hidePreview],
  );

  const notify = useCallback((message: string) => {
    setToast({ id: Date.now(), message });
  }, []);

  const clearToast = useCallback(() => setToast(null), []);
  const closeDetails = useCallback(() => setDetails(null), []);

  const value = useMemo<LibraryUI>(
    () => ({
      videos,
      isNew: (id) => newIds.has(id),
      openDetails,
      notify,
      schedulePreview,
      leaveCard,
    }),
    [videos, newIds, openDetails, notify, schedulePreview, leaveCard],
  );

  return (
    <LibraryContext.Provider value={value}>
      {children}
      {preview && (
        <HoverPreview
          key={preview.video.id}
          state={preview}
          onPointerEnter={() => window.clearTimeout(hideTimer.current)}
          onPointerLeave={hidePreview}
        />
      )}
      <TitleModal video={details} onClose={closeDetails} onSelect={setDetails} />
      {toast && <Toast key={toast.id} message={toast.message} onDone={clearToast} />}
    </LibraryContext.Provider>
  );
}
