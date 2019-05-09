import React from 'react';
import { Typography, Button } from '@material-ui/core';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import StepperSetter from '../StepperSetter';
import { finishGuestForm } from '../../actions/AuthActions';

const Summary = props => {
  return (
    <React.Fragment>
      <Typography variant='h4' gutterBottom component='h4'>
        Order Review
      </Typography>
      <StepperSetter activeStep={3} />
      {props.location.state.status === 'success' ? (
        <React.Fragment>
          <Typography variant='h5' gutterBottom>
            Thank you for your order.
          </Typography>
          <br />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <a href={props.location.state.res.receiptURL} style={{ textDecoration: 'none' }} target='_blank' rel='noopener noreferrer'>
              <Button color='secondary'>Receipt</Button>
            </a>
            <Button
              color='primary'
              onClick={() => {
                if (props.unauthenticated) props.finishGuest();
                props.history.push('/');
              }}
            >
              Go Back Home
            </Button>
          </div>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <Typography variant='h5' gutterBottom>
            Order Failed.
          </Typography>
          <Typography variant='subtitle1'>Sorry for the inconvenience. Something may have gone wrong. Please retry from the beginning.</Typography>
          <br />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              color='primary'
              onClick={() => {
                if (props.unauthenticated) props.finishGuest();
                props.history.push('/');
              }}
            >
              Go Back Home
            </Button>
          </div>
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

const mapDispatchToProps = dispatch => ({
  finishGuest: () => dispatch(finishGuestForm()),
});

export default withRouter(
  connect(
    null,
    mapDispatchToProps
  )(Summary)
);
