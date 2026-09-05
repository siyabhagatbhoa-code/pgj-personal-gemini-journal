import React from 'react';

interface GeminiLogoProps {
  size?: number;
  className?: string;
  variant?: 'gradient' | 'purple' | 'white';
  animated?: boolean;
}

export const GeminiLogo: React.FC<GeminiLogoProps> = ({
  size = 24,
  className = '',
  variant = 'gradient',
  animated = false
}) => {
  const gradientId = React.useId();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform ${animated ? 'animate-pulse' : ''} ${className}`}
      aria-label="Google Gemini"
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="2"
          y1="2"
          x2="22"
          y2="22"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#4E7FFF" />
          <stop offset="35%" stopColor="#6E56CF" />
          <stop offset="70%" stopColor="#9E53E8" />
          <stop offset="100%" stopColor="#E85DF5" />
        </linearGradient>
      </defs>

      {/* Main Google Gemini 4-pointed curved star */}
      <path
        d="M12 1.5C12 7.29899 16.701 12 22.5 12C16.701 12 12 16.701 12 22.5C12 16.701 7.29899 12 1.5 12C7.29899 12 12 7.29899 12 1.5Z"
        fill={
          variant === 'gradient'
            ? `url(#${gradientId})`
            : variant === 'purple'
            ? '#7c3aed'
            : '#ffffff'
        }
      />

      {/* Accent inner light shimmer reflection */}
      <path
        d="M12 4C12 8.41828 15.5817 12 20 12C15.5817 12 12 15.5817 12 20C12 15.5817 8.41828 12 4 12C8.41828 12 12 8.41828 12 4Z"
        fill="white"
        fillOpacity="0.28"
      />
    </svg>
  );
};
