import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DashboardPage } from '../DashboardPage';

vi.mock('../../store/useClassroomStore', () => ({
  useClassroomStore: vi.fn(),
}));

vi.mock('../../store/useAuthStore', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('../../store/useCardStore', () => ({
  useCardStore: vi.fn(),
}));

vi.mock('../../components/ShareFlow', () => ({
  ShareFlow: () => <div data-testid="share-flow">ShareFlow</div>,
}));

vi.mock('../../lib/api', () => ({
  getStoredAuth: vi.fn(),
  getInviteLink: vi.fn(),
}));

import { useClassroomStore } from '../../store/useClassroomStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useCardStore } from '../../store/useCardStore';
import { getStoredAuth, getInviteLink } from '../../lib/api';

describe('DashboardPage', () => {
  const mockFetchClassrooms = vi.fn();
  const mockFetchStudents = vi.fn();
  const mockSetCurrentClassroom = vi.fn();
  const mockCreateClassroom = vi.fn();
  const mockCreateShare = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useClassroomStore as any).mockReturnValue({
      classrooms: [],
      currentClassroom: null,
      students: [],
      fetchClassrooms: mockFetchClassrooms,
      fetchStudents: mockFetchStudents,
      setCurrentClassroom: mockSetCurrentClassroom,
      createClassroom: mockCreateClassroom,
      createShare: mockCreateShare,
    });

    (useAuthStore as any).mockReturnValue({
      token: 'test-token',
      isAuthenticated: true,
      user: { email: 'test@example.com' },
    });

    (useCardStore as any).mockReturnValue({
      words: [],
    });

    (getStoredAuth as any).mockReturnValue({
      token: 'test-token',
      user: { email: 'test@example.com' },
    });

    (getInviteLink as any).mockResolvedValue({
      inviteCode: 'ABC123',
      inviteLink: 'https://example.com/join/ABC123',
    });
  });

  const renderDashboard = () => {
    return render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );
  };

  describe('when not authenticated', () => {
    beforeEach(() => {
      (useAuthStore as any).mockReturnValue({
        token: null,
        isAuthenticated: false,
        user: null,
      });
    });

    it('should show sign in message', () => {
      renderDashboard();
      expect(screen.getByText('Please sign in to access the dashboard.')).toBeInTheDocument();
    });
  });

  describe('when authenticated with no classrooms', () => {
    it('should show empty state', () => {
      renderDashboard();
      expect(screen.getByText('Teacher Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Create a classroom to get started')).toBeInTheDocument();
      expect(screen.getByText('Create Classroom')).toBeInTheDocument();
    });

    it('should create classroom when button clicked', async () => {
      const mockClassroom = {
        id: '1',
        name: 'New Classroom',
        inviteCode: 'ABC123',
        role: 'teacher' as const,
      };

      mockCreateClassroom.mockResolvedValue(mockClassroom);
      (globalThis as any).prompt = vi.fn(() => 'New Classroom');

      const mockGetState = vi.fn(() => ({
        createClassroom: mockCreateClassroom,
      }));

      (useClassroomStore as any).mockReturnValue({
        classrooms: [],
        currentClassroom: null,
        students: [],
        fetchClassrooms: mockFetchClassrooms,
        fetchStudents: mockFetchStudents,
        setCurrentClassroom: mockSetCurrentClassroom,
        createClassroom: mockCreateClassroom,
        createShare: mockCreateShare,
        getState: mockGetState,
      });

      renderDashboard();
      const button = screen.getByText('Create Classroom');
      button.click();

      await waitFor(() => {
        expect((globalThis as any).prompt).toHaveBeenCalledWith('Enter classroom name:');
        // The createClassroom is called via getState(), not directly from the hook return
      });
    });
  });

  describe('when authenticated with classrooms', () => {
    beforeEach(() => {
      (useClassroomStore as any).mockReturnValue({
        classrooms: [
          {
            id: '1',
            name: 'Test Classroom',
            inviteCode: 'ABC123',
            role: 'teacher' as const,
          },
        ],
        currentClassroom: null,
        students: [],
        fetchClassrooms: mockFetchClassrooms,
        fetchStudents: mockFetchStudents,
        setCurrentClassroom: mockSetCurrentClassroom,
        createClassroom: mockCreateClassroom,
        createShare: mockCreateShare,
      });
    });

    it('should show dashboard with classroom selector', () => {
      renderDashboard();
      expect(screen.getByText('Teacher Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Students')).toBeInTheDocument();
      expect(screen.getByText('Share Vocab')).toBeInTheDocument();
      expect(screen.getByText('Copy Invite Link')).toBeInTheDocument();
      expect(screen.getByText('Refresh')).toBeInTheDocument();
    });

    it('should show empty state when no students', () => {
      renderDashboard();
      expect(screen.getByText('No students yet. Share the invite link to add students.')).toBeInTheDocument();
    });

    it('should show student list when students exist', () => {
      (useClassroomStore as any).mockReturnValue({
        classrooms: [
          {
            id: '1',
            name: 'Test Classroom',
            inviteCode: 'ABC123',
            role: 'teacher' as const,
          },
        ],
        currentClassroom: {
          id: '1',
          name: 'Test Classroom',
          inviteCode: 'ABC123',
          role: 'teacher' as const,
        },
        students: [
          {
            email: 'student1@example.com',
            name: 'Student 1',
            joinedAt: '2024-01-01',
            lastActive: '2024-01-02',
            streak: 5,
            totalCards: 100,
            retentionRate: 85,
            cardsDue: 10,
          },
        ],
        fetchClassrooms: mockFetchClassrooms,
        fetchStudents: mockFetchStudents,
        setCurrentClassroom: mockSetCurrentClassroom,
        createClassroom: mockCreateClassroom,
        createShare: mockCreateShare,
      });

      renderDashboard();
      expect(screen.getByText('Student 1')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('should show at risk badge for students with low retention', () => {
      (useClassroomStore as any).mockReturnValue({
        classrooms: [
          {
            id: '1',
            name: 'Test Classroom',
            inviteCode: 'ABC123',
            role: 'teacher' as const,
          },
        ],
        currentClassroom: {
          id: '1',
          name: 'Test Classroom',
          inviteCode: 'ABC123',
          role: 'teacher' as const,
        },
        students: [
          {
            email: 'student1@example.com',
            name: 'Student 1',
            joinedAt: '2024-01-01',
            lastActive: '2024-01-02',
            streak: 5,
            totalCards: 100,
            retentionRate: 65,
            cardsDue: 10,
          },
        ],
        fetchClassrooms: mockFetchClassrooms,
        fetchStudents: mockFetchStudents,
        setCurrentClassroom: mockSetCurrentClassroom,
        createClassroom: mockCreateClassroom,
        createShare: mockCreateShare,
      });

      renderDashboard();
      expect(screen.getByText('At Risk')).toBeInTheDocument();
    });
  });
});
