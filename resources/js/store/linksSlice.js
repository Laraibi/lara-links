import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    links: [],
    loading: false,
    error: null,
};

const linksSlice = createSlice({
    name: 'links',
    initialState,
    reducers: {
        setLinks: (state, action) => {
            // Ensure we're working with an array
            if (Array.isArray(action.payload)) {
                state.links = action.payload;
            }
        },
        addLink: (state, action) => {
            // Check if the link has all required properties
            if (action.payload && action.payload.id && action.payload.code) {
                // Check if the link already exists to avoid duplicates
                const linkExists = state.links.some(link => link.id === action.payload.id);
                if (!linkExists) {
                    state.links.unshift(action.payload);
                }
            }
        },
        updateLink: (state, action) => {
            // Find the link by ID and update it
            const index = state.links.findIndex(link => link.id === action.payload.id);
            if (index !== -1) {
                state.links[index] = { ...state.links[index], ...action.payload };
            }
        },
        removeLink: (state, action) => {
            state.links = state.links.filter(link => link.id !== action.payload);
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
    },
});

export const { setLinks, addLink, updateLink, removeLink, setLoading, setError } = linksSlice.actions;

export default linksSlice.reducer; 