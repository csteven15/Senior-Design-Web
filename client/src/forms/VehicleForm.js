import React from 'react';
import { Grid, Button, Select, MenuItem, FormControl, InputLabel, FormHelperText, TextField } from '@material-ui/core';
import { Field, reduxForm } from 'redux-form';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

const validate = values => {
  const errors = {};
  const requiredFields = ['make', 'model', 'year', 'color', 'tag', 'state'];
  requiredFields.forEach(field => {
    if (!values[field]) {
      errors[field] = 'Required';
    }
  });
  return errors;
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

const renderTextField = ({ label, input, disabled, autoComplete, meta: { touched, invalid, error }, ...custom }) => (
  <TextField
    disabled={disabled}
    label={label}
    placeholder={label}
    autoComplete={autoComplete}
    error={touched && invalid}
    helperText={touched && error === 'true'}
    {...input}
    {...custom}
  />
);

export class VehicleForm extends React.Component {
  componentDidMount() {
    if (this.props.edit) {
      this.fetchPermitsData();
    }
  }

  fetchPermitsData = () => {
    const carData = this.props.location.state.carData;
    const initData = {
      tag: carData.licensePlate.tag,
      state: carData.licensePlate.state,
      make: carData.make,
      model: carData.model,
      year: carData.year,
      color: carData.color,
    };
    this.props.initialize(initData);
  };

  render() {
    const { handleSubmit } = this.props;
    const states = this.props.globalFormValues.statesList;
    const makes = this.props.globalFormValues.vehicleMakesList;
    const colors = this.props.globalFormValues.vehicleColorsList;
    return (
      <React.Fragment>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={24}>
            <Grid item xs={12} sm={6}>
              <FormControl margin='normal' required fullWidth>
                <Field name='tag' component={renderTextField} label='Tag' autoFocus autoComplete='tag' />
              </FormControl>
            </Grid>
            <Grid item sm={6} xs={12}>
              <Field name='state' component={renderSelectField} label='State' required>
                {states.map((state, key) => (
                  <MenuItem key={key} value={state}>
                    {state}
                  </MenuItem>
                ))}
              </Field>
            </Grid>
            <Grid item sm={6} xs={12}>
              <Field name='make' component={renderSelectField} label='Make' required>
                {makes.map((make, key) => (
                  <MenuItem key={key} value={make}>
                    {make}
                  </MenuItem>
                ))}
              </Field>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl margin='normal' required fullWidth>
                <Field name='model' component={renderTextField} label='Model' autoFocus autoComplete='model' />
              </FormControl>
            </Grid>
            <Grid item sm={6} xs={12}>
              <Field name='color' component={renderSelectField} label='Color' required>
                {colors.map((color, key) => (
                  <MenuItem key={key} value={color}>
                    {color}
                  </MenuItem>
                ))}
              </Field>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl margin='normal' required fullWidth>
                <Field name='year' component={renderTextField} label='Year' autoFocus autoComplete='licenseYear' />
              </FormControl>
            </Grid>
          </Grid>
          <br />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button type='button' variant='contained' onClick={() => this.props.history.goBack()}>
              Back
            </Button>
            {this.props.unauthenticated ? (
              <Button type='submit' variant='contained' color='primary'>
                Next
              </Button>
            ) : (
              <Button type='submit' variant='contained' color='primary'>
                {this.props.edit ? 'Update' : 'Create'}
              </Button>
            )}
          </div>
        </form>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  globalFormValues: state.ui.formValues,
});

export default compose(
  withRouter,
  reduxForm({
    form: 'VehiclesForm',
    validate,
  }),
  connect(mapStateToProps)
)(VehicleForm);
