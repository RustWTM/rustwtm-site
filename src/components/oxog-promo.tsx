import { Icon } from "./icons";
export function OxogPromo() {
  return (
    <a
      className="oxog-promo animated-figure"
      href="https://oxog.net"
      aria-label="Explore Oxog — Small studio. Big ideas."
    >
      <div className="oxog-symbol" aria-hidden="true">
        <svg viewBox="0 0 200 130" fill="none" className="oxog-mark">
          <g className="oxog-orbits">
            <ellipse cx="100" cy="65" rx="96" ry="55" />
            <ellipse cx="100" cy="65" rx="82" ry="63" transform="rotate(-18 100 65)" />
          </g>
          <g className="oxog-glyph">
            <path
              className="oxog-pink"
              d="M93 56 72 35C49 13 14 24 9 53 3 84 23 104 46 103"
              strokeWidth="12"
            />
            <path
              className="oxog-pink"
              d="M146 25c24-7 45 10 47 34 3 26-16 46-39 44-14-1-24-11-41-27"
              strokeWidth="12"
            />
            <path
              className="oxog-purple"
              d="M76 18c30-20 75 1 77 40 1 12-1 24-6 33M53 36c-19 41 14 84 50 79 9-1 16-3 22-7"
              strokeWidth="15"
              strokeLinecap="round"
            />
            <path
              className="oxog-pink oxog-slash"
              d="m74 87 54-51"
              strokeWidth="12"
              strokeLinecap="square"
            />
          </g>
          <circle className="oxog-satellite" cx="193" cy="63" r="3" />
        </svg>
      </div>
      <div className="oxog-copy">
        <span className="eyebrow">PART OF A BIGGER PICTURE</span>
        <h2>
          Small studio. <span>Big ideas.</span>
        </h2>
        <p>Explore the tools and infrastructure from Oxog.</p>
      </div>
      <span className="oxog-link">
        Meet oxog.net <Icon name="external" size={18} />
      </span>
    </a>
  );
}
