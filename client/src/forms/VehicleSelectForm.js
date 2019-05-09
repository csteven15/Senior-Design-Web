import React from 'react';
import { Grid, Button, withStyles, Typography } from '@material-ui/core';
import { withRouter } from 'react-router-dom';
import { Field, reduxForm, change } from 'redux-form';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { fetchHelper } from '../actions/AuthActions';
import GenericCard from '../components/generic/GenericCard';
import { enqueueSnackbar } from '../actions/UIActions';
import axios from 'axios';

const styles = theme => ({
  content: {
    flexGrow: 1,
    padding: theme.spacing.unit * 3,
    overflow: 'auto',
  },
  buttons: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  button: {
    marginTop: theme.spacing.unit * 3,
    marginLeft: theme.spacing.unit,
    textDecoration: 'none',
  },
});

class VehicleSelectForm extends React.Component {
  state = {
    carsData: null,
  };

  componentDidMount() {
    if (this.props.unauthenticated !== true) {
      this.fetchCarsData();
    }
  }

  componentWillUnmount() {
    this.setState({ carsData: null });
  }

  removeCard = id => {
    const array = this.state.carsData;
    array.splice(id, 1);
    this.setState({ carsData: array });
  };

  updateCar = car => {
    const data = {
      id: this.props.location.state.id,
      car,
    };
    this.props
      .fetchHelp()
      .then(res => {
        axios
          .post('/api/permits/updatePermitCar', data, {
            headers: res.headers,
          })
          .then(res => {
            if (res.status !== 400) {
              this.props.history.goBack();
              this.props.dispatch(
                enqueueSnackbar({
                  message: 'Successfully swapped vehicles.',
                })
              );
            }
          })
          .catch(err => {
            if (err.response.status === 400) {
              let date = new Date(null);
              date.setSeconds(err.response.data.remainingWaitTime); // specify value for SECONDS here
              let result = date.toISOString().substr(11, 8);
              this.props.dispatch(
                enqueueSnackbar({
                  message: `Too many swaps. Remaining time: ${result}`,
                  options: {
                    variant: 'warning',
                  },
                })
              );
            }
          });
      })
      .catch(err => console.log(err));
  };

  fetchCarsData() {
    this.props
      .fetchHelp()
      .then(res => {
        axios
          .get(`/api/users/specific/${this.props.username}/field/cars`, {
            headers: res.headers,
          })
          .then(res => {
            if (res.status !== 400) {
              this.setState({ carsData: res.data.value });
            } else {
              this.props.dispatch(
                enqueueSnackbar({
                  message: `Too many swaps. Remaining time: ${res.data.remainingWaitTime}`,
                  options: {
                    variant: 'warning',
                  },
                })
              );
            }
          });
      })
      .catch(err => console.log(err));
  }

  renderCards() {
    if (this.state.carsData && this.state.carsData.length > 0) {
      return (
        <Grid container spacing={24}>
          {this.state.carsData.map((data, key) => {
            const car = data;
            const onClick = () => {
              if (this.props.changeVehicle === true) {
                this.updateCar(car);
              } else {
                this.props.dispatch(change('PermitForm', 'vehicle', car._id));
                this.props.history.push({
                  pathname: '/authenticated/page-3',
                  state: { selectedVehicle: car },
                });
              }
            };

            const subheader = (
              <Typography variant='h6' onClick={onClick}>
                {`${car.year} ${car.make} ${car.model}`}
              </Typography>
            );

            const content = <Typography variant='body1'>({`${car.color} ${car.licensePlate.state} ${car.licensePlate.tag}`})</Typography>;
            return (
              <Grid item xs={12} md={4} key={key}>
                <GenericCard subheader={subheader} cardcontent={content} onClick={onClick} action='car' cardata={data} removeCard={this.removeCard} id={key} />
              </Grid>
            );
          })}
        </Grid>
      );
    }
    return (
      <Grid item xs={12}>
        <Typography variant='h6'>
          You have no vehicles!
          </Typography>
        <Typography variant='h6'>
          Press the plus button to add a vehicle.
          </Typography>
      </Grid>
    );
  }

  render() {
    const { classes, handleSubmit } = this.props;
    return (
      <div className={classes.content}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={24}>
            <Grid item xs={12}>
              <Field name='vehicle' component='input' type='hidden' />
              {this.renderCards()}
            </Grid>
          </Grid>
          <br />
          {this.props.changeVehicle === true ? null : (
            <div className={classes.buttons}>
              <Button type='button' variant='contained' color='secondary' onClick={() => this.props.history.goBack()}>
                Back
              </Button>
              <Button type='submit' variant='contained' color='secondary' disabled>
                Please Click on a Vehicle
              </Button>
            </div>
          )}
        </form>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  if (ownProps.unauthenticated) {
    return {};
  }
  return {
    guestForm: state.auth.guestForm,
    username: state.auth.user.username,
  };
};

const mapDispatchToProps = dispatch => ({
  fetchHelp: (url, method, header, body) => dispatch(fetchHelper(url, method, header, body)),
});

export default compose(
  withRouter,
  reduxForm({
    form: 'PermitForm',
    destroyOnUnmount: false,
    forceUnregisterOnUnmount: true,
    initialValues: {
      vehicle: '',
    },
  }),
  withStyles(styles),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(VehicleSelectForm);
