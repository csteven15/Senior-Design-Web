import React from 'react';
import { Typography, Fab, Icon } from '@material-ui/core';
import { Add as AddIcon } from '@material-ui/icons';
import { connect } from 'react-redux';
import { formValueSelector } from 'redux-form';
import { Link, withRouter } from 'react-router-dom';
import StepperSetter from '../StepperSetter';
import VehicleSelectForm from '../../forms/VehicleSelectForm';
import AddVehicle from '../../pages/AddVehicle';

const selector = formValueSelector('PermitForm');

const submit = (values, props) => {
  props.history.push({ pathname: '/authenticated/page-3', state: { selectedVehicle: values } });
};

const PurchaseVehicle = props => {
  const { unauthenticated, changeVehicle } = props;
  if (unauthenticated) {
    return (
      <React.Fragment>
        <StepperSetter activeStep={1} />
        <AddVehicle unauthenticated />
      </React.Fragment>
    );
  }
  return (
    <React.Fragment>
      <Typography variant='h4' gutterBottom component='h4'>
        Please Select a Vehicle or Add a New One
      </Typography>
      {changeVehicle === true ? null : <StepperSetter activeStep={1} />}
      <VehicleSelectForm onSubmit={values => submit(values, props)} changeVehicle={changeVehicle} />
      <div style={{ position: 'fixed', bottom: 70, right: 30 }}>
        <Link to='/addVehicle' style={{ textDecoration: 'none' }}>
          <Fab color='secondary' style={{ lineHeight: 0 }}>
            <Icon>
              <AddIcon />
            </Icon>
          </Fab>
        </Link>
      </div>
    </React.Fragment>
  );
};

const mapStateToProps = (state, ownProps) => {
  if (ownProps.unauthenticated) return { values: selector(state, 'make', 'model', 'year', 'color', 'state', 'tag') };
  return {
    username: state.auth.user.username,
    values: selector(state, 'make', 'model', 'year', 'color', 'state', 'tag'),
  };
};

export default withRouter(connect(mapStateToProps)(PurchaseVehicle));
