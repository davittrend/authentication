import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PinterestAuth } from '../../hooks/useAuth';

interface AuthState {
  isAuthenticated: boolean;
  userData: PinterestAuth | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  userData: null,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<PinterestAuth>) => {
      state.isAuthenticated = true;
      state.userData = action.payload;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.userData = null;
      state.error = null;
    },
  },
});

export const { setAuth, setLoading, setError, logout } = authSlice.actions;
export default authSlice.reducer;