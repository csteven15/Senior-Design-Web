import React from 'react';
import { Typography } from '@material-ui/core';
import { Elements, StripeProvider } from 'react-stripe-elements';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import StepperSetter from '../StepperSetter';
import PaymentForm from '../../forms/PaymentForm';

const PurchasePayment = props => {
  return (
    <StripeProvider apiKey='pk_test_L4kgEwg67mBcbYydxoBGXQf0'>
      <React.Fragment>
        <Typography variant='h4' gutterBottom component='h4'>
          Please Fill out your Payment Information
        </Typography>
        <StepperSetter activeStep={2} />
        <Elements>
          <PaymentForm unauthenticated={props.unauthenticated} initData={props.initData} />
        </Elements>
      </React.Fragment>
    </StripeProvider>
  );
};

const mapStateToProps = state => {
  if (state.auth.user !== null) {
    return {
      initData: state.auth.user.emailAddress,
    };
  }
  return {
    initData: null,
  };
};

export default withRouter(connect(mapStateToProps)(PurchasePayment));
