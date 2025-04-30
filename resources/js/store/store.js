import { configureStore } from '@reduxjs/toolkit';
import linksReducer from './linksSlice';

// Create a middleware to log state changes
const loggerMiddleware = (store) => (next) => (action) => {
    const result = next(action);
    return result;
};

export const store = configureStore({
    reducer: {
        links: linksReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(loggerMiddleware),
}); 