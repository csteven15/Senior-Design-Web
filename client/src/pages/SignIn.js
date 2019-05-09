import React from 'react';
import { Typography, Button, Paper, Grid, withStyles } from '@material-ui/core';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import SignInForm from '../forms/SignInForm';
import { userSignIn, guestForm } from '../actions/AuthActions';

const knights = require('../images/knights.png');

const mapDispatchToProps = dispatch => ({
  signIn: values => dispatch(userSignIn(values)),
  guestForm: () => dispatch(guestForm()),
});

const styles = theme => ({
  layout: {
    width: 'auto',
    display: 'block', // Fix IE 11 issue.
    marginLeft: theme.spacing.unit * 1,
    marginRight: theme.spacing.unit * 1,
    [theme.breakpoints.up(400 + theme.spacing.unit * 3 * 2)]: {
      width: 400,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
  paper: {
    marginTop: theme.spacing.unit * 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme.spacing.unit * 3}px`,
  },
});

const SignIn = props => {
  const { classes } = props;
  return (
    <div className={classes.layout}>
      <Paper className={classes.paper}>
        <img src={knights} alt='knight' />
        <Typography component='h1' variant='h5'>
          Sign In
        </Typography>
        <SignInForm onSubmit={values => props.signIn(values)} />
        <br />
        <Grid container>
          <Grid item xs={12}>
            <Button
              type='button'
              variant='contained'
              color='secondary'
              className={classes.submit}
              onClick={() => {
                props.history.push('/unauthenticated/page-1');
                props.guestForm();
              }}
              fullWidth
            >
              <Typography varient='h6'>Continue As Guest</Typography>
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
};

export default compose(
  withRouter,
  connect(
    null,
    mapDispatchToProps
  ),
  withStyles(styles)
)(SignIn);
