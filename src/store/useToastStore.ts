import { create } from 'zustand';

interface ToastStore {
  message: string | null;
  show: (message: string) => void;
}

let timer: ReturnType<typeof setTimeout> | undefined;

export const useToastStore = create<ToastStore>((set) => ({
  message: null,
  show: (message) => {
    clearTimeout(timer);
    set({ message });
    timer = setTimeout(() => set({ message: null }), 3000);
  },
}));
