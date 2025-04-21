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
            state.links = action.payload;
        },
        updateLink: (state, action) => {
            const { id, name } = action.payload;
            const link = state.links.find(link => link.id === id);
            if (link) {
                link.name = name;
            }
        },
        deleteLink: (state, action) => {
            state.links = state.links.filter(link => link.id !== action.payload);
        },
        addLink: (state, action) => {
            state.links.push(action.payload);
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
    },
});

export const { setLinks, updateLink, deleteLink, addLink, setLoading, setError } = linksSlice.actions;

export default linksSlice.reducer; 