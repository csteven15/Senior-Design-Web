import {
  USER_SIGNIN_ERROR,
  USER_SIGNIN_SUCCESS,
  USER_SIGNIN_STARTED,
  USER_SIGNOUT_ERROR,
  USER_SIGNOUT_SUCCESS,
  USER_SIGNOUT_STARTED,
  GUEST_FORM,
  FINISH_GUEST_FORM,
  SET_USER_DATA,
  UPDATE_USER_CURRENT_SESSION,
  FAILED_TO_UPDATE_USER_CURRENT_SESSION,
} from '../actions/constant-types';

const initialState = {
  authData: null,
  authState: 'guest',
  user: {
    allowedPermits: ['Visistor'],
    accountLevel: 0,
  },
  error: null,
  guestForm: false,
};

const AuthReducer = (state = initialState, action) => {
  switch (action.type) {
    case USER_SIGNIN_STARTED:
      return {
        ...state,
        loading: true,
      };
    case USER_SIGNIN_SUCCESS:
      return {
        ...state,
        loggedIn: true,
        loading: false,
        error: null,
        authState: action.payload.authState,
        authData: action.payload.authData,
        guestForm: action.payload.guestForm,
      };
    case USER_SIGNIN_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
      };
    case USER_SIGNOUT_STARTED:
      return {
        ...state,
        loading: true,
      };
    case USER_SIGNOUT_SUCCESS:
      return {
        ...state,
        loggedIn: false,
        loading: false,
        error: null,
        authState: action.payload.authState,
        authData: action.payload.authData,
        guestForm: action.payload.guestForm,
        user: action.payload.user,
      };
    case USER_SIGNOUT_ERROR:
      return {
        ...state,
        username: null,
        loading: false,
        error: action.payload.error,
      };
    case GUEST_FORM:
      return {
        ...state,
        guestForm: action.payload.guestForm,
      };
    case FINISH_GUEST_FORM:
      return {
        ...state,
        guestForm: action.payload.guestForm,
      };
    case SET_USER_DATA:
      return {
        ...state,
        user: action.payload.user,
      };
    case UPDATE_USER_CURRENT_SESSION:
      return {
        ...state,
        authState: action.payload.authState,
        authData: action.payload.authData,
        guestForm: action.payload.guestForm,
      };
    case FAILED_TO_UPDATE_USER_CURRENT_SESSION:
      return {
        ...state,
        authState: action.payload.authState,
        authData: action.payload.authData,
        guestForm: action.payload.guestForm,
        user: action.payload.user,
      };
    default:
      return state;
  }
};

export default AuthReducer;
