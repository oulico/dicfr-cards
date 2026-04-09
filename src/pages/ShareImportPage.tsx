import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCardStore } from '../store/useCardStore';
import { getShare } from '../lib/api';

export function ShareImportPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addWords } = useCardStore();
  const [loading, setLoading] = useState(true);
  const [shareData, setShareData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    const loadShare = async () => {
      if (!id) {
        setError('Invalid share link');
        setLoading(false);
        return;
      }

      try {
        const data = await getShare(id);
        setShareData(data);
        setLoading(false);
      } catch (err: any) {
        if (err.message.includes('404') || err.message.includes('401')) {
          setError('This share link has expired or does not exist.');
        } else {
          setError('Failed to load shared vocabulary. Please try again.');
        }
        setLoading(false);
      }
    };

    loadShare();
  }, [id]);

  const handleImport = async () => {
    if (!shareData) return;

    setImporting(true);
    try {
      addWords(shareData.words);
      navigate('/');
    } catch (err) {
      setError('Failed to import vocabulary. Please try again.');
      setImporting(false);
    }
  };

  const isExpired = shareData && new Date(shareData.expiresAt) < new Date();

  if (loading) {
    return (
      <div className="share-import-page">
        <h2 className="page-title">Loading...</h2>
        <p className="empty-state">Please wait while we load the shared vocabulary.</p>
      </div>
    );
  }

  if (error || isExpired) {
    return (
      <div className="share-import-page">
        <h2 className="page-title">Error</h2>
        <p className="empty-state">
          {error || 'This share link has expired.'}
        </p>
        <button type="button" className="btn-primary" onClick={() => navigate('/')}>
          Go Home
        </button>
      </div>
    );
  }

  if (!shareData) {
    return null;
  }

  return (
    <div className="share-import-page">
      <h2 className="page-title">Import Vocabulary</h2>

      <div className="share-details">
        <div className="share-detail">
          <span className="share-detail-label">Teacher:</span>
          <span className="share-detail-value">{shareData.teacherName}</span>
        </div>
        <div className="share-detail">
          <span className="share-detail-label">Classroom:</span>
          <span className="share-detail-value">{shareData.classroomName}</span>
        </div>
        <div className="share-detail">
          <span className="share-detail-label">Words:</span>
          <span className="share-detail-value">{shareData.words.length}</span>
        </div>
        <div className="share-detail">
          <span className="share-detail-label">Expires:</span>
          <span className="share-detail-value">
            {new Date(shareData.expiresAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="share-preview">
        <h3 className="section-title">Preview</h3>
        <div className="word-list">
          {shareData.words.slice(0, 10).map((word: any) => (
            <div key={word.normalizedWord} className="word-item">
              <div className="word-item-word">{word.word}</div>
              <div className="word-item-definition">{word.definition}</div>
            </div>
          ))}
          {shareData.words.length > 10 && (
            <p className="word-list-more">
              ...and {shareData.words.length - 10} more words
            </p>
          )}
        </div>
      </div>

      <div className="share-actions">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => navigate('/')}
        >
          Cancel
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={handleImport}
          disabled={importing}
        >
          {importing ? 'Importing...' : 'Import to My Cards'}
        </button>
      </div>
    </div>
  );
}
