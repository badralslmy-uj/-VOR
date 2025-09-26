
import React, { useState, useEffect } from 'react';

interface CountdownProps {
  initialTime: number;
  className?: string;
  size?: 'large' | 'small';
}

const Countdown: React.FC<CountdownProps> = ({ initialTime, className, size = 'large' }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prevTime => prevTime > 0 ? prevTime - 1 : 0);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (time: number) => {
    const days = Math.floor(time / (60 * 60 * 24));
    const hours = Math.floor((time % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((time % (60 * 60)) / 60);
    const seconds = Math.floor(time % 60);

    return {
      days: days.toString().padStart(2, '0'),
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
    };
  };

  const { days, hours, minutes, seconds } = formatTime(timeLeft);
  
  const isLarge = size === 'large';

  const TimeUnit: React.FC<{ value: string; label: string }> = ({ value, label }) => (
    <div className="flex flex-col items-center">
      <span className={`font-black text-white drop-shadow-lg tabular-nums ${isLarge ? 'text-3xl sm:text-4xl lg:text-5xl' : 'text-base'}`}>{value}</span>
      <span className={`font-semibold text-gray-400 uppercase tracking-widest drop-shadow-sm ${isLarge ? 'text-xs sm:text-sm' : 'text-[10px]'}`}>{label}</span>
    </div>
  );
  
  const Colon: React.FC = () => (
    <span className={`font-black text-gray-600 drop-shadow-lg select-none ${isLarge ? 'text-3xl sm:text-4xl lg:text-5xl' : 'text-base'}`}>:</span>
  );

  return (
    <div className={`flex items-center justify-center sm:justify-start ${isLarge ? 'gap-4 sm:gap-6' : 'gap-2'} ${className || ''}`}>
      {parseInt(days, 10) > 0 && (
          <>
            <TimeUnit value={days} label={isLarge ? "Days" : "D"} />
            <Colon />
          </>
      )}
      <TimeUnit value={hours} label={isLarge ? "Hours" : "H"} />
      <Colon />
      <TimeUnit value={minutes} label={isLarge ? "Mins" : "M"} />
      <Colon />
      <TimeUnit value={seconds} label={isLarge ? "Secs" : "S"} />
    </div>
  );
};

export default Countdown;