import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type {
  LandingPageDocument,
  LPSection,
  LPRow,
  LPColumn,
  LPElement,
  ElementProps,
  ElementStyle,
  SelectionType,
  SectionStyle,
} from '@/types/lp-document';
import { createDefaultDocument, generateId } from '@/types/lp-document';

interface EditorState {
  // Document
  document: LandingPageDocument;
  originalDocument: LandingPageDocument | null;
  isDirty: boolean;
  landingPageId: string | null;

  // Selection
  selectedId: string | null;
  selectedType: SelectionType | null;

  // History (for undo/redo)
  history: LandingPageDocument[];
  historyIndex: number;
  maxHistory: number;

  // UI State
  previewMode: 'desktop' | 'mobile';
  showGrid: boolean;
  isLoading: boolean;
  isSaving: boolean;

  // Actions
  setDocument: (doc: LandingPageDocument) => void;
  setLandingPageId: (id: string) => void;
  resetEditor: () => void;

  // Selection
  setSelection: (id: string | null, type?: SelectionType | null) => void;
  clearSelection: () => void;

  // Section operations
  addSection: (section: LPSection, position?: number) => void;
  updateSection: (sectionId: string, updates: Partial<LPSection>) => void;
  updateSectionStyle: (sectionId: string, style: Partial<SectionStyle>) => void;
  removeSection: (sectionId: string) => void;
  duplicateSection: (sectionId: string) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  toggleSectionVisibility: (sectionId: string) => void;

  // Row operations
  addRow: (sectionId: string, row: LPRow) => void;
  updateRow: (rowId: string, updates: Partial<LPRow>) => void;
  removeRow: (rowId: string) => void;

  // Column operations
  addColumn: (rowId: string, column: LPColumn) => void;
  updateColumn: (columnId: string, updates: Partial<LPColumn>) => void;
  removeColumn: (columnId: string) => void;

  // Element operations
  addElement: (columnId: string, element: LPElement, position?: number) => void;
  updateElement: (elementId: string, updates: Partial<LPElement>) => void;
  updateElementProps: (elementId: string, props: Partial<ElementProps>) => void;
  updateElementStyle: (elementId: string, style: Partial<ElementStyle>) => void;
  removeElement: (elementId: string) => void;
  duplicateElement: (elementId: string) => void;
  reorderElements: (columnId: string, fromIndex: number, toIndex: number) => void;
  toggleElementVisibility: (elementId: string) => void;

