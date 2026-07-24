import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Safely load persisted auth from localStorage (browser only)
const loadState = (): Partial<AuthState> => {
  if (typeof window === 'undefined') return {};
  try {
    const serialized = localStorage.getItem('smartserve_auth');
    return serialized ? JSON.parse(serialized) : {};
  } catch {
    return {};
  }
};

const persisted = loadState();

const initialState: AuthState = {
  user: persisted.user ?? null,
  token: persisted.token ?? null,
  isAuthenticated: !!persisted.user,
  isLoading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading = false;
      // Persist to localStorage so page refresh keeps session alive
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'smartserve_auth',
          JSON.stringify({ user: action.payload.user, token: action.payload.token })
        );
        document.cookie = `token=${action.payload.token}; path=/; max-age=2592000`;
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('smartserve_auth');
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setCredentials, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
