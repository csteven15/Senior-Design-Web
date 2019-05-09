import React from 'react';
import { Typography } from '@material-ui/core';
import { withRouter } from 'react-router-dom';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider } from 'material-ui-pickers';
import PermitForm from '../../forms/PermitForm';
import StepperSetter from '../StepperSetter';

const logInput = (values, props) => {
  if (props.unauthenticated) props.history.push('/unauthenticated/page-2');
  else props.history.push('/authenticated/page-2');
};

const PurchasePermit = props => {
  const { unauthenticated } = props;
  return (
    <React.Fragment>
      <Typography variant='h4' gutterBottom component='h4'>
        Please Fill out your Permit Information
      </Typography>
      <StepperSetter activeStep={0} />
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <PermitForm onSubmit={values => logInput(values, props)} unauthenticated={unauthenticated} />
      </MuiPickersUtilsProvider>
    </React.Fragment>
  );
};

export default withRouter(PurchasePermit);
