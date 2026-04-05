import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Grade } from 'ts-fsrs';
import { useCardStore } from '../store/useCardStore';
import { useStreakStore } from '../store/useStreakStore';
import { CardView } from '../components/CardView';
import { SessionTimer } from '../components/SessionTimer';

interface SessionResult {
  total: number;
  correct: number;
  grades: Grade[];
  startTime: Date;
  endTime: Date;
}

export function StudyPage() {
  const navigate = useNavigate();
  const { reviewQueue } = useCardStore();
  const { recordStudy } = useStreakStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [session, setSession] = useState<SessionResult | null>(null);
  const [ratingDisabled, setRatingDisabled] = useState(false);
  const isStudyingRef = useRef(true);

  useEffect(() => {
    isStudyingRef.current = true;

    if (reviewQueue.length === 0) {
      navigate('/');
      return;
    }

    setSession({
      total: 0,
      correct: 0,
      grades: [],
      startTime: new Date(),
      endTime: new Date(),
    });

    return () => {
      isStudyingRef.current = false;
    };
  }, [reviewQueue.length, navigate]);

  const handleRate = useCallback(
    (rating: Grade) => {
      if (!session || ratingDisabled || !isStudyingRef.current) return;

      setRatingDisabled(true);
      const card = reviewQueue[currentIndex];

      useCardStore.getState().updateCardAfterReview(card.normalizedWord, rating);

      const isCorrect = rating >= 3;
      const newSession = {
        ...session,
        total: session.total + 1,
        correct: isCorrect ? session.correct + 1 : session.correct,
        grades: [...session.grades, rating],
      };

      setSession(newSession);

      if (currentIndex + 1 < reviewQueue.length) {
        setCurrentIndex((i) => i + 1);
        setTimeout(() => setRatingDisabled(false), 300);
      } else {
        newSession.endTime = new Date();
        setSession(newSession);

        const today = new Date();
        const studyDay = {
          date: today.toISOString().split('T')[0],
          cardsReviewed: newSession.total,
          correctCount: newSession.correct,
          minutesStudied: Math.round((newSession.endTime.getTime() - newSession.startTime.getTime()) / 60000),
        };
        recordStudy(studyDay);

        navigate('/summary', { state: newSession });
      }
    },
    [session, ratingDisabled, reviewQueue, currentIndex, navigate, recordStudy]
  );

  if (!reviewQueue[currentIndex]) return null;

  const progress = `${currentIndex + 1} / ${reviewQueue.length}`;

  return (
    <div className="study-page">
      <div className="study-header">
        <span className="progress-text">{progress}</span>
        {session && <SessionTimer startTime={session.startTime} />}
      </div>
      <CardView
        card={reviewQueue[currentIndex]}
        index={currentIndex}
        total={reviewQueue.length}
        onRate={handleRate}
        disabled={ratingDisabled}
      />
    </div>
  );
}
