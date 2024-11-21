import { create } from 'zustand';
import { Socket } from 'socket.io-client';

interface Player {
  id: string;
  name: string;
  status: 'waiting' | 'ready' | 'playing';
}

interface GameState {
  socket: Socket | null;
  roomCode: string | null;
  players: Player[];
  isHost: boolean;
  messages: Array<{ id: number; user: string; text: string; }>;
}

interface GameStore extends GameState {
  setSocket: (socket: Socket) => void;
  setRoomCode: (code: string) => void;
  setPlayers: (players: Player[]) => void;
  setIsHost: (isHost: boolean) => void;
  addMessage: (message: { user: string; text: string; }) => void;
  reset: () => void;
}

const initialState: GameState = {
  socket: null,
  roomCode: null,
  players: [],
  isHost: false,
  messages: [],
};

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,
  setSocket: (socket) => set({ socket }),
  setRoomCode: (roomCode) => set({ roomCode }),
  setPlayers: (players) => set({ players }),
  setIsHost: (isHost) => set({ isHost }),
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, { id: Date.now(), ...message }],
  })),
  reset: () => set(initialState),
}));