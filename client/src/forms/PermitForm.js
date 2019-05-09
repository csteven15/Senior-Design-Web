import React from 'react';
import { Button, Select, withStyles, MenuItem, FormLabel, InputLabel, FormHelperText, FormControl, Grid } from '@material-ui/core';
import { reset, formValueSelector, reduxForm, Field, change } from 'redux-form';
import { withRouter } from 'react-router-dom';
import { InlineDatePicker } from 'material-ui-pickers';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { finishGuestForm } from '../actions/AuthActions';

const styles = () => ({
  button: {
    margin: 12,
  },
  imageInput: {
    cursor: 'pointer',
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    width: '100%',
    opacity: 0,
  },
  FFS: {
    position: 'absolute',
    lineHeight: '1.5',
    top: '38',
    transition: 'none',
    zIndex: '1',
    transform: 'none',
    transformOrigin: 'none',
    pointerEvents: 'none',
    userSelect: 'none',
    fontSize: '16',
    color: 'rgba(0, 0, 0, 0.8)',
  },
  buttons: {
    display: 'flex',
    justifyContent: 'space-between',
  },
});

const validate = values => {
  const errors = {};
  const requiredFields = ['permit', 'endDate'];
  requiredFields.forEach(field => {
    if (!values[field]) {
      errors[field] = 'Required';
    }
  });
  if (values.startDate && values.endDate) {
    if (new Date(values.startDate) > new Date(values.endDate)) {
      errors.endDate = "End Date can't be before Start Date";
    }
  }
  return errors;
};

const DateTimePickerRow = props => {
  const {
    showErrorsInline,
    input: { onChange, value },
    meta: { touched, error },
    maxDate,
    minDate,
  } = props;
  const showError = showErrorsInline || touched;

  return (
    <InlineDatePicker
      keyboard={false}
      clearable
      disableOpenOnEnter
      error={!!(showError && error)}
      helperText={showError && error}
      value={value}
      onChange={onChange}
      minDate={minDate}
      maxdate={maxDate}
      disablePast
      format='MM/dd/yyyy'
      mask={date => (date ? [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/] : [])}
    />
  );
};

const renderFromHelper = ({ touched, error }) => {
  if (touched && error) {
    return <FormHelperText>{touched && error}</FormHelperText>;
  }
  return null;
};

const renderSelectField = ({ input, label, meta: { touched, error }, children }) => (
  <FormControl error={touched && error} margin='normal' required fullWidth>
    <InputLabel htmlFor={label}>{label}</InputLabel>
    <Select
      {...input}
      inputProps={{
        name: label.toLowerCase(),
        id: label,
      }}
    >
      {children}
    </Select>
    {renderFromHelper({ touched, error })}
  </FormControl>
);

const selector = formValueSelector('PermitForm');
class PermitForm extends React.Component {
  state = {
    price: null,
    permitType: null,
    startDate: null,
    endDate: null,
  };

  generatePrice = prevProps => {
    if (this.props.permitValues.permit && this.props.permitValues.startDate && this.props.permitValues.endDate) {
      const startDate = new Date(this.props.permitValues.startDate).getTime();
      const endDate = new Date(this.props.permitValues.endDate).getTime();
      let permitType = this.props.permitValues.permit;
      if (this.props.unauthenticated) {
        permitType = {
          permitType: 'Visitor',
        };
      }
      let newStartDate = new Date(startDate);
      newStartDate.setHours(0, 0, 0, 0);
      let newEndDate = new Date(endDate);
      newEndDate.setHours(23, 59, 59, 999);
      if (newStartDate <= newEndDate && this.props.permitValues !== prevProps.permitValues) {
        this.fetchData(permitType, newStartDate, newEndDate);
      }
    }
  };

