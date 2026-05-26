import { createContext, ReactNode, useContext, useRef, useState } from 'react';
import { Achievement } from '../config/achievements';

type AchievementToastContextType = {
  showAchievements: (achievements: Achievement[]) => void;
  current: Achievement | null;
  onHide: () => void;
};

const AchievementToastContext = createContext<AchievementToastContextType>({
  showAchievements: () => {},
  current: null,
  onHide: () => {},
});

export const AchievementToastProvider = ({ children }: { children: ReactNode }) => {
  const [current, setCurrent] = useState<Achievement | null>(null);
  const queue = useRef<Achievement[]>([]);

  const showNext = () => {
    if (queue.current.length === 0) {
      setCurrent(null);
      return;
    }
    const next = queue.current.shift()!;
    setCurrent(next);
  };

  const showAchievements = (achievements: Achievement[]) => {
    queue.current.push(...achievements);
    if (!current) showNext();
  };

  const onHide = () => {
    setCurrent(null);
    setTimeout(showNext, 300);
  };

  return (
    <AchievementToastContext.Provider value={{ showAchievements, current, onHide }}>
      {children}
    </AchievementToastContext.Provider>
  );
};

export const useAchievementToast = () => useContext(AchievementToastContext);