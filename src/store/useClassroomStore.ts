import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Classroom {
  id: string;
  name: string;
  inviteCode: string;
  role: 'teacher' | 'student';
  teacherName?: string;
}

export interface ClassroomStudent {
  email: string;
  name: string;
  joinedAt: string;
  lastActive: string | null;
  streak: number;
  totalCards: number;
  retentionRate: number;
  cardsDue: number;
}

interface ClassroomState {
  classrooms: Classroom[];
  currentClassroom: Classroom | null;
  students: ClassroomStudent[];
}

interface ClassroomActions {
  fetchClassrooms: (token: string) => Promise<void>;
  createClassroom: (token: string, name: string) => Promise<Classroom>;
  fetchStudents: (token: string, classroomId: string) => Promise<void>;
  joinClassroom: (token: string, inviteCode: string) => Promise<Classroom>;
  setCurrentClassroom: (classroom: Classroom | null) => void;
}

export const useClassroomStore = create<ClassroomState & ClassroomActions>()(
  persist(
    (set, get) => ({
      classrooms: [],
      currentClassroom: null,
      students: [],

      fetchClassrooms: async (token) => {
        const { fetchClassrooms: apiFetchClassrooms } = await import('../lib/api');
        const classrooms = await apiFetchClassrooms(token);
        set({ classrooms });
      },

      createClassroom: async (token, name) => {
        const { createClassroom: apiCreateClassroom } = await import('../lib/api');
        const newClassroom = await apiCreateClassroom(token, name);
        const { classrooms } = get();
        set({ classrooms: [...classrooms, newClassroom], currentClassroom: newClassroom });
        return newClassroom;
      },

      fetchStudents: async (token, classroomId) => {
        const { fetchStudents: apiFetchStudents } = await import('../lib/api');
        const students = await apiFetchStudents(token, classroomId);
        set({ students });
      },

      joinClassroom: async (token, inviteCode) => {
        const { joinClassroom: apiJoinClassroom } = await import('../lib/api');
        const classroom = await apiJoinClassroom(token, inviteCode);
        const { classrooms } = get();
        set({ classrooms: [...classrooms, classroom], currentClassroom: classroom });
        return classroom;
      },

      setCurrentClassroom: (classroom) => {
        set({ currentClassroom: classroom });
      },
    }),
    {
      name: 'dicfr-classroom',
      partialize: (state) => ({ classrooms: state.classrooms, currentClassroom: state.currentClassroom }),
    }
  )
);
