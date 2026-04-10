import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Person, Group } from "../types/app";

export type ViewMode = "list" | "grid";
export type SortMode = "firstName" | "lastName" | "lastUpdate";

interface GroupViewPreferences {
  viewMode: ViewMode;
  sortMode: SortMode;
}

interface AppState {
  groups: Group[];
  people: Person[];
  groupViewPreferences: Record<string, GroupViewPreferences>;
  addGroup: (group: Omit<Group, "id" | "createdAt">) => void;
  deleteGroup: (groupId: string) => void;
  restoreGroup: (groupId: string) => void;
  permanentlyDeleteGroup: (groupId: string) => void;
  cleanupExpiredDeletions: () => void;
  updateGroup: (groupId: string, updates: Partial<Group>) => void;
  reorderGroups: (newGroupsOrder: Group[]) => void;
  addPerson: (person: Omit<Person, "id" | "createdAt" | "lastUpdated">) => void;
  updatePerson: (personId: string, updates: Partial<Person>) => void;
  deletePerson: (personId: string) => void;
  addNoteToHistory: (personId: string, noteContent: string) => void;
  editNote: (personId: string, noteId: string, newContent: string) => void;
  deleteNote: (personId: string, noteId: string) => void;
  addPhoneNumber: (personId: string, number: string, label: string) => void;
  editPhoneNumber: (personId: string, phoneId: string, number: string, label: string) => void;
  deletePhoneNumber: (personId: string, phoneId: string) => void;
  setGroupViewPreferences: (groupId: string, preferences: GroupViewPreferences) => void;
  getGroupViewPreferences: (groupId: string) => GroupViewPreferences;
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const DEFAULT_VIEW_PREFERENCES: GroupViewPreferences = {
  viewMode: "list",
  sortMode: "firstName",
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      groups: [],
      people: [],
      groupViewPreferences: {},

      setGroupViewPreferences: (groupId, preferences) => {
        set((state) => ({
          groupViewPreferences: { ...state.groupViewPreferences, [groupId]: preferences },
        }));
      },

      getGroupViewPreferences: (groupId) => {
        return get().groupViewPreferences[groupId] || DEFAULT_VIEW_PREFERENCES;
      },

      addGroup: (group) => {
        const newGroup: Group = {
          ...group,
          id: Date.now().toString() + Math.random(),
          createdAt: Date.now(),
        };
        set((state) => ({ groups: [...state.groups, newGroup] }));
      },

      deleteGroup: (groupId) => {
        const now = Date.now();
        set((state) => ({
          groups: state.groups.map((g) => (g.id === groupId ? { ...g, deletedAt: now } : g)),
          people: state.people.map((p) => (p.groupId === groupId ? { ...p, deletedAt: now } : p)),
        }));
      },

      restoreGroup: (groupId) => {
        set((state) => ({
          groups: state.groups.map((g) => (g.id === groupId ? { ...g, deletedAt: undefined } : g)),
          people: state.people.map((p) => (p.groupId === groupId ? { ...p, deletedAt: undefined } : p)),
        }));
      },

      permanentlyDeleteGroup: (groupId) => {
        set((state) => ({
          groups: state.groups.filter((g) => g.id !== groupId),
          people: state.people.filter((p) => p.groupId !== groupId),
        }));
      },

      cleanupExpiredDeletions: () => {
        const now = Date.now();
        set((state) => ({
          groups: state.groups.filter((g) => !g.deletedAt || now - g.deletedAt < THIRTY_DAYS_MS),
          people: state.people.filter((p) => !p.deletedAt || now - p.deletedAt < THIRTY_DAYS_MS),
        }));
      },

      updateGroup: (groupId, updates) => {
        set((state) => ({
          groups: state.groups.map((g) => (g.id === groupId ? { ...g, ...updates } : g)),
        }));
      },

      reorderGroups: (newGroupsOrder) => {
        set({ groups: newGroupsOrder });
      },

      addPerson: (person) => {
        const now = Date.now();
        const newPerson: Person = {
          ...person,
          id: now.toString() + Math.random(),
          createdAt: now,
          lastUpdated: now,
        };
        set((state) => ({ people: [...state.people, newPerson] }));
      },

      updatePerson: (personId, updates) => {
        set((state) => ({
          people: state.people.map((p) =>
            p.id === personId ? { ...p, ...updates, lastUpdated: Date.now() } : p
          ),
        }));
      },

      deletePerson: (personId) => {
        set((state) => ({ people: state.people.filter((p) => p.id !== personId) }));
      },

      addNoteToHistory: (personId, noteContent) => {
        const newNote = {
          id: Date.now().toString() + Math.random(),
          content: noteContent,
          timestamp: Date.now(),
        };
        set((state) => ({
          people: state.people.map((p) =>
            p.id === personId
              ? { ...p, notes: noteContent, noteHistory: [newNote, ...(p.noteHistory || [])], lastUpdated: Date.now() }
              : p
          ),
        }));
      },

      editNote: (personId, noteId, newContent) => {
        set((state) => ({
          people: state.people.map((p) =>
            p.id === personId
              ? {
                  ...p,
                  noteHistory: p.noteHistory.map((note) =>
                    note.id === noteId ? { ...note, content: newContent } : note
                  ),
                  lastUpdated: Date.now(),
                }
              : p
          ),
        }));
      },

      deleteNote: (personId, noteId) => {
        set((state) => ({
          people: state.people.map((p) =>
            p.id === personId
              ? { ...p, noteHistory: p.noteHistory.filter((note) => note.id !== noteId), lastUpdated: Date.now() }
              : p
          ),
        }));
      },

      addPhoneNumber: (personId, number, label) => {
        const newPhone = { id: Date.now().toString() + Math.random(), number, label, timestamp: Date.now() };
        set((state) => ({
          people: state.people.map((p) =>
            p.id === personId
              ? { ...p, phoneNumbers: [...(p.phoneNumbers || []), newPhone], lastUpdated: Date.now() }
              : p
          ),
        }));
      },

      editPhoneNumber: (personId, phoneId, number, label) => {
        set((state) => ({
          people: state.people.map((p) =>
            p.id === personId
              ? {
                  ...p,
                  phoneNumbers: p.phoneNumbers.map((ph) => (ph.id === phoneId ? { ...ph, number, label } : ph)),
                  lastUpdated: Date.now(),
                }
              : p
          ),
        }));
      },

      deletePhoneNumber: (personId, phoneId) => {
        set((state) => ({
          people: state.people.map((p) =>
            p.id === personId
              ? { ...p, phoneNumbers: p.phoneNumbers.filter((ph) => ph.id !== phoneId), lastUpdated: Date.now() }
              : p
          ),
        }));
      },
    }),
    {
      name: "my-friends-app-storage",
    }
  )
);
