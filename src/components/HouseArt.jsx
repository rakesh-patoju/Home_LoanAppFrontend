export default function HouseArt({ className = "" }) {
  return (
    <svg
      className={`house-art ${className}`}
      viewBox="0 0 560 430"
      fill="none"
      role="img"
      aria-label="Illustration of a welcoming modern home"
    >
      <defs>
        <linearGradient
          id="wall"
          x1="240"
          y1="100"
          x2="470"
          y2="380"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#f8f2de" />
          <stop offset="1" stopColor="#d9d5bf" />
        </linearGradient>
        <linearGradient id="roof" x1="98" y1="124" x2="470" y2="260">
          <stop stopColor="#e5aa88" />
          <stop offset="1" stopColor="#b9775f" />
        </linearGradient>
      </defs>
      <circle cx="310" cy="200" r="180" fill="currentColor" opacity=".08" />
      <circle cx="430" cy="92" r="33" fill="#e6b783" />
      <path
        d="M35 350c125-58 319-50 494 0l-34 38H78z"
        fill="#2e6c5c"
        opacity=".2"
      />
      <path d="m124 208 147-98 188 88v155l-161 35-174-54z" fill="url(#wall)" />
      <path d="m298 204 161-6v155l-161 35z" fill="#c9cbb7" />
      <path d="m99 209 174-121 216 103-192 35z" fill="url(#roof)" />
      <path d="m99 209 198 17v15l-198-17z" fill="#8a5444" />
      <path d="m297 226 192-35v15l-192 35z" fill="#a46551" />
      <path d="m164 253 57 11v68l-57-15z" fill="#386e68" />
      <path d="m164 253 57 11v12l-57-11z" fill="#1b514b" />
      <path d="m181 257 1 64m-18-34 57 13" stroke="#dfdec9" strokeWidth="4" />
      <path d="m247 271 35 6v96l-35-11z" fill="#9d6e55" />
      <circle cx="272" cy="321" r="2.5" fill="#f8e7ad" />
      <path d="m323 255 98-17v60l-98 22z" fill="#386e68" />
      <path d="m371 247 1 62m-49-26 98-21" stroke="#dfdec9" strokeWidth="4" />
      <path d="m234 367 51 12-54 31-73-20z" fill="#dbd6bf" />
      <path
        d="M104 330v-94m0 35-20-18m20 45 24-23"
        stroke="#756b4e"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <ellipse cx="102" cy="219" rx="37" ry="58" fill="#6e9270" />
      <ellipse cx="86" cy="249" rx="28" ry="35" fill="#5c8467" />
      <path d="M472 353v-81" stroke="#756b4e" strokeWidth="6" />
      <ellipse cx="472" cy="258" rx="29" ry="48" fill="#729574" />
      <path
        d="M133 350c5-34 23-27 28 6m-39-3c-10-27-26-22-25-5m333 11c9-25 20-24 26-6"
        stroke="#386f58"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path d="M161 130h33m-16-16v32" stroke="#aec5af" strokeWidth="2" />
      <circle cx="73" cy="149" r="5" stroke="#aec5af" strokeWidth="2" />
    </svg>
  );
}
