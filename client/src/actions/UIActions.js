import { ENQUEUE_SNACKBAR, REMOVE_SNACKBAR, INITIALIZE_FORM_STARTED, INITIALIZE_FORM_SUCCESS } from './../actions/constant-types';
import axios from 'axios';

export const enqueueSnackbar = notification => ({
  type: ENQUEUE_SNACKBAR,
  notification: {
    key: new Date().getTime() + Math.random(),
    ...notification,
  },
});

export const removeSnackbar = key => ({
  type: REMOVE_SNACKBAR,
  key,
});

export const initializeForm = () => {
  return (dispatch, getState) => {
    initializeFormStart('started');
    axios
      .all([
        axios.get(`/api/utils/getVehicleMakesList`),
        axios.get(`/api/utils/getVehicleColorsList`),
        axios.get(`/api/utils/getStatesList`),
        axios.get(`/api/utils/getPermitTypes`),
      ])
      .then(
        axios.spread((vehicleMakesList, vehicleColorsList, statesList, permitTypesList) => {
          let formValues = {
            statesList: statesList.data.data,
            vehicleColorsList: vehicleColorsList.data.data,
            vehicleMakesList: vehicleMakesList.data.data,
            permitTypesList: permitTypesList.data.data,
          };
          dispatch(initializeFormSuccess('success', formValues));
        })
      )
      .catch(err => console.log(err.response));
  };
};

const initializeFormStart = started => ({
  type: INITIALIZE_FORM_STARTED,
  payload: {
    formValueStatus: started,
  },
});

const initializeFormSuccess = (success, formValues) => ({
  type: INITIALIZE_FORM_SUCCESS,
  payload: {
    formValueStatus: success,
    formValues: formValues,
    swapPeriod: 0,
    swapsAllowedDefault: 0,
  },
});
