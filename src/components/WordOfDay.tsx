import { useMemo } from 'react';
import { useCardStore } from '../store/useCardStore';

export function WordOfDay() {
  const { words } = useCardStore();

  const wordOfDay = useMemo(() => {
    if (words.length === 0) return null;
    return [...words].sort((a, b) => a.fsrsCard.stability - b.fsrsCard.stability)[0];
  }, [words]);

  if (!wordOfDay) return null;

  const meta = [wordOfDay.pos, wordOfDay.gender].filter(Boolean).join(', ');

  return (
    <div className="word-of-day">
      <h3 className="word-of-day-title">Word of the Day</h3>
      <div className="word-of-day-content">
        <span className="word-of-day-word">{wordOfDay.word}</span>
        {meta && <span className="word-of-day-meta">{meta}</span>}
        <p className="word-of-day-definition">{wordOfDay.definition}</p>
      </div>
    </div>
  );
}
