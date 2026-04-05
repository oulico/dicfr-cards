import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createClassroom,
  fetchClassrooms,
  fetchStudents,
  getInviteLink,
  joinClassroom,
  createShare,
  getShare,
} from '../api';

const mockFetch = vi.fn();
(globalThis as any).fetch = mockFetch;

describe('API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('createClassroom', () => {
    it('should create a classroom', async () => {
      const mockClassroom = {
        id: '1',
        name: 'Test Classroom',
        inviteCode: 'ABC123',
        role: 'teacher' as const,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockClassroom,
      });

      const result = await createClassroom('token', 'Test Classroom');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://dicfr-api.manemis.workers.dev/classroom',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer token',
          },
          body: JSON.stringify({ name: 'Test Classroom' }),
        }
      );
      expect(result).toEqual(mockClassroom);
    });

    it('should throw an error if request fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      await expect(createClassroom('token', 'Test Classroom')).rejects.toThrow(
        'Create classroom failed: 400'
      );
    });
  });

  describe('fetchClassrooms', () => {
    it('should fetch classrooms', async () => {
      const mockClassrooms = [
        {
          id: '1',
          name: 'Test Classroom',
          inviteCode: 'ABC123',
          role: 'teacher' as const,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockClassrooms,
      });

      const result = await fetchClassrooms('token');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://dicfr-api.manemis.workers.dev/classroom',
        {
          headers: { Authorization: 'Bearer token' },
        }
      );
      expect(result).toEqual(mockClassrooms);
    });

    it('should throw an error if request fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      await expect(fetchClassrooms('token')).rejects.toThrow(
        'Fetch classrooms failed: 401'
      );
    });
  });

  describe('fetchStudents', () => {
    it('should fetch students', async () => {
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

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStudents,
      });

      const result = await fetchStudents('token', 'classroom-1');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://dicfr-api.manemis.workers.dev/classroom/classroom-1/students',
        {
          headers: { Authorization: 'Bearer token' },
        }
      );
      expect(result).toEqual(mockStudents);
    });

    it('should throw an error if request fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(fetchStudents('token', 'classroom-1')).rejects.toThrow(
        'Fetch students failed: 404'
      );
    });
  });

  describe('getInviteLink', () => {
    it('should get invite link', async () => {
      const mockResult = {
        inviteCode: 'ABC123',
        inviteLink: 'https://example.com/join/ABC123',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResult,
      });

      const result = await getInviteLink('token', 'classroom-1');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://dicfr-api.manemis.workers.dev/classroom/classroom-1/invite',
        {
          headers: { Authorization: 'Bearer token' },
        }
      );
      expect(result).toEqual(mockResult);
    });

    it('should throw an error if request fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
      });

      await expect(getInviteLink('token', 'classroom-1')).rejects.toThrow(
        'Get invite link failed: 403'
      );
    });
  });

  describe('joinClassroom', () => {
    it('should join a classroom', async () => {
      const mockClassroom = {
        id: '1',
        name: 'Test Classroom',
        inviteCode: 'ABC123',
        role: 'student' as const,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockClassroom,
      });

      const result = await joinClassroom('token', 'ABC123');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://dicfr-api.manemis.workers.dev/classroom/join',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer token',
          },
          body: JSON.stringify({ inviteCode: 'ABC123' }),
        }
      );
      expect(result).toEqual(mockClassroom);
    });

    it('should throw an error if request fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      await expect(joinClassroom('token', 'ABC123')).rejects.toThrow(
        'Join classroom failed: 400'
      );
    });
  });

  describe('createShare', () => {
    it('should create a share', async () => {
      const mockWords = [
        {
          word: 'test',
          normalizedWord: 'test',
          definition: 'test definition',
          lookupCount: 1,
          firstLookupAt: '2024-01-01',
          lastLookupAt: '2024-01-01',
          fsrsCard: {
            due: '2024-01-01',
            stability: 1,
            difficulty: 1,
            elapsed_days: 0,
            scheduled_days: 0,
            reps: 0,
            lapses: 0,
            state: 0,
            last_review: null,
            learning_steps: 0,
          },
        },
      ];

      const mockResult = {
        id: 'share-1',
        shareLink: 'https://example.com/share/share-1',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResult,
      });

      const result = await createShare('token', 'classroom-1', mockWords);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://dicfr-api.manemis.workers.dev/share',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer token',
          },
          body: JSON.stringify({ classroomId: 'classroom-1', words: mockWords }),
        }
      );
      expect(result).toEqual(mockResult);
    });

    it('should throw an error if request fails', async () => {
      const mockWords: any[] = [];
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      await expect(createShare('token', 'classroom-1', mockWords)).rejects.toThrow(
        'Create share failed: 400'
      );
    });
  });

  describe('getShare', () => {
    it('should get share data', async () => {
      const mockShareData = {
        id: 'share-1',
        teacherName: 'Test Teacher',
        classroomName: 'Test Classroom',
        expiresAt: '2024-12-31',
        words: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockShareData,
      });

      const result = await getShare('share-1');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://dicfr-api.manemis.workers.dev/share/share-1'
      );
      expect(result).toEqual(mockShareData);
    });

    it('should throw an error if request fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(getShare('share-1')).rejects.toThrow('Get share failed: 404');
    });
  });
});
