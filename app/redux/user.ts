
import { createSlice } from '@reduxjs/toolkit';

const initialState: any = {
    user: null,
    isLogin: null,
    isAdminDrawerOpen: true,
    subscription: null
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        login: (state, action) => {
            state.user = action?.payload
            state.isLogin = true
        },
        logout: (state: any) => {
            state.user = null
            state.isLogin = false
        },
        setGlobalContext: (state, action) => {
            state.user = {
                ...state.user, ...action.payload
            }
        },
        setIsAdminDrawerOpen: (state, action) => {
            state.isAdminDrawerOpen = action.payload
        },
        setSubscription: (state, action) => {
            state.subscription = action.payload
        }
    }
})

export const { login, logout, setGlobalContext, setIsAdminDrawerOpen, setSubscription } = userSlice.actions

export default userSlice.reducer