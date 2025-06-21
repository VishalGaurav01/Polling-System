import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  confusionAlerts: [],
  hasUnreadAlerts: false
};

const confusionSlice = createSlice({
  name: 'confusion',
  initialState,
  reducers: {
    alertReceived: (state, action) => {
      state.confusionAlerts.push({
        ...action.payload,
        timestamp: new Date().toISOString(),
        id: Date.now()
      });
      state.hasUnreadAlerts = true;
    },
    markAlertsAsRead: (state) => {
      state.hasUnreadAlerts = false;
    },
    clearAlerts: (state) => {
      state.confusionAlerts = [];
      state.hasUnreadAlerts = false;
    }
  }
});

export const { alertReceived, markAlertsAsRead, clearAlerts } = confusionSlice.actions;
export const selectConfusionAlerts = state => state.confusion.confusionAlerts;
export const selectHasUnreadAlerts = state => state.confusion.hasUnreadAlerts;

export default confusionSlice.reducer;