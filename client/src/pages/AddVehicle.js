import React from 'react';
import { Typography } from '@material-ui/core';
import { connect } from 'react-redux';
import { formValueSelector } from 'redux-form';
import { withRouter } from 'react-router-dom';
import VehicleForm from '../forms/VehicleForm';
import { fetchHelper } from '../actions/AuthActions';
import { enqueueSnackbar } from '../actions/UIActions';
import axios from 'axios';

const selector1 = formValueSelector('PermitForm');
const selector2 = formValueSelector('VehiclesForm');

const registerVehicle = (values, props) => {
  if (props.unauthenticated !== true) {
    const url = `/api/users/specific/${props.username}/addCar`;
    const body = JSON.stringify({
      make: values.make,
      model: values.model,
      year: values.year,
      color: values.color,
      tag: values.tag,
      state: values.state,
    });
    props
      .fetchHelp()
      .then(res => {
        axios
          .post(url, body, {
            headers: res.headers,
          })
          .then(res => {
            if (res.status !== 400) {
              props.dispatch(
                enqueueSnackbar({
                  message: `Successfully added vehicle`,
                })
              );
              props.history.goBack();
            }
          })
          .catch(err => {
            if (err.response.status === 400) {
              props.dispatch(
                enqueueSnackbar({
                  message: `${err.response.data.message}`,
                  options: {
                    variant: 'warning',
                  },
                })
              );
            }
          });
      })
      .catch(err => {
        console.log(err);
      });
  } else {
    const car = {
      licensePlate: {
        tag: values.tag,
        state: values.state,
      },
      make: values.make,
      model: values.model,
      year: values.year,
      color: values.color,
    };
    props.history.push({
      pathname: '/unauthenticated/page-3',
      state: { selectedVehicle: car },
    });
  }
};

export const AddVehicle = props => {
  return (
    <React.Fragment>
      {props.unauthenticated ? (
        <Typography variant='h4' gutterBottom component='h4'>
          Enter New Vehicle Information
        </Typography>
      ) : (
        <Typography variant='h4' gutterBottom component='h4'>
          Please Select a Vehicle or Add a New One
        </Typography>
      )}
      <VehicleForm onSubmit={values => registerVehicle(values, props)} unauthenticated={props.unauthenticated} />
    </React.Fragment>
  );
};

const mapStateToProps = (state, ownProps) => {
  if (ownProps.unauthenticated) {
    return {
      values: selector2(state, 'make', 'model', 'year', 'color', 'state', 'tag'),
    };
  }
  return {
    username: state.auth.user.username,
    values: selector1(state, 'make', 'model', 'year', 'color', 'state', 'tag'),
  };
};

const mapDispatchToProps = dispatch => ({
  fetchHelp: (url, method, header, body) => dispatch(fetchHelper(url, method, header, body)),
  dispatch,
});

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(AddVehicle)
);
