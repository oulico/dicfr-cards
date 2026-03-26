import { useState } from "react";
import type { ExportWord } from "../lib/types";

interface Props {
  card: ExportWord;
  index: number;
  total: number;
  onRate: (quality: number) => void;
}

export function CardView({ card, index, total, onRate }: Props) {
  const [flipped, setFlipped] = useState(false);

  const meta = [card.pos, card.gender].filter(Boolean).join(", ");

  return (
    <div className="card-view">
      <div className="progress">
        {index + 1} / {total}
      </div>

      <button
        type="button"
        className={`card ${flipped ? "flipped" : ""}`}
        onClick={() => !flipped && setFlipped(true)}
      >
        <div className="card-inner">
          <div className="card-front">
            <span className="card-word">{card.word}</span>
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
          <button type="button" className="rate-again" onClick={() => { setFlipped(false); onRate(0); }}>
            Again
          </button>
          <button type="button" className="rate-hard" onClick={() => { setFlipped(false); onRate(2); }}>
            Hard
          </button>
          <button type="button" className="rate-good" onClick={() => { setFlipped(false); onRate(3); }}>
            Good
          </button>
          <button type="button" className="rate-easy" onClick={() => { setFlipped(false); onRate(5); }}>
            Easy
          </button>
        </div>
      )}
    </div>
  );
}
