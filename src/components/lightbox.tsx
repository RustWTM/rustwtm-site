"use client";
import { useRef } from "react";
import { Icon } from "./icons";
export function ScreenshotLightbox({
  src,
  alt,
  priority = false,
  width = 1440,
  height = 1000,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  width?: number;
  height?: number;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button
        ref={trigger}
        className="screenshot-button"
        onClick={() => dialog.current?.showModal()}
        aria-label={`Enlarge ${alt}`}
      >
        <img
          src={src}
          width={width}
          height={height}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
        />
        <span className="screenshot-enlarge">
          <Icon name="expand" size={16} />
          <span>Explore full size</span>
        </span>
      </button>
      <dialog
        className="lightbox"
        ref={dialog}
        onClose={() => trigger.current?.focus()}
        onClick={(event) => {
          if (event.target === dialog.current) dialog.current?.close();
        }}
        aria-label={alt}
      >
        <div className="lightbox-toolbar">
          <span>{alt}</span>
          <button
            className="icon-button"
            aria-label="Close screenshot"
            onClick={() => dialog.current?.close()}
            autoFocus
          >
            <Icon name="close" />
          </button>
        </div>
        <div
          className="lightbox-image"
          tabIndex={0}
          role="region"
          aria-label="Full-size screenshot. Scroll to inspect."
        >
          <img src={src} width="1440" height="1000" alt={alt} />
        </div>
        <p>Actual RustWTM capture · Illustrative sample data · Scroll to inspect · Esc to close</p>
      </dialog>
    </>
  );
}
