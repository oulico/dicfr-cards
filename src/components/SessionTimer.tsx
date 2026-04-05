import { useState, useEffect } from 'react';

interface Props {
  startTime: Date;
}

export function SessionTimer({ startTime }: Props) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  return (
    <span className="session-timer">
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </span>
  );
}
