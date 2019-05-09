import React from 'react';
import { Typography, withStyles } from '@material-ui/core';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { fetchHelper } from '../actions/AuthActions';
import { enqueueSnackbar } from '../actions/UIActions';
import VehicleForm from '../forms/VehicleForm';
import axios from 'axios';

const editVehicle = (values, props) => {
  const url = `/api/users/specific/${props.username}/updateCar`;
  const body = JSON.stringify({
    id: props.location.state.carData._id,
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
                message: `Successfully updated vehicle`,
              })
            );
            props.history.goBack();
          } else {
            this.props.dispatch(
              enqueueSnackbar({
                message: `Failed to update vehicle`,
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
};

const styles = theme => ({
  content: {
    flexGrow: 1,
    padding: theme.spacing.unit * 1,
    height: '100vh',
    overflow: 'auto',
  },
});

const EditVehicle = props => {
  const { classes } = props;
  return (
    <div className={classes.content}>
      <Typography variant='h4' gutterBottom component='h4'>
        Edit Vehicle Information
      </Typography>
      <VehicleForm edit={true} onSubmit={values => editVehicle(values, props)} />
    </div>
  );
};

const mapStateToProps = state => ({
  username: state.auth.user.username,
});

const mapDispatchToProps = dispatch => ({
  fetchHelp: (url, method, header, body) => dispatch(fetchHelper(url, method, header, body)),
  dispatch,
});

export default compose(
  withStyles(styles),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(EditVehicle);
