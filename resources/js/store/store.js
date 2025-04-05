import { configureStore } from '@reduxjs/toolkit';
import linksReducer from './linksSlice';

// Create a middleware to log state changes
const loggerMiddleware = (store) => (next) => (action) => {
    console.log('Redux - Dispatching action:', action);
    const result = next(action);
    console.log('Redux - Next state:', store.getState());
    return result;
};

export const store = configureStore({
    reducer: {
        links: linksReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(loggerMiddleware),
}); 