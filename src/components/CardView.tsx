import { useState, useEffect, useCallback } from "react";
import type { ExportWordV2 } from "../lib/types";
import { Rating, type Grade } from 'ts-fsrs';

interface Props {
  card: ExportWordV2;
  index: number;
  total: number;
  onRate: (rating: Grade) => void;
  disabled?: boolean;
}

export function CardView({ card, index, total, onRate, disabled = false }: Props) {
  const [flipped, setFlipped] = useState(false);
  const [hasSpeech, setHasSpeech] = useState(false);

  const meta = [card.pos, card.gender].filter(Boolean).join(", ");

  useEffect(() => {
    setHasSpeech('speechSynthesis' in window);
  }, []);

  const handleSpeak = useCallback(() => {
    if (!hasSpeech) return;
    const utterance = new SpeechSynthesisUtterance(card.word);
    utterance.lang = 'fr-FR';
    speechSynthesis.speak(utterance);
  }, [hasSpeech, card.word]);

  const handleFlip = useCallback(() => {
    if (!flipped && !disabled) {
      setFlipped(true);
    }
  }, [flipped, disabled]);

  const handleRate = useCallback((rating: Grade) => {
    if (disabled) return;
    setFlipped(false);
    onRate(rating);
  }, [disabled, onRate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (flipped) {
        if (e.key === '1') handleRate(Rating.Again);
        else if (e.key === '2') handleRate(Rating.Hard);
        else if (e.key === '3') handleRate(Rating.Good);
        else if (e.key === '4') handleRate(Rating.Easy);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flipped, handleFlip, handleRate]);

  return (
    <div className="card-view">
      <div className="progress">
        {index + 1} / {total}
      </div>

      <button
        type="button"
        className={`card ${flipped ? "flipped" : ""}`}
        onClick={handleFlip}
      >
        <div className="card-inner">
          <div className="card-front">
            <div className="card-word-row">
              <span className="card-word">{card.word}</span>
              {hasSpeech && (
                <button
                  type="button"
                  className="speak-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSpeak();
                  }}
                  aria-label="Pronounce word"
                >
                  🔊
                </button>
              )}
            </div>
            {meta && <span className="card-meta">{meta}</span>}
            {!flipped && <span className="card-hint">tap to reveal</span>}
          </div>
          <div className="card-back">
            <span className="card-definition">{card.definition}</span>
          </div>
        </div>
      </button>

      {flipped && (
        <div className="rating-buttons">
          <button type="button" className="rate-again" onClick={() => handleRate(Rating.Again)} disabled={disabled}>
            Again
          </button>
          <button type="button" className="rate-hard" onClick={() => handleRate(Rating.Hard)} disabled={disabled}>
            Hard
          </button>
          <button type="button" className="rate-good" onClick={() => handleRate(Rating.Good)} disabled={disabled}>
            Good
          </button>
          <button type="button" className="rate-easy" onClick={() => handleRate(Rating.Easy)} disabled={disabled}>
            Easy
          </button>
        </div>
      )}
    </div>
  );
}
