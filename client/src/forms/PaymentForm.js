import React from 'react';
import { injectStripe, CardNumberElement, CardExpiryElement, CardCVCElement } from 'react-stripe-elements';
import { Field, reduxForm, formValueSelector, change } from 'redux-form';
import { Grid, TextField, Button, FormControl } from '@material-ui/core';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import StripeElementWrapper from '../components/StripeElementWrapper';
import { fetchHelper } from '../actions/AuthActions';

const validate = values => {
  const errors = {};
  const requiredFields = ['email', 'cardNumber', 'cardExpirationDate', 'cardCVC'];
  requiredFields.forEach(field => {
    if (!values[field]) {
      errors[field] = 'Required';
    }
  });
  return errors;
};

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
const selector = formValueSelector('PermitForm');

class PaymentForm extends React.Component {
  state = {
    token: null,
  };

  componentDidMount() {
    if (this.props.initData) {
      this.updateForm();
    }
    if (window.Stripe) {
      this.setState({ token: window.Stripe('pk_test_L4kgEwg67mBcbYydxoBGXQf0') });
    } else {
      document.querySelector('#stripe-js').addEventListener('load', () => {
        // Create Stripe instance once Stripe.js loads
        this.setState({ token: window.Stripe('pk_test_L4kgEwg67mBcbYydxoBGXQf0') });
      });
    }
  }

  updateForm = () => {
    this.props.dispatch(change('PermitForm', 'email', this.props.initData));
  };

  handleSubmit = values => {
    if (this.props.stripe) {
      this.props.stripe.createToken().then(payload => {
        this.setState({ token: payload });
        const last4 = payload.token.card.last4;
        const brand = payload.token.card.brand;
        const expMonth = payload.token.card.exp_month;
        const expYear = payload.token.card.exp_year;
        const cardPartial = {
          last4,
          brand,
          expMonth,
          expYear,
        };
        if (payload.hasOwnProperty('error')) {
          console.log('error');
        } else {
          let body = {
            stripeToken: payload.token.id,
            car: this.props.location.state.selectedVehicle,
            purchasePrice: this.props.permitValues.purchasePrice,
            startDate: this.props.permitValues.startDate.getTime(),
            expirationDate: this.props.permitValues.endDate.getTime(),
          };
          if (this.props.unauthenticated) {
            let permitType = {
              permitType: 'Visitor',
            };
            body['permitType'] = permitType;
            this.props.history.push({
              pathname: '/unauthenticated/page-4',
              state: {
                data: body,
                cardPartial,
                car: this.props.location.state.selectedVehicle,
                email: values.email,
              },
            });
          } else {
            body['permitType'] = this.props.permitValues.permit;
            this.props.history.push({
              pathname: '/authenticated/page-4',
              state: {
                data: body,
                cardPartial,
                car: this.props.location.state.selectedVehicle,
                email: values.email,
              },
            });
          }
        }
      });
    } else {
      console.log("Stripe.js hasn't loaded yet.");
    }
  };

  render() {
    return (
      <form onSubmit={this.props.handleSubmit(this.handleSubmit.bind(this))}>
        <Grid container spacing={24}>
          <Grid item xs={12} sm={6}>
            <FormControl margin='normal' required fullWidth>
              <Field name='email' component={renderTextField} label='Email Address' autoFocus />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <StripeElementWrapper label='Card Number' component={CardNumberElement} autoComplete={'cardNumber'} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <StripeElementWrapper label='Expiration Date' component={CardExpiryElement} autoComplete={'cardExpiry'} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <StripeElementWrapper label='Card CVC' component={CardCVCElement} autoComplete={'cardCVC'} />
          </Grid>
        </Grid>
        <br />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button type='button' variant='contained' color='secondary' onClick={() => this.props.history.goBack()}>
            Back
          </Button>
          <Button type='submit' variant='contained' color='secondary'>
            Next
          </Button>
        </div>
      </form>
    );
  }
}

const mapStateToProps = state => ({
  permitValues: selector(state, 'startDate', 'endDate', 'permit', 'vehicle', 'purchasePrice'),
});

const mapDispatchToProps = dispatch => ({
  fetchHelp: (url, method, header, body) => dispatch(fetchHelper(url, method, header, body)),
  dispatch,
});

export default compose(
  withRouter,
  injectStripe,
  reduxForm({
    form: 'PermitForm',
    destroyOnUnmount: false,
    forceUnregisterOnUnmount: true,
    validate,
  }),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(PaymentForm);
