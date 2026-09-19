import { useCallback, useEffect, useState, type RefObject } from "react";

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
  webkitExitFullscreen?: () => Promise<void> | void;
};

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
  webkitFullscreenEnabled?: boolean;
};

function getFullscreenElement(): Element | null {
  const doc = document as FullscreenDocument;
  return doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

function isFullscreenSupported(): boolean {
  const doc = document as FullscreenDocument;
  return Boolean(
    doc.fullscreenEnabled ||
      doc.webkitFullscreenEnabled ||
      document.documentElement.requestFullscreen ||
      (document.documentElement as FullscreenElement).webkitRequestFullscreen,
  );
}

async function requestFullscreen(element: HTMLElement): Promise<void> {
  const el = element as FullscreenElement;
  if (el.requestFullscreen) {
    await el.requestFullscreen();
    return;
  }
  if (el.webkitRequestFullscreen) {
    await el.webkitRequestFullscreen();
  }
}

async function exitFullscreen(): Promise<void> {
  const doc = document as FullscreenDocument;
  if (doc.exitFullscreen && getFullscreenElement()) {
    await doc.exitFullscreen();
    return;
  }
  if (doc.webkitExitFullscreen && getFullscreenElement()) {
    await doc.webkitExitFullscreen();
  }
}

export function useFullscreen(targetRef: RefObject<HTMLElement | null>) {
  const [active, setActive] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setSupported(isFullscreenSupported());
    const sync = () => setActive(Boolean(getFullscreenElement()));
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
    };
  }, []);

  const toggle = useCallback(async () => {
    if (!isFullscreenSupported()) {
      setSupported(false);
      return;
    }
    try {
      if (getFullscreenElement()) {
        await exitFullscreen();
      } else {
        const target = targetRef.current ?? document.documentElement;
        await requestFullscreen(target);
      }
    } catch {
      setActive(Boolean(getFullscreenElement()));
    }
  }, [targetRef]);

  return { active, supported, toggle };
}