  // History
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // UI
  setPreviewMode: (mode: 'desktop' | 'mobile') => void;
  setShowGrid: (show: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setIsSaving: (saving: boolean) => void;
  markClean: () => void;

  // Helpers
  findSection: (sectionId: string) => LPSection | undefined;
  findRow: (rowId: string) => { section: LPSection; row: LPRow } | undefined;
  findColumn: (columnId: string) => { section: LPSection; row: LPRow; column: LPColumn } | undefined;
  findElement: (elementId: string) => { section: LPSection; row: LPRow; column: LPColumn; element: LPElement } | undefined;
  getSelectedItem: () => LPSection | LPRow | LPColumn | LPElement | null;
}

export const useEditorState = create<EditorState>()(
  immer((set, get) => ({
    // Initial state
    document: createDefaultDocument(),
    originalDocument: null,
    isDirty: false,
    landingPageId: null,
    selectedId: null,
    selectedType: null,
    history: [],
    historyIndex: -1,
    maxHistory: 50,
    previewMode: 'desktop',
    showGrid: false,
    isLoading: false,
    isSaving: false,

    // Set document
    setDocument: (doc) => set((state) => {
      state.document = doc;
      state.originalDocument = JSON.parse(JSON.stringify(doc));
      state.isDirty = false;
      state.history = [JSON.parse(JSON.stringify(doc))];
      state.historyIndex = 0;
    }),

    setLandingPageId: (id) => set({ landingPageId: id }),

    resetEditor: () => set({
      document: createDefaultDocument(),
      originalDocument: null,
      isDirty: false,
      landingPageId: null,
      selectedId: null,
      selectedType: null,
      history: [],
      historyIndex: -1,
    }),

    // Selection
    setSelection: (id, type = null) => set({ selectedId: id, selectedType: type }),
    clearSelection: () => set({ selectedId: null, selectedType: null }),

    // Push to history before mutations
    pushHistory: () => set((state) => {
      const docCopy = JSON.parse(JSON.stringify(state.document));
      // Remove future history if we're not at the end
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(docCopy);
      // Limit history size
      if (newHistory.length > state.maxHistory) {
        newHistory.shift();
      }
      state.history = newHistory;
      state.historyIndex = newHistory.length - 1;
      state.isDirty = true;
    }),

    // Section operations
    addSection: (section, position) => {
      get().pushHistory();
      set((state) => {
        const newSection = { ...section, id: generateId() };
        // Assign new IDs to all nested items
        newSection.rows = newSection.rows.map(row => ({
          ...row,
          id: generateId(),
          columns: row.columns.map(col => ({
            ...col,
            id: generateId(),
            elements: col.elements.map(el => ({ ...el, id: generateId() })),
          })),
        }));
        if (position !== undefined) {
          state.document.sections.splice(position, 0, newSection);
        } else {
          state.document.sections.push(newSection);
        }
      });
    },

    updateSection: (sectionId, updates) => {
      get().pushHistory();
      set((state) => {
        const section = state.document.sections.find(s => s.id === sectionId);
        if (section) {
          Object.assign(section, updates);
        }
      });
    },

    updateSectionStyle: (sectionId, style) => {
      get().pushHistory();
      set((state) => {
        const section = state.document.sections.find(s => s.id === sectionId);
        if (section) {
          section.style = { ...section.style, ...style };
        }
      });
    },

    removeSection: (sectionId) => {
      get().pushHistory();
      set((state) => {
        state.document.sections = state.document.sections.filter(s => s.id !== sectionId);
        if (state.selectedId === sectionId) {
          state.selectedId = null;
          state.selectedType = null;
        }
      });
    },

    duplicateSection: (sectionId) => {
      get().pushHistory();
      set((state) => {
        const index = state.document.sections.findIndex(s => s.id === sectionId);
        if (index !== -1) {
          const original = state.document.sections[index];
          const duplicate = JSON.parse(JSON.stringify(original));
          duplicate.id = generateId();
          duplicate.name = `${original.name || original.type} (cópia)`;
          // Regenerate all IDs
          duplicate.rows = duplicate.rows.map((row: LPRow) => ({
            ...row,
            id: generateId(),
            columns: row.columns.map((col: LPColumn) => ({
              ...col,
              id: generateId(),
              elements: col.elements.map((el: LPElement) => ({ ...el, id: generateId() })),
            })),
          }));
          state.document.sections.splice(index + 1, 0, duplicate);
        }
      });
    },

    reorderSections: (fromIndex, toIndex) => {
      get().pushHistory();
      set((state) => {
        const [removed] = state.document.sections.splice(fromIndex, 1);
        state.document.sections.splice(toIndex, 0, removed);
      });
    },

    toggleSectionVisibility: (sectionId) => {
      get().pushHistory();
      set((state) => {
        const section = state.document.sections.find(s => s.id === sectionId);
        if (section) {
          section.visible = !section.visible;
        }
      });
    },

    // Row operations
    addRow: (sectionId, row) => {
      get().pushHistory();
      set((state) => {
        const section = state.document.sections.find(s => s.id === sectionId);
        if (section) {
          const newRow = { ...row, id: generateId() };
          newRow.columns = newRow.columns.map(col => ({
            ...col,
            id: generateId(),
            elements: col.elements.map(el => ({ ...el, id: generateId() })),
          }));
          section.rows.push(newRow);
        }
      });
    },

    updateRow: (rowId, updates) => {
      get().pushHistory();
      set((state) => {
        for (const section of state.document.sections) {
          const row = section.rows.find(r => r.id === rowId);
          if (row) {
            Object.assign(row, updates);
            return;
          }
        }
      });
    },

    removeRow: (rowId) => {
      get().pushHistory();
      set((state) => {
        for (const section of state.document.sections) {
          section.rows = section.rows.filter(r => r.id !== rowId);
        }
        if (state.selectedId === rowId) {
          state.selectedId = null;
          state.selectedType = null;
        }
      });
    },

    // Column operations
    addColumn: (rowId, column) => {
      get().pushHistory();
      set((state) => {
        for (const section of state.document.sections) {
          const row = section.rows.find(r => r.id === rowId);
          if (row) {
            const newColumn = { ...column, id: generateId() };
            newColumn.elements = newColumn.elements.map(el => ({ ...el, id: generateId() }));
            row.columns.push(newColumn);
            return;
          }
        }
      });
    },

    updateColumn: (columnId, updates) => {
      get().pushHistory();
      set((state) => {
        for (const section of state.document.sections) {
          for (const row of section.rows) {
            const column = row.columns.find(c => c.id === columnId);
            if (column) {
              Object.assign(column, updates);
              return;
            }
          }
        }
      });
    },

    removeColumn: (columnId) => {
      get().pushHistory();
      set((state) => {
        for (const section of state.document.sections) {
          for (const row of section.rows) {
            row.columns = row.columns.filter(c => c.id !== columnId);
          }
        }
        if (state.selectedId === columnId) {
          state.selectedId = null;
          state.selectedType = null;
        }
      });
    },

    // Element operations
    addElement: (columnId, element, position) => {
      get().pushHistory();
      set((state) => {
        for (const section of state.document.sections) {
          for (const row of section.rows) {
            const column = row.columns.find(c => c.id === columnId);
            if (column) {
              const newElement = { ...element, id: generateId() };
              if (position !== undefined) {
                column.elements.splice(position, 0, newElement);
              } else {
                column.elements.push(newElement);
              }
              return;
            }
          }
        }
      });
    },

    updateElement: (elementId, updates) => {
      get().pushHistory();
      set((state) => {
        for (const section of state.document.sections) {
          for (const row of section.rows) {
            for (const column of row.columns) {
              const element = column.elements.find(e => e.id === elementId);
              if (element) {
                Object.assign(element, updates);
                return;
              }
            }
          }
        }
      });
    },

    updateElementProps: (elementId, props) => {
      get().pushHistory();
      set((state) => {
        for (const section of state.document.sections) {
          for (const row of section.rows) {
            for (const column of row.columns) {
              const element = column.elements.find(e => e.id === elementId);
              if (element) {
                element.props = { ...element.props, ...props };
                return;
              }
            }
          }
        }
      });
    },

    updateElementStyle: (elementId, style) => {
      get().pushHistory();
      set((state) => {
        for (const section of state.document.sections) {
          for (const row of section.rows) {
            for (const column of row.columns) {
              const element = column.elements.find(e => e.id === elementId);
              if (element) {
                element.style = { ...element.style, ...style };
                return;
              }
            }
          }
        }
      });
    },

    removeElement: (elementId) => {
      get().pushHistory();
      set((state) => {
        for (const section of state.document.sections) {
          for (const row of section.rows) {
            for (const column of row.columns) {
              column.elements = column.elements.filter(e => e.id !== elementId);
            }
          }
        }
        if (state.selectedId === elementId) {
          state.selectedId = null;
          state.selectedType = null;
        }
      });
    },

    duplicateElement: (elementId) => {
      get().pushHistory();
      set((state) => {
        for (const section of state.document.sections) {
          for (const row of section.rows) {
            for (const column of row.columns) {
              const index = column.elements.findIndex(e => e.id === elementId);
              if (index !== -1) {
                const duplicate = JSON.parse(JSON.stringify(column.elements[index]));
                duplicate.id = generateId();
                column.elements.splice(index + 1, 0, duplicate);
                return;
              }
            }
          }
        }
      });
    },

    reorderElements: (columnId, fromIndex, toIndex) => {
      get().pushHistory();
      set((state) => {
        for (const section of state.document.sections) {
          for (const row of section.rows) {
            const column = row.columns.find(c => c.id === columnId);
            if (column) {
              const [removed] = column.elements.splice(fromIndex, 1);
              column.elements.splice(toIndex, 0, removed);
              return;
            }
          }
        }
      });
    },

    toggleElementVisibility: (elementId) => {
      get().pushHistory();
      set((state) => {
        for (const section of state.document.sections) {
          for (const row of section.rows) {
            for (const column of row.columns) {
              const element = column.elements.find(e => e.id === elementId);
              if (element) {
                element.visible = !element.visible;
                return;
              }
            }
          }
        }
      });
    },

    // History operations
    undo: () => set((state) => {
      if (state.historyIndex > 0) {
        state.historyIndex -= 1;
        state.document = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
        state.isDirty = true;
      }
    }),

    redo: () => set((state) => {
      if (state.historyIndex < state.history.length - 1) {
        state.historyIndex += 1;
        state.document = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
        state.isDirty = true;
      }
    }),

    canUndo: () => get().historyIndex > 0,
    canRedo: () => get().historyIndex < get().history.length - 1,

    // UI
    setPreviewMode: (mode) => set({ previewMode: mode }),
    setShowGrid: (show) => set({ showGrid: show }),
    setIsLoading: (loading) => set({ isLoading: loading }),
    setIsSaving: (saving) => set({ isSaving: saving }),
    markClean: () => set({ isDirty: false }),

    // Helpers
    findSection: (sectionId) => get().document.sections.find(s => s.id === sectionId),
    
    findRow: (rowId) => {
      for (const section of get().document.sections) {
        const row = section.rows.find(r => r.id === rowId);
        if (row) return { section, row };
      }
      return undefined;
    },

    findColumn: (columnId) => {
      for (const section of get().document.sections) {
        for (const row of section.rows) {
          const column = row.columns.find(c => c.id === columnId);
          if (column) return { section, row, column };
        }
      }
      return undefined;
    },

    findElement: (elementId) => {
      for (const section of get().document.sections) {
        for (const row of section.rows) {
          for (const column of row.columns) {
            const element = column.elements.find(e => e.id === elementId);
            if (element) return { section, row, column, element };
          }
        }
      }
      return undefined;
    },

    getSelectedItem: () => {
      const { selectedId, selectedType } = get();
      if (!selectedId || !selectedType) return null;

      switch (selectedType) {
        case 'section':
          return get().findSection(selectedId) || null;
        case 'row':
          return get().findRow(selectedId)?.row || null;
        case 'column':
          return get().findColumn(selectedId)?.column || null;
        case 'element':
          return get().findElement(selectedId)?.element || null;
        default:
          return null;
      }
    },
  }))
);
