import React from 'react';
import { MessageSquareQuote, Phone } from 'lucide-react';

export const MINSORA_AVATAR_SRC = '/images/minsora-avatar.jpg';

interface MinsoraAvatarProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showOnlineBadge?: boolean;
  showWaBadge?: boolean;
  className?: string;
  alt?: string;
}

export const MinsoraAvatar: React.FC<MinsoraAvatarProps> = ({
  size = 'md',
  showOnlineBadge = false,
  showWaBadge = false,
  className = '',
  alt = 'MinSora Mascot - Customer Care PT. Asasora',
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'xs':
        return {
          container: 'w-6 h-6',
          img: 'w-6 h-6',
          waBadge: 'w-3 h-3 text-[7px]',
          onlineDot: 'w-1.5 h-1.5',
        };
      case 'sm':
        return {
          container: 'w-7 h-7',
          img: 'w-7 h-7',
          waBadge: 'w-3.5 h-3.5 text-[8px]',
          onlineDot: 'w-2 h-2',
        };
      case 'md':
        return {
          container: 'w-9 h-9',
          img: 'w-9 h-9',
          waBadge: 'w-4 h-4 text-[9px]',
          onlineDot: 'w-2.5 h-2.5',
        };
      case 'lg':
        return {
          container: 'w-12 h-12',
          img: 'w-12 h-12',
          waBadge: 'w-5 h-5 text-[10px]',
          onlineDot: 'w-3 h-3',
        };
      case 'xl':
        return {
          container: 'w-14 h-14 sm:w-16 sm:h-16',
          img: 'w-14 h-14 sm:w-16 sm:h-16',
          waBadge: 'w-6 h-6',
          onlineDot: 'w-3.5 h-3.5',
        };
      case '2xl':
        return {
          container: 'w-20 h-20 sm:w-24 sm:h-24',
          img: 'w-20 h-20 sm:w-24 sm:h-24',
          waBadge: 'w-7 h-7',
          onlineDot: 'w-4 h-4',
        };
      default:
        return {
          container: 'w-9 h-9',
          img: 'w-9 h-9',
          waBadge: 'w-4 h-4',
          onlineDot: 'w-2.5 h-2.5',
        };
    }
  };

  const s = getSizeStyles();

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${s.container} ${className}`}>
      <img
        src={MINSORA_AVATAR_SRC}
        alt={alt}
        referrerPolicy="no-referrer"
        className={`${s.img} rounded-full object-cover border-2 border-white shadow-sm ring-2 ring-emerald-500/80 bg-emerald-50`}
        onError={(e) => {
          // Fallback if image path fails
          (e.target as HTMLElement).style.display = 'none';
        }}
      />

      {/* Online Status Dot Indicator */}
      {showOnlineBadge && (
        <span className={`absolute top-0 right-0 ${s.onlineDot} bg-emerald-500 border-2 border-white rounded-full animate-pulse shadow-xs`} />
      )}

      {/* WhatsApp Green Badge Icon */}
      {showWaBadge && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 ${s.waBadge} bg-[#25D366] text-white rounded-full flex items-center justify-center border-2 border-white shadow-md`}
          title="WhatsApp MinSora"
        >
          <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
        </span>
      )}
    </div>
  );
};
