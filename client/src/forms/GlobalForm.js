import React from 'react';
import { Grid, Button, FormControl, TextField } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { compose } from 'recompose';
import { Field, FieldArray, reduxForm, arrayPush } from 'redux-form';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { fetchHelper } from '../actions/AuthActions';
import axios from 'axios';

const validateCurrency = value => {
  return /^[+-]?[0-9]{1,3}(?:,?[0-9]{3})*\.[0-9]{2}$/.test(value) ? undefined : 'Price must be formatted like so: 123.45';
};

function toSeconds(value) {
  return value / 1000;
}

function hasDecimal(value) {
  let numStr = value.toString();
  let index = numStr.indexOf('.');

  if (index === -1) {
    return false;
  }
  return true;
}

function convertToDecimal(value) {
  return value / 100;
}

function normalizeCurrency(value) {
  if (!value) {
    return value;
  }

  if (!hasDecimal(value)) {
    value = convertToDecimal(value);
  }

  return value.toFixed(2);
}

const renderTextField = ({ label, input, disabled, autoComplete, meta: { touched, invalid, error }, ...custom }) => (
  <TextField
    fullWidth
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

const renderPermitTypesList = ({ fields, permitTypesList, price }) => (
  <div>
    {fields.map((permit, index) => (
      <Field
        key={permit}
        name={permit}
        type='text'
        component={renderTextField}
        label={`Permit ${permitTypesList[index].permitType} Price One ${price}`}
        validate={[validateCurrency]}
      />
    ))}
  </div>
);

const styles = theme => ({
  submit: {
    marginTop: theme.spacing.unit * 3,
  },
  buttons: {
    display: 'flex',
    justifyContent: 'space-between',
  },
});

class GlobalForm extends React.Component {
  componentDidMount() {
    this.updateForm();
  }

  updateForm = () => {
    this.props
      .fetchHelp()
      .then(res => {
        axios
          .all([axios.get(`/api/fetchGlobal/swapsAllowedDefault`, res), axios.get(`/api/fetchGlobal/swapPeriod`, res)])
          .then(
            axios.spread((swapsAllowedDefault, swapPeriod) => {
              const initData = {
                permitTypesPriceOneDayList: this.props.globalFormValues.permitTypesList.map(permit => normalizeCurrency(permit.priceOneDay)),
                permitTypesPriceOneYearList: this.props.globalFormValues.permitTypesList.map(permit => normalizeCurrency(permit.priceOneYear)),
                permitList: this.props.globalFormValues.permitTypesList,
              };
              initData.swapPeriod = toSeconds(swapPeriod.data.value);
              initData.swapsAllowedDefault = swapsAllowedDefault.data.value;
              this.props.initialize(initData);
            })
          )
          .catch(err => console.log(err));
      })
      .catch(err => console.log(err));
  };

  render() {
    const { handleSubmit, classes } = this.props;
    return (
      <form onSubmit={handleSubmit}>
        <Grid container spacing={24}>
          <Grid item sm={6} xs={12}>
            <FormControl margin='normal' required fullWidth>
              <Field name='swapPeriod' component={renderTextField} label='Swap Period (s)' autoFocus disabled={this.props.update} />
            </FormControl>
          </Grid>
          <Grid item sm={6} xs={12}>
            <FormControl margin='normal' required fullWidth>
              <Field name='swapsAllowedDefault' component={renderTextField} label='Swaps Allowed by Default' autoFocus disabled={this.props.update} />
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl margin='normal' fullWidth>
              <FieldArray
                name='permitTypesPriceOneDayList'
                component={renderPermitTypesList}
                permitTypesList={this.props.globalFormValues.permitTypesList}
                price={'Day'}
              />
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl margin='normal' fullWidth>
              <FieldArray
                name='permitTypesPriceOneYearList'
                component={renderPermitTypesList}
                permitTypesList={this.props.globalFormValues.permitTypesList}
                price='Year'
              />
            </FormControl>
          </Grid>
        </Grid>
        <br />
        <div className={classes.buttons}>
          <Button type='submit' variant='contained' color='primary' className={classes.submit}>
            Update
          </Button>
        </div>
      </form>
    );
  }
}

const mapStateToProps = state => ({
  globalFormValues: state.ui.formValues,
});

const mapDispatchToProps = dispatch => ({
  fetchHelp: (url, method, header, body) => dispatch(fetchHelper(url, method, header, body)),
  pushArray: arrayPush,
});

export default compose(
  withRouter,
  reduxForm({
    form: 'GlobalForm',
  }),
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  withStyles(styles)
)(GlobalForm);
