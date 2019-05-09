import React from 'react';
import { Grid, Button, Checkbox, Select, MenuItem, FormControl, FormControlLabel, InputLabel, FormHelperText, TextField } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { compose } from 'recompose';
import { Field, reduxForm, formValueSelector } from 'redux-form';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { fetchHelper } from '../actions/AuthActions';
import { enqueueSnackbar } from '../actions/UIActions';
import axios from 'axios';

function convertToUserLevel(value) {
  if (value === '100') {
    return 'Standard';
  } else if (value === '200') {
    return 'Enforcer';
  } else {
    return 'Administrator';
  }
}

const validate = (values, props) => {
  const errors = {};
  const requiredFields = ['username', 'firstname', 'lastname', 'email', 'streetAddress1', 'city', 'state', 'level', 'phone', 'state', 'zip', 'level'];
  if (typeof values.permitType === 'undefined') {
    errors['permitType'] = 'Required';
  } else if (values.permitType.length === 0) {
    errors['permitType'] = 'Required';
  }
  if (props.create) requiredFields.push('password');
  if (props.update) requiredFields.push('swapsAllowed');
  if (values.permitType && values.permitType.includes('A')) requiredFields.push('spaceNumber');
  requiredFields.forEach(field => {
    if (!values[field]) {
      errors[field] = 'Required';
    }
  });
  if (values.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = 'Invalid email address';
  }
  return errors;
};

const renderTextField = ({ label, input, disabled, autoComplete, meta: { touched, invalid, error }, ...custom }) => (
  <TextField
    disabled={disabled}
    label={label}
    placeholder={label}
    autoComplete={autoComplete}
    error={touched && invalid}
    helperText={touched && error}
    {...input}
    {...custom}
  />
);

const renderFromHelper = ({ touched, error }) => {
  if (touched && error) {
    return <FormHelperText style={{ color: '#f44336' }}>{touched && error}</FormHelperText>;
  }
  if (!touched) {
    return <FormHelperText>{error}</FormHelperText>;
  }
  if (error) {
    return <FormHelperText style={{ color: '#f44336' }}>{error}</FormHelperText>;
  }
  return null;
};

const renderSelectField = ({ input, label, meta: { touched, error }, children }) => (
  <FormControl error={touched && error} margin='normal' required fullWidth>
    <InputLabel htmlFor={label}>{label}</InputLabel>
    <Select
      {...input}
      inputProps={{
        name: label,
        id: label,
      }}
    >
      {children}
    </Select>
    {renderFromHelper({ touched, error })}
  </FormControl>
);

const renderCheckbox = ({ input, label, options, meta: { touched, error } }) => (
  <React.Fragment>
    {options.map(option => (
      <FormControl key={option.permitType}>
        <FormControlLabel
          control={
            <Checkbox
              checked={input.value.indexOf(option.permitType) !== -1}
              onChange={event => {
                const newValue = [...input.value];
                if (event.target.checked) {
                  // input.value[option.permit] = false;
                  newValue.push(option.permitType);
                } else {
                  // input.value[option.permit] = true;
                  newValue.splice(newValue.indexOf(option.permitType), 1);
                }
                return input.onChange(newValue);
              }}
            />
          }
          label={option.permitType}
        />
      </FormControl>
    ))}
    {renderFromHelper({ touched, error })}
  </React.Fragment>
);

const selector = formValueSelector('UserForm');

const styles = theme => ({
  submit: {
    marginTop: theme.spacing.unit * 3,
  },
  buttons: {
    display: 'flex',
    justifyContent: 'space-between',
  },
});

