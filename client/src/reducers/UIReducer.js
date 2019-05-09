import { ENQUEUE_SNACKBAR, REMOVE_SNACKBAR, INITIALIZE_FORM_STARTED, INITIALIZE_FORM_SUCCESS } from '../actions/constant-types';

const initialState = {
  notifications: [],
  formValueStatus: null,
  formValues: {
    statesList: [],
    vehicleColorsList: [],
    vehicleMakesList: [],
    permitTypesList: [],
    swapPeriod: 0,
    swapsAllowedDefault: 0,
  },
};

const UIReducer = (state = initialState, action) => {
  switch (action.type) {
    case ENQUEUE_SNACKBAR:
      return {
        ...state,
        notifications: [
          ...state.notifications,
          {
            ...action.notification,
          },
        ],
      };
    case REMOVE_SNACKBAR:
      return {
        ...state,
        notifications: state.notifications.filter(notification => notification.key !== action.key),
      };
    case INITIALIZE_FORM_STARTED:
      return {
        ...state,
        formValueStatus: action.payload.formValueStatus,
      };
    case INITIALIZE_FORM_SUCCESS:
      return {
        ...state,
        formValueStatus: action.payload.formValueStatus,
        formValues: action.payload.formValues,
      };
    default:
      return state;
  }
};

export default UIReducer;
