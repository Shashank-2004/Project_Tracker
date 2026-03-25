import { useEffect } from 'react';
import { useStore } from '../../store/useStore';

export function Notification() {
  const { notification, hideNotification } = useStore();

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        hideNotification();
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [notification, hideNotification]);

  return (
    <div 
      className={`fixed bottom-5 right-5 bg-[var(--bg3)] border border-[var(--border2)] rounded-[var(--radius-lg)] px-3.5 py-2.5 text-[13px] text-[var(--text1)] z-[2000] flex items-center gap-[7px] transition-all duration-200 ${notification ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}
    >
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="#22c55e" strokeWidth="2">
        <polyline points="1.5 7 5 10.5 12.5 3"/>
      </svg>
      {notification}
    </div>
  );
}
