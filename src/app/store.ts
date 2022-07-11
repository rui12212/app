import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import authReducer from "../features/auth/authSlice";
// import postReducer from "../features/post/postSlice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    // post: postReducer,
  },
});


export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
// 下記一行を追加。typeofを使い、store.dispatchの型を取得して、それをAdddispatchという名前でexportしている
export type AppDispatch = typeof store.dispatch;

