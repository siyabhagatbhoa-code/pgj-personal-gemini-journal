import React from 'react';
import { AuraToneId } from '../types';

interface AmbientBackgroundProps {
  auraTone?: AuraToneId;
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({ auraTone = 'Dawn Lavender' }) => {
  // Gradients dynamically attune to the selected aura tone
  const getGradients = () => {
    switch (auraTone) {
      case 'Serene Peach':
        return {
          orb1: 'from-[#ffd8e7] via-[#ffd6cc] to-transparent',
          orb2: 'from-[#ffe8d6] via-[#fbcfe8] to-transparent',
          orb3: 'from-[#ffd6cc] via-[#fed7aa] to-transparent'
        };
      case 'Aurora Mist':
        return {
          orb1: 'from-[#c4e7ff] via-[#d4f8e8] to-transparent',
          orb2: 'from-[#dcfce7] via-[#e0e7ff] to-transparent',
          orb3: 'from-[#bae6fd] via-[#ccfbf1] to-transparent'
        };
      case 'Celestial Sky':
        return {
          orb1: 'from-[#7bd0ff] via-[#a5c0ff] to-transparent',
          orb2: 'from-[#d0bcff] via-[#7bd0ff] to-transparent',
          orb3: 'from-[#93c5fd] via-[#e9ddff] to-transparent'
        };
      case 'Dawn Lavender':
      default:
        return {
          orb1: 'from-[#e9ddff] via-[#7bd0ff] to-transparent',
          orb2: 'from-[#ffd8e7] via-[#d0bcff] to-transparent',
          orb3: 'from-[#c4e7ff] via-[#dce9ff] to-transparent'
        };
    }
  };

  const gradients = getGradients();

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 select-none max-w-full">
      {/* Top Left Orb */}
      <div
        className={`absolute -top-24 sm:-top-32 -left-20 sm:-left-28 w-[320px] sm:w-[460px] md:w-[540px] h-[320px] sm:h-[460px] md:h-[540px] rounded-full bg-gradient-to-br ${gradients.orb1} opacity-60 blur-2xl sm:blur-3xl transition-all duration-1000 animate-pulse`}
        style={{ animationDuration: '8s' }}
      />
      {/* Top Right Orb */}
      <div
        className={`absolute top-1/4 -right-20 sm:-right-28 w-[280px] sm:w-[400px] md:w-[480px] h-[280px] sm:h-[400px] md:h-[480px] rounded-full bg-gradient-to-bl ${gradients.orb2} opacity-50 blur-2xl sm:blur-3xl transition-all duration-1000`}
      />
      {/* Bottom Center Orb */}
      <div
        className={`absolute -bottom-20 sm:-bottom-28 left-1/4 sm:left-1/3 w-[340px] sm:w-[480px] md:w-[580px] h-[340px] sm:h-[480px] md:h-[580px] rounded-full bg-gradient-to-tr ${gradients.orb3} opacity-55 blur-2xl sm:blur-3xl transition-all duration-1000`}
      />
    </div>
  );
};