  fetchData = (permitType, startDate, endDate) => {
    fetch(`/api/utils/calculatePermitPrice/${permitType.permitType}/${startDate.getTime()}/${endDate.getTime()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: null,
    })
      .then(res => res.json())
      .then(res => {
        this.props.dispatch(change('PermitForm', 'purchasePrice', res.data));
        this.setState({
          price: res.data,
          startDate: startDate.getTime(),
          endDate: endDate.getTime(),
          permitType: permitType,
        });
      })
      .catch(err => console.log(err));
  };

  componentDidUpdate(prevProps) {
    if (
      this.props.permitValues.permit !== prevProps.permitValues.permit ||
      this.props.permitValues.purhasePrice !== prevProps.permitValues.purhasePrice ||
      this.props.permitValues.startDate !== prevProps.permitValues.startDate ||
      this.props.permitValues.endDate !== prevProps.permitValues.endDate
    ) {
      this.generatePrice(prevProps);
    }
    return false;
  }

  render() {
    const { classes, handleSubmit, allowedPermits, unauthenticated } = this.props;
    const price = this.props.permitValues.purchasePrice;
    return (
      <form onSubmit={handleSubmit}>
        <Grid container spacing={24}>
          <Grid item sm={6} xs={12}>
            <Field name='permit' component={renderSelectField} label='Select a Type' required>
              {unauthenticated ? (
                <MenuItem value='Visitor'>Visitor</MenuItem>
              ) : (
                allowedPermits.map((permit, key) => (
                  <MenuItem key={key} value={permit}>
                    {permit.permitType} {permit.permitType === 'A' ? ` for space ${permit.spaceNumber}` : null}
                  </MenuItem>
                ))
              )}
            </Field>
          </Grid>
          <Grid item xs={12}>
            <FormLabel component='legend'>Select a Start Date</FormLabel>
            <Field id='startDate' name='startDate' component={DateTimePickerRow} required minDate={new Date()} />
          </Grid>
          <Grid item xs={12}>
            <FormLabel component='legend'>Select an Expiration Date</FormLabel>
            <Field id='endDate' name='endDate' component={DateTimePickerRow} required minDate={this.props.permitValues.startDate} />
          </Grid>
          <Grid item xs={12}>
            <FormLabel component='legend'>Price</FormLabel>
            <Field name='purchasePrice' component='input' type='hidden' />
            {price
              ? (price / 100).toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                })
              : 'Select a permit type to see price.'}
          </Grid>
        </Grid>
        <br />
        <div className={classes.buttons}>
          {unauthenticated === true ? (
            <Button
              type='button'
              variant='contained'
              color='secondary'
              onClick={() => {
                this.props.history.goBack();
                this.props.finishGuest();
                this.props.resetPermitForm();
                this.props.resetVehicleForm();
              }}
            >
              Back
            </Button>
          ) : (
            <Button type='button'
            variant='contained'
            color='secondary'
            onClick={() => {
              this.props.history.push('/');
              this.props.finishGuest();
              this.props.resetPermitForm();
              this.props.resetVehicleForm();
            }}>
              Home
            </Button>
          )}
          <Button type='submit' variant='contained' color='secondary'>
            Next
          </Button>
        </div>
      </form>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  if (ownProps.unauthenticated)
    return {
      permitValues: selector(state, 'startDate', 'endDate', 'permit', 'purchasePrice'),
    };
  return {
    allowedPermits: state.auth.user.allowedPermits,
    guestForm: state.auth.guestForm,
    permitValues: selector(state, 'permit', 'startDate', 'endDate', 'purchasePrice'),
  };
};

const mapDispatchToProps = dispatch => ({
  finishGuest: () => dispatch(finishGuestForm()),
  resetPermitForm: () => dispatch(reset('PermitForm')),
  resetVehicleForm: () => dispatch(reset('VehiclesForm')),
});

export default compose(
  withRouter,
  reduxForm({
    form: 'PermitForm',
    initialValues: {
      startDate: new Date(),
      endDate: new Date(),
    },
    destroyOnUnmount: false,
    forceUnregisterOnUnmount: true,
    validate,
  }),
  withStyles(styles),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(PermitForm);
