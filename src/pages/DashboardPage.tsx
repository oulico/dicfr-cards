import { useEffect, useState } from 'react';
import { useClassroomStore } from '../store/useClassroomStore';
import { useAuthStore } from '../store/useAuthStore';
import { ShareFlow } from '../components/ShareFlow';
import { getStoredAuth } from '../lib/api';

export function DashboardPage() {
  const { token } = useAuthStore();
  const { classrooms, currentClassroom, students, fetchClassrooms, fetchStudents, setCurrentClassroom } = useClassroomStore();
  const [showShareFlow, setShowShareFlow] = useState(false);
  const [copied, setCopied] = useState(false);

  const teacherClassrooms = classrooms.filter(c => c.role === 'teacher');

  useEffect(() => {
    if (token) {
      fetchClassrooms(token);
    }
  }, [token, fetchClassrooms]);

  useEffect(() => {
    if (currentClassroom && token) {
      fetchStudents(token, currentClassroom.id);
    }
  }, [currentClassroom, token, fetchStudents]);

  const handleCreateClassroom = async () => {
    const name = prompt('Enter classroom name:');
    if (name && token) {
      try {
        await useClassroomStore.getState().createClassroom(token, name);
      } catch (error) {
        console.error('Failed to create classroom:', error);
        alert('Failed to create classroom. Please try again.');
      }
    }
  };

  const handleCopyInviteLink = async () => {
    if (currentClassroom && token) {
      try {
        const auth = getStoredAuth();
        if (!auth) return;
        const { getInviteLink } = await import('../lib/api');
        const result = await getInviteLink(auth.token, currentClassroom.id);
        await navigator.clipboard.writeText(result.inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to get invite link:', error);
      }
    }
  };

  const isAtRisk = (student: any) => {
    const retentionLow = student.retentionRate < 70;
    const inactive = student.lastActive
      ? (Date.now() - new Date(student.lastActive).getTime()) > 3 * 24 * 60 * 60 * 1000
      : true;
    return retentionLow || inactive;
  };

  if (!token) {
    return (
      <div className="dashboard-page">
        <h2 className="page-title">Teacher Dashboard</h2>
        <p className="empty-state">Please sign in to access the dashboard.</p>
      </div>
    );
  }

  if (teacherClassrooms.length === 0) {
    return (
      <div className="dashboard-page">
        <h2 className="page-title">Teacher Dashboard</h2>
        <p className="empty-state">Create a classroom to get started</p>
        <button type="button" className="btn-primary" onClick={handleCreateClassroom}>
          Create Classroom
        </button>
      </div>
    );
  }

  const selectedClassroom = currentClassroom || teacherClassrooms[0];

  return (
    <div className="dashboard-page">
      <h2 className="page-title">Teacher Dashboard</h2>

      {teacherClassrooms.length > 1 && (
        <div className="classroom-selector">
          <select
            className="setting-input"
            value={selectedClassroom.id}
            onChange={(e) => {
              const classroom = teacherClassrooms.find(c => c.id === e.target.value);
              if (classroom) setCurrentClassroom(classroom);
            }}
          >
            {teacherClassrooms.map((classroom) => (
              <option key={classroom.id} value={classroom.id}>
                {classroom.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="dashboard-actions">
        <button
          type="button"
          className="btn-primary"
          onClick={() => setShowShareFlow(true)}
        >
          Share Vocab
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={handleCopyInviteLink}
        >
          {copied ? 'Copied!' : 'Copy Invite Link'}
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            if (selectedClassroom) fetchStudents(token, selectedClassroom.id);
          }}
        >
          Refresh
        </button>
      </div>

      <div className="students-section">
        <h3 className="section-title">Students</h3>
        {students.length === 0 ? (
          <p className="empty-state">No students yet. Share the invite link to add students.</p>
        ) : (
          <div className="students-list">
            {students.map((student) => (
              <div key={student.email} className={`student-card ${isAtRisk(student) ? 'at-risk' : ''}`}>
                <div className="student-info">
                  <div className="student-name">{student.name || student.email}</div>
                  {isAtRisk(student) && (
                    <span className="at-risk-badge">At Risk</span>
                  )}
                </div>
                <div className="student-stats">
                  <div className="student-stat">
                    <span className="stat-value">{student.streak}</span>
                    <span className="stat-label">🔥</span>
                  </div>
                  <div className="student-stat">
                    <span className="stat-value">{student.retentionRate}%</span>
                    <span className="stat-label">Retention</span>
                  </div>
                  <div className="student-stat">
                    <span className="stat-value">{student.cardsDue}</span>
                    <span className="stat-label">Due Today</span>
                  </div>
                  <div className="student-stat">
                    <span className="stat-value">{student.totalCards}</span>
                    <span className="stat-label">Total</span>
                  </div>
                </div>
                <div className="student-last-active">
                  Last active: {student.lastActive
                    ? new Date(student.lastActive).toLocaleDateString()
                    : 'Never'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showShareFlow && (
        <ShareFlow
          onClose={() => setShowShareFlow(false)}
          classroomId={selectedClassroom.id}
        />
      )}
    </div>
  );
}
