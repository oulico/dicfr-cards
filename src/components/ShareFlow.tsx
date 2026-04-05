import { useState } from 'react';
import { useCardStore } from '../store/useCardStore';

interface ShareFlowProps {
  onClose: () => void;
  classroomId: string;
}

export function ShareFlow({ onClose, classroomId }: ShareFlowProps) {
  const { words } = useCardStore();
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleToggleWord = (word: string) => {
    const newSelected = new Set(selectedWords);
    if (newSelected.has(word)) {
      newSelected.delete(word);
    } else {
      newSelected.add(word);
    }
    setSelectedWords(newSelected);
  };

  const handleShareAll = () => {
    setSelectedWords(new Set(words.map(w => w.normalizedWord)));
  };

  const handleCreateShare = async () => {
    const { createShare } = await import('../lib/api');
    const { getStoredAuth } = await import('../lib/api');
    const auth = getStoredAuth();
    if (!auth) return;

    setLoading(true);
    try {
      const wordsToShare = selectedWords.size > 0
        ? words.filter(w => selectedWords.has(w.normalizedWord))
        : words;

      const result = await createShare(auth.token, classroomId, wordsToShare);
      setShareLink(result.shareLink);
    } catch (error) {
      console.error('Failed to create share:', error);
      alert('Failed to create share. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (shareLink) {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (shareLink) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3 className="modal-title">Share Link Created</h3>
          <p className="modal-text">Share this link with your students:</p>
          <div className="share-link-container">
            <input
              type="text"
              value={shareLink}
              readOnly
              className="share-link-input"
            />
            <button
              type="button"
              className="btn-secondary"
              onClick={handleCopyLink}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 className="modal-title">Share Vocabulary</h3>
        <div className="modal-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleShareAll}
          >
            Select All ({words.length})
          </button>
        </div>
        <div className="word-selection-list">
          {words.map((word) => (
            <label key={word.normalizedWord} className="word-selection-item">
              <input
                type="checkbox"
                checked={selectedWords.has(word.normalizedWord)}
                onChange={() => handleToggleWord(word.normalizedWord)}
                className="word-checkbox"
              />
              <span className="word-selection-text">{word.word}</span>
            </label>
          ))}
        </div>
        <div className="modal-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleCreateShare}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Share Link'}
          </button>
        </div>
      </div>
    </div>
  );
}
