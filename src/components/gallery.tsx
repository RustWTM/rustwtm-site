"use client";
import { useRef, useState } from "react";
import { gallery } from "@/data/gallery";
import { Icon } from "./icons";
import { ScreenshotLightbox } from "./lightbox";
export function Gallery() {
  const [active, setActive] = useState(0);
  const tabs = useRef<HTMLDivElement>(null);
  const item = gallery[active];
  function key(event: React.KeyboardEvent, index: number) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % gallery.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + gallery.length) % gallery.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = gallery.length - 1;
    else return;
    event.preventDefault();
    setActive(next);
    tabs.current?.querySelectorAll<HTMLButtonElement>("button")[next]?.focus();
  }
  return (
    <div className="gallery">
      <div className="gallery-tabs" ref={tabs} role="tablist" aria-label="Explore RustWTM screens">
        {gallery.map((screen, i) => (
          <button
            key={screen.id}
            role="tab"
            id={`tab-${screen.id}`}
            aria-controls="screen-panel"
            aria-selected={i === active}
            tabIndex={i === active ? 0 : -1}
            onKeyDown={(event) => key(event, i)}
            onClick={() => setActive(i)}
          >
            <span className={`resource-dot ${screen.color}`} />
            {screen.label}
          </button>
        ))}
      </div>
      <p className="gallery-hint">
        Swipe to explore every view <Icon name="arrow" size={13} />
      </p>
      <div id="screen-panel" role="tabpanel" aria-labelledby={`tab-${item.id}`} tabIndex={0}>
        <div className="gallery-media" key={item.id}>
          <ScreenshotLightbox
            src={`/screenshots/${item.id}.webp`}
            alt={`RustWTM ${item.label} workspace with example data`}
            priority={false}
          />
        </div>
        <div className="gallery-caption">
          <div>
            <span className="eyebrow">{String(active + 1).padStart(2, "0")} / THE WORKSPACE</span>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
          <span className="gallery-source">
            <Icon name="monitor" size={15} />
            Actual application captures
            <br />
            v0.27.1 UI · Example data
          </span>
        </div>
      </div>
    </div>
  );
}
