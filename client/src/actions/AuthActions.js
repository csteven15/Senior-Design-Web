import { Auth } from 'aws-amplify';
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
} from './constant-types';
import { enqueueSnackbar } from './UIActions';

export const fetchHelper = header => {
  return dispatch => {
    return Auth.currentSession()
      .then(session => {
        updateAuthState(session);
        if (!header) {
          header = {
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + session.accessToken.jwtToken,
            },
          };
        }
        return header;
      })
      .catch(err => {
        failedToUpdateAuthState(err);
      });
  };
};

const updateAuthState = data => ({
  type: UPDATE_USER_CURRENT_SESSION,
  payload: {
    authState: 'not guest',
    authData: data,
    guestForm: false,
  },
});

const failedToUpdateAuthState = data => ({
  type: FAILED_TO_UPDATE_USER_CURRENT_SESSION,
  payload: {
    authData: null,
    authState: 'guest',
    guestForm: false,
    user: null,
  },
});

export const userSignIn = values => {
  return dispatch => {
    userSignInStarted();
    Auth.signIn(values.username, values.password)
      .then(cognitoUser => {
        const headers = {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + cognitoUser.signInUserSession.accessToken.jwtToken,
        };
        fetch('/api/users/specific/' + cognitoUser.username, {
          method: 'GET',
          headers: headers,
          body: null,
        })
          .then(res => res.json())
          .then(data => {
            dispatch(setUserData(data));
            Auth.currentSession()
              .then(session => {
                dispatch(userSignInSuccess(session));
                dispatch(
                  enqueueSnackbar({
                    message: 'Sign In Success',
                  })
                );
              })
              .catch(error => {
                failedToUpdateAuthState(error);
              });
          });
      })
      .catch(error => {
        dispatch(userSignInError(error));
        dispatch(
          enqueueSnackbar({
            message: 'Wrong Sign In Credentials',
            options: {
              variant: 'warning',
            },
          })
        );
      });
  };
};

const userSignInSuccess = user => ({
  type: USER_SIGNIN_SUCCESS,
  payload: {
    authState: 'not guest',
    authData: user,
    guestForm: false,
  },
});

const userSignInStarted = () => ({
  type: USER_SIGNIN_STARTED,
});

const userSignInError = error => ({
  type: USER_SIGNIN_ERROR,
  payload: {
    error,
  },
});

export const userSignOut = () => {
  return dispatch => {
    userSignOutStarted();
    Auth.signOut()
      .then(user => dispatch(userSignOutSuccess(user)))
      .catch(error => dispatch(userSignOutError(error)));
  };
};

const userSignOutSuccess = data => ({
  type: USER_SIGNOUT_SUCCESS,
  payload: {
    authData: null,
    authState: 'guest',
    guestForm: false,
    user: {
      allowedPermits: ['Visistor'],
      accountLevel: 0,
    },
  },
});

const userSignOutStarted = () => ({
  type: USER_SIGNOUT_STARTED,
});

const userSignOutError = error => ({
  type: USER_SIGNOUT_ERROR,
  payload: {
    error,
  },
});

export const guestForm = () => ({
  type: GUEST_FORM,
  payload: {
    guestForm: true,
  },
});

export const finishGuestForm = () => ({
  type: FINISH_GUEST_FORM,
  payload: {
    guestForm: false,
  },
});

const setUserData = user => ({
  type: SET_USER_DATA,
  payload: {
    user: user,
  },
});
