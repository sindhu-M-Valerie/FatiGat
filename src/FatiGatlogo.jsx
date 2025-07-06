import React from "react";

export default function FatiGatLogo({ size = 160, color = "#1f2937" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      {/* Clock Circle */}
      <circle cx="70" cy="45" r="32" stroke={color} strokeWidth="4" fill="none" />
      {/* Clock Hands */}
      <line x1="70" y1="45" x2="70" y2="28" stroke={color} strokeWidth="3" />
      <line x1="70" y1="45" x2="55" y2="50" stroke={color} strokeWidth="3" />
      
      {/* Octocat Head */}
      <path
        d="M40 55 
           Q35 45 45 35 
           Q55 25 65 35 
           Q75 45 70 55 
           Q65 65 55 65 
           Q45 65 40 55 Z"
        fill={color}
      />

      {/* Ears */}
      <polygon points="45,35 48,25 52,35" fill={color} />
      <polygon points="63,35 66,25 69,35" fill={color} />

      {/* Face Mask */}
      <ellipse cx="55" cy="50" rx="13" ry="10" fill="#fff" />

      {/* Eyes */}
      <circle cx="49" cy="50" r="2.5" fill={color} />
      <circle cx="60" cy="50" r="2.5" fill={color} />

      {/* Frown */}
      <path
        d="M50 56 Q55 60 60 56"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />

      {/* Sad Eyebrow */}
      <path
        d="M48 46 Q49 43 52 45"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Whiskers */}
      <line x1="40" y1="50" x2="30" y2="50" stroke={color} strokeWidth="2" />
      <line x1="70" y1="50" x2="80" y2="50" stroke={color} strokeWidth="2" />

      {/* Body */}
      <rect x="48" y="65" width="14" height="10" rx="5" fill={color} />
      <path
        d="M50 75 V90
           M55 75 V90
           M60 75 V90"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Tail */}
      <path
        d="M60 70 Q75 80 68 95"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Shadow */}
      <ellipse cx="55" cy="95" rx="20" ry="5" fill="#d1d5db" opacity="0.2" />

      {/* Text */}
      <text x="20" y="115" fontSize="20" fontWeight="bold" fill={color}>
        FatiGat
      </text>
    </svg>
  );
}
