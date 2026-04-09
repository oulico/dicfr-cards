import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useClassroomStore } from '../useClassroomStore';

vi.mock('../../lib/api', () => ({
  fetchClassrooms: vi.fn(),
  createClassroom: vi.fn(),
  fetchStudents: vi.fn(),
  joinClassroom: vi.fn(),
}));

describe('useClassroomStore', () => {
  beforeEach(() => {
    useClassroomStore.setState({
      classrooms: [],
      currentClassroom: null,
      students: [],
    });
  });

  describe('initial state', () => {
    it('should have empty initial state', () => {
      const state = useClassroomStore.getState();
      expect(state.classrooms).toEqual([]);
      expect(state.currentClassroom).toBeNull();
      expect(state.students).toEqual([]);
    });
  });

  describe('fetchClassrooms', () => {
    it('should fetch and set classrooms', async () => {
      const mockClassrooms = [
        {
          id: '1',
          name: 'Test Classroom',
          inviteCode: 'ABC123',
          role: 'teacher' as const,
        },
      ];

      const { fetchClassrooms } = await import('../../lib/api');
      (fetchClassrooms as any).mockResolvedValueOnce(mockClassrooms);

      const state = useClassroomStore.getState();
      await state.fetchClassrooms('token');

      expect(fetchClassrooms).toHaveBeenCalledWith('token');
      expect(useClassroomStore.getState().classrooms).toEqual(mockClassrooms);
    });
  });

  describe('createClassroom', () => {
    it('should create and add classroom', async () => {
      const mockClassroom = {
        id: '1',
        name: 'Test Classroom',
        inviteCode: 'ABC123',
        role: 'teacher' as const,
      };

      const { createClassroom } = await import('../../lib/api');
      (createClassroom as any).mockResolvedValueOnce(mockClassroom);

      const state = useClassroomStore.getState();
      const result = await state.createClassroom('token', 'Test Classroom');

      expect(createClassroom).toHaveBeenCalledWith('token', 'Test Classroom');
      expect(result).toEqual(mockClassroom);
      expect(useClassroomStore.getState().classrooms).toContain(mockClassroom);
      expect(useClassroomStore.getState().currentClassroom).toEqual(mockClassroom);
    });
  });

  describe('fetchStudents', () => {
    it('should fetch and set students', async () => {
      const mockStudents = [
        {
          email: 'test@example.com',
          name: 'Test Student',
          joinedAt: '2024-01-01',
          lastActive: '2024-01-02',
          streak: 5,
          totalCards: 100,
          retentionRate: 85,
          cardsDue: 10,
        },
      ];

      const { fetchStudents } = await import('../../lib/api');
      (fetchStudents as any).mockResolvedValueOnce(mockStudents);

      const state = useClassroomStore.getState();
      await state.fetchStudents('token', 'classroom-1');

      expect(fetchStudents).toHaveBeenCalledWith('token', 'classroom-1');
      expect(useClassroomStore.getState().students).toEqual(mockStudents);
    });
  });

  describe('joinClassroom', () => {
    it('should join and add classroom', async () => {
      const mockClassroom = {
        id: '1',
        name: 'Test Classroom',
        inviteCode: 'ABC123',
        role: 'student' as const,
      };

      const { joinClassroom } = await import('../../lib/api');
      (joinClassroom as any).mockResolvedValueOnce(mockClassroom);

      const state = useClassroomStore.getState();
      const result = await state.joinClassroom('token', 'ABC123');

      expect(joinClassroom).toHaveBeenCalledWith('token', 'ABC123');
      expect(result).toEqual(mockClassroom);
      expect(useClassroomStore.getState().classrooms).toContain(mockClassroom);
      expect(useClassroomStore.getState().currentClassroom).toEqual(mockClassroom);
    });
  });

  describe('setCurrentClassroom', () => {
    it('should set current classroom', () => {
      const mockClassroom = {
        id: '1',
        name: 'Test Classroom',
        inviteCode: 'ABC123',
        role: 'teacher' as const,
      };

      const state = useClassroomStore.getState();
      state.setCurrentClassroom(mockClassroom);

      expect(useClassroomStore.getState().currentClassroom).toEqual(mockClassroom);
    });

    it('should clear current classroom', () => {
      const state = useClassroomStore.getState();
      state.setCurrentClassroom(null);

      expect(useClassroomStore.getState().currentClassroom).toBeNull();
    });
  });
});
