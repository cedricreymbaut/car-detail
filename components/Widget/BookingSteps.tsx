
import React from 'react';
import { Check } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';

interface BookingStepsProps {
  currentStep: number;
  themeColor?: string;
}

const stepLabels = ['Service', 'Date', 'Infos', 'Confirmation'];

const BookingSteps: React.FC<BookingStepsProps> = ({ currentStep, themeColor = '#2563eb' }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  return (
    <div className="flex justify-between items-center mb-6 px-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex flex-col items-center relative">
          <div 
            className={`
              h-10 w-10 rounded-full flex items-center justify-center 
              transition-all duration-300 ease-in-out
              ${currentStep >= i 
                ? 'text-white font-bold' 
                : isDark 
                  ? 'bg-slate-800 text-slate-400' 
                  : 'bg-gray-100 text-gray-400'
              }
              relative z-10
              transform hover:scale-110
            `}
            style={{ 
              backgroundColor: currentStep >= i ? themeColor : undefined,
              transitionProperty: 'background-color, transform',
            }}
          >
            {currentStep > i ? <Check className="h-6 w-6" /> : i}
          </div>
          
          {/* Connecting line between steps */}
          {i < 4 && (
            <div 
              className={`
                absolute top-5 left-[calc(100%+0.5rem)] 
                h-0.5 w-12 
                transition-all duration-300
                ${isDark && currentStep <= i 
                  ? 'bg-slate-700' 
                  : !isDark && currentStep <= i 
                    ? 'bg-gray-200'
                    : ''
                }
              `}
              style={{
                backgroundColor: currentStep > i ? themeColor : undefined,
              }}
            />
          )}
          
          <span 
            className={`
              text-xs mt-2 text-center transition-colors duration-300
              ${currentStep >= i 
                ? `font-semibold ${isDark ? 'text-slate-100' : 'text-gray-800'}` 
                : isDark ? 'text-slate-400' : 'text-gray-500'
              }
            `}
          >
            {stepLabels[i - 1]}
          </span>
        </div>
      ))}
    </div>
  );
};

export default BookingSteps;