class UserForm extends React.Component {
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.initData !== this.props.initData) {
      this.updateForm();
      return true;
    }
    return false;
  }

  updateForm = () => {
    const initData = {
      username: this.props.initData.username,
      email: this.props.initData.emailAddress,
      firstname: this.props.initData.firstName,
      middleinitial: this.props.initData.middleInitial,
      lastname: this.props.initData.lastName,
      phone: this.props.initData.phoneNumber,
      streetAddress1: this.props.initData.addressLine1,
      streetAddress2: this.props.initData.addressLIne2,
      city: this.props.initData.city,
      state: this.props.initData.state,
      zip: this.props.initData.zipCode,
      level: this.props.initData.accountLevel,
      spaceNumber: this.props.initData.spaceNumber,
      swapsAllowed: this.props.initData.swapsAllowed,
      permitType: [],
    };
    this.props.initData.allowedPermits.map(permit => {
      initData.permitType.push(permit.permitType);
      if (permit.permitType === 'A') initData.spaceNumber = permit.spaceNumber;
      return null;
    });
    this.props.initialize(initData);
  };

  deleteUser = () => {
    this.props
      .fetchHelp()
      .then(res => {
        let username = this.props.location.state.username;
        let body = {
          username: username,
        };
        axios
          .post('/api/users/deleteUser', body, {
            headers: res.headers,
          })
          .then(res => {
            if (res.status !== 400) {
              this.props.dispatch(
                enqueueSnackbar({
                  message: `Successfully deleted ${username} `,
                })
              );
              this.props.history.goBack();
            } else {
              this.props.dispatch(
                enqueueSnackbar({
                  message: `Failed to delete ${username} `,
                  options: {
                    variant: 'warning',
                  },
                })
              );
            }
          })
          .catch(err => console.log(err.response));
      })
      .catch(err => console.log(err));
  };

  renderSwapsAllowed = () => {
    if (this.props.update) {
      return (
        <Grid item sm={6} xs={12}>
          <FormControl margin='normal' required fullWidth>
            <Field name='swapsAllowed' component={renderTextField} label='Swaps Allowed' autoFocus />
          </FormControl>
        </Grid>
      );
    }
    return null;
  };

  render() {
    const states = this.props.globalFormValues.statesList;
    const levels = ['100', '200', '300'];
    const permits = this.props.globalFormValues.permitTypesList;
    const { handleSubmit, classes } = this.props;
    return (
      <form onSubmit={handleSubmit}>
        <Grid container spacing={24}>
          <Grid item sm={6} xs={12}>
            <FormControl margin='normal' required fullWidth>
              <Field name='username' component={renderTextField} label='Username' autoFocus disabled={this.props.update} />
            </FormControl>
          </Grid>
          <Grid item sm={6} xs={12}>
            <FormControl margin='normal' required fullWidth>
              <Field name='email' component={renderTextField} label='Email' autoFocus disabled={this.props.update} />
            </FormControl>
          </Grid>
          <Grid item sm={6} xs={12}>
            <FormControl margin='normal' required fullWidth>
              <Field name='firstname' component={renderTextField} label='First Name' autoFocus />
            </FormControl>
          </Grid>
          <Grid item sm={6} xs={12}>
            <FormControl margin='normal' required fullWidth>
              <Field name='middleinitial' component={renderTextField} label='Middle Initial' autoFocus />
            </FormControl>
          </Grid>
          <Grid item sm={6} xs={12}>
            <FormControl margin='normal' required fullWidth>
              <Field name='lastname' component={renderTextField} label='Last Name' autoFocus />
            </FormControl>
          </Grid>
          <Grid item sm={6} xs={12}>
            <FormControl margin="normal" required fullWidth>
              <Field
                name="password"
                component={renderTextField}
                label="Password"
                autoFocus
                disabled={this.props.update}
                type="password"
              />
            </FormControl>
          </Grid>
          <Grid item sm={6} xs={12}>
            <FormControl margin='normal' required fullWidth>
              <Field name='phone' component={renderTextField} label='Phone' autoFocus />
            </FormControl>
          </Grid>
          <Grid item sm={6} xs={12}>
            <FormControl margin='normal' required fullWidth>
              <Field name='streetAddress1' component={renderTextField} label='Street Address 1' autoFocus />
            </FormControl>
          </Grid>
          <Grid item sm={6} xs={12}>
            <FormControl margin='normal' required fullWidth>
              <Field name='streetAddress2' component={renderTextField} label='Street Address 2' autoFocus />
            </FormControl>
          </Grid>
          <Grid item sm={6} xs={12}>
            <FormControl margin='normal' required fullWidth>
              <Field name='city' component={renderTextField} label='City' autoFocus />
            </FormControl>
          </Grid>
          <Grid item sm={6} xs={12}>
            <Field name='state' component={renderSelectField} label='State'>
              {states.map((state, key) => (
                <MenuItem key={key} value={state}>
                  {state}
                </MenuItem>
              ))}
            </Field>
          </Grid>
          <Grid item sm={6} xs={12}>
            <FormControl margin='normal' required fullWidth>
              <Field name='zip' component={renderTextField} label='Zip Code' autoFocus />
            </FormControl>
          </Grid>
          <Grid item sm={6} xs={12}>
            <Field name='level' component={renderSelectField} label='Level'>
              {levels.map((level, key) => (
                <MenuItem key={key} value={level}>
                  {convertToUserLevel(level)}
                </MenuItem>
              ))}
            </Field>
          </Grid>
          {this.renderSwapsAllowed()}
          <Grid item xs={12} />
          <Grid item xs={12}>
            <Field name='permitType' options={permits} component={renderCheckbox} label={permits} />
          </Grid>
          {this.props.values.permitType && this.props.values.permitType.includes('A') ? (
            <Grid item sm={6} xs={12}>
              <FormControl margin='normal' required fullWidth>
                <Field name='spaceNumber' component={renderTextField} label='Space Number' autoFocus />
              </FormControl>
            </Grid>
          ) : null}
        </Grid>
        <br />
        <div className={classes.buttons}>
          <Button type='button' variant='contained' color='default' className={classes.submit} onClick={() => this.props.history.goBack()}>
            Back
          </Button>
          {this.props.update ? (
            <Button type='button' variant='contained' color='secondary' className={classes.submit} onClick={() => this.deleteUser()}>
              Delete
            </Button>
          ) : null}
          <Button type='submit' variant='contained' color='primary' className={classes.submit}>
            {this.props.create ? 'Create' : 'Update'}
          </Button>
        </div>
      </form>
    );
  }
}

const mapStateToProps = state => ({
  values: selector(
    state,
    'username',
    'email',
    'firstname',
    'lastname',
    'middleinitial',
    'phone',
    'streetAddress1',
    'streetAddress2',
    'city',
    'state',
    'zip',
    'level',
    'permitType',
    'swapsAllowed'
  ),
  globalFormValues: state.ui.formValues,
});

const mapDispatchToProps = dispatch => ({
  fetchHelp: (url, method, header, body) => dispatch(fetchHelper(url, method, header, body)),
  dispatch,
});

export default compose(
  withRouter,
  reduxForm({
    form: 'UserForm',
    validate,
  }),
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  withStyles(styles)
)(UserForm);
