import { configureStore, createSlice } from '@reduxjs/toolkit';

function loadState() {
    try {
        const serializedState = localStorage.getItem('state')
        if (serializedState) {
            return JSON.parse(serializedState)
        }
    }
    catch {
        console.warn("[state]: load failed")
    }
}
function saveState<T extends Record<string, any>>(state: T) {
    try {
      const serializedState = JSON.stringify(state);
      localStorage.setItem('state', serializedState);
    }
    catch {
        console.warn("[state]: save failed")
    }
}

const initialState = {
    files: [""],
    buffers: [null] as Array<AudioBuffer | null>
}

export const slice = createSlice({
    name: 'audio-player',
    initialState,
    reducers: {
        setFiles: (state, action: { payload: string[] }) => {
            state.files = action.payload
        },
        setBuffers: (state, action: { payload: Array<AudioBuffer | null> }) => {
            state.buffers = action.payload
        },
    }
})

export const store = configureStore({
    preloadedState: loadState(),
    reducer: {
        compressor: slice.reducer,
    },
})

store.subscribe(() => {
    saveState(store.getState());
});

export type StoreState = ReturnType<typeof store['getState']>

export const { setFiles, setBuffers } = slice.actions
