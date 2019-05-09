import React from 'react';
import { Typography, withStyles } from '@material-ui/core';
import { compose } from 'recompose';
import { formValueSelector } from 'redux-form';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import UserForm from '../forms/UserForm';
import { fetchHelper } from '../actions/AuthActions';
import { enqueueSnackbar } from '../actions/UIActions';
import axios from 'axios';

const styles = theme => ({
  content: {
    flexGrow: 1,
    padding: theme.spacing.unit * 1,
  },
});

const userSignUp = props => {
  const { values, allowedPermits, spaceNumber } = props;
  const filteredAllowedPermits = allowedPermits.map(permit =>
    permit === 'A'
      ? {
          permitType: permit,
          spaceNumber,
        }
      : {
          permitType: permit,
        }
  );
  let url = '';
  if (props.create) url = '/api/users/initializeNewUser';
  if (props.update) url = `/api/users/specific/${props.location.state.username}/updateManyFields`;
  const body = {
    firstName: values.firstname,
    middleInitial: values.middleinitial,
    lastName: values.lastname,
    phoneNumber: values.phone,
    addressLine1: values.streetAddress1,
    addressLine2: values.streetAddress2,
    city: values.city,
    state: values.state,
    zipCode: values.zip,
    accountLevel: values.level,
    allowedPermits: filteredAllowedPermits,
  };
  if (props.create) {
    body.username = values.username;
    body.emailAddress = values.email;
    body.password = values.password;
  }
  if (props.update) {
    body.swapsAllowed = values.swapsAllowed;
  }
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
                message: props.update ? 'Successfully updated user' : 'Successfully created user',
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
};

const selector = formValueSelector('UserForm');

class Users extends React.Component {
  state = {
    initData: null,
  };

  componentDidMount() {
    if (this.props.update) {
      this.fetchData();
    }
  }

  fetchData = () => {
    this.props
      .fetchHelp()
      .then(res => {
        axios
          .get(`/api/users/specific/${this.props.location.state.username}`, {
            headers: res.headers,
          })
          .then(res => {
            if (res.status !== 400) {
              this.props.dispatch(
                enqueueSnackbar({
                  message: `Fetched user data`,
                })
              );
              this.setState({ initData: res.data });
            } else {
              this.props.dispatch(
                enqueueSnackbar({
                  message: `${res.data}`,
                  options: {
                    variant: 'warning',
                  },
                })
              );
            }
          })
          .catch(err => {
            if (err.response.status === 400) {
              this.props.dispatch(
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
  };

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.content}>
        {this.props.create ? (
          <Typography variant='h4' gutterBottom component='h4'>
            Register a New User
          </Typography>
        ) : (
          <Typography variant='h4' gutterBottom component='h4'>
            Update User
          </Typography>
        )}
        <UserForm onSubmit={() => userSignUp(this.props)} update={this.props.update} create={this.props.create} initData={this.state.initData} />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  allowedPermits: selector(state, 'permitType'),
  spaceNumber: selector(state, 'spaceNumber'),
  values: selector(
    state,
    'username',
    'email',
    'firstname',
    'middleinitial',
    'lastname',
    'password',
    'phone',
    'streetAddress1',
    'streetAddress2',
    'city',
    'state',
    'zip',
    'level',
    'swapsAllowed'
  ),
});

const mapDispatchToProps = dispatch => ({
  fetchHelp: (url, method, header, body) => dispatch(fetchHelper(url, method, header, body)),
  dispatch,
});

export default compose(
  withRouter,
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  withStyles(styles)
)(Users);
