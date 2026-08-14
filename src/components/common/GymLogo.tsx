'use client';
import React from 'react';

interface GymLogoProps {
  className?: string;
  size?: number;
  /** Show the full logo with text, or just the icon mark */
  variant?: 'icon' | 'full';
}

/**
 * ग्रामोदय यूथ मंच (GYM) — Gramodaya Youth Manch
 * A clean, scalable SVG logo that works at any size.
 *
 * Icon variant: circular mark with sun + sprout + people silhouette
 * Full variant: mark + org name text
 */
export const GymLogo: React.FC<GymLogoProps> = ({
  className = 'w-10 h-10',
  size = 120,
  variant = 'icon',
}) => {
  if (variant === 'full') {
    return (
      <svg
        viewBox="0 0 400 120"
        className={className}
        width={size * 3.3}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="ग्रामोदय यूथ मंच"
      >
        {/* Icon mark */}
        <g transform="translate(10,10) scale(0.83)">
          <LogoMark />
        </g>

        {/* Text block */}
        <text x="130" y="42" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="28" fill="#1E3A2F" letterSpacing="-0.5">
          ग्रामोदय यूथ मंच
        </text>
        <text x="130" y="64" fontFamily="system-ui, sans-serif" fontWeight="700" fontSize="13" fill="#64748B" letterSpacing="2">
          GRAMODAYA YOUTH MANCH
        </text>
        <text x="130" y="84" fontFamily="system-ui, sans-serif" fontWeight="600" fontSize="11" fill="#D97706" letterSpacing="0.5">
          युवा शक्ति से ग्रामोदय की ओर
        </text>
      </svg>
    );
  }

  // Icon-only variant — clean circular mark
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="ग्रामोदय यूथ मंच"
    >
      <LogoMark />
    </svg>
  );
};

/** Reusable inner mark rendered at 120×120 viewBox */
const LogoMark: React.FC = () => (
  <g>
    {/* Background circle */}
    <circle cx="60" cy="60" r="58" fill="#1E3A2F" />
    <circle cx="60" cy="60" r="54" fill="#213D2F" stroke="#2D5545" strokeWidth="1" />

    {/* Rising sun — half-circle at horizon */}
    <clipPath id="gym-sun-clip">
      <rect x="0" y="0" width="120" height="68" />
    </clipPath>
    <g clipPath="url(#gym-sun-clip)">
      <circle cx="60" cy="68" r="22" fill="#F59E0B" opacity="0.9" />
    </g>

    {/* Sun rays */}
    <g stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" opacity="0.7">
      <line x1="60" y1="40" x2="60" y2="32" />
      <line x1="44" y1="46" x2="38" y2="40" />
      <line x1="76" y1="46" x2="82" y2="40" />
      <line x1="35" y1="58" x2="28" y2="56" />
      <line x1="85" y1="58" x2="92" y2="56" />
    </g>

    {/* Green hill / horizon */}
    <path d="M 10 72 Q 35 58 60 68 Q 85 58 110 72 L 110 90 Q 60 80 10 90 Z" fill="#16A34A" opacity="0.85" />

    {/* Sprout / leaf */}
    <path d="M 60 55 C 55 45 45 42 42 48 C 40 52 48 56 60 55 Z" fill="#22C55E" />
    <path d="M 60 55 C 65 45 75 42 78 48 C 80 52 72 56 60 55 Z" fill="#15803D" />
    <line x1="60" y1="55" x2="60" y2="68" stroke="#15803D" strokeWidth="2" />

    {/* Three people silhouettes — simple, clean */}
    {/* Center person (taller) */}
    <circle cx="60" cy="80" r="4.5" fill="#FFFFFF" />
    <path d="M 54 86 Q 60 83 66 86 L 65 96 L 55 96 Z" fill="#FFFFFF" />

    {/* Left person */}
    <circle cx="44" cy="83" r="3.5" fill="#F59E0B" />
    <path d="M 39.5 88 Q 44 85.5 48.5 88 L 48 96 L 40 96 Z" fill="#F59E0B" />

    {/* Right person */}
    <circle cx="76" cy="83" r="3.5" fill="#22C55E" />
    <path d="M 71.5 88 Q 76 85.5 80.5 88 L 80 96 L 72 96 Z" fill="#22C55E" />

    {/* Bottom text — GYM acronym */}
    <text
      x="60"
      y="112"
      textAnchor="middle"
      fontFamily="system-ui, sans-serif"
      fontWeight="900"
      fontSize="14"
      fill="#FFFFFF"
      letterSpacing="3"
    >
      GYM
    </text>
  </g>
);
