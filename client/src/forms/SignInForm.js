import React from 'react';
import { Grid, Button, TextField, FormControl, withStyles } from '@material-ui/core';
import { compose } from 'recompose';
import { Field, reduxForm } from 'redux-form';

const renderTextField = ({ label, input, type, autoComplete }) => (
  <TextField label={label} placeholder={label} type={type} autoComplete={autoComplete} {...input} />
);

const styles = theme => ({
  layout: {
    width: 'auto',
    display: 'block', // Fix IE 11 issue.
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
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
  avatar: {
    margin: theme.spacing.unit,
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing.unit,
  },
  submit: {
    marginTop: theme.spacing.unit * 3,
  },
});

const SignInForm = props => {
  const { classes, handleSubmit } = props;
  return (
    <form className={classes.form} onSubmit={handleSubmit}>
      <FormControl margin='normal' required fullWidth>
        <Field name='username' component={renderTextField} label='NID' autoFocus autoComplete='username' />
      </FormControl>
      <FormControl margin='normal' required fullWidth>
        <Field name='password' component={renderTextField} label='Password' autoFocus autoComplete='current-password' type='password' />
      </FormControl>

      <Grid container>
        <Grid item xs={12}>
          <Button type='submit' variant='contained' color='secondary' className={classes.submit} fullWidth>
            Sign In
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default compose(
  reduxForm({
    form: 'signInForm',
  }),
  withStyles(styles)
)(SignInForm);
