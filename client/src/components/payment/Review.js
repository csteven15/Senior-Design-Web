import React from 'react';
import { withStyles, Typography, List, ListItem, ListItemText, Button } from '@material-ui/core';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { reset } from 'redux-form';
import { fetchHelper } from '../../actions/AuthActions';
import axios from 'axios';
import StepperSetter from '../StepperSetter';

const styles = theme => ({
  listItem: {
    padding: `${theme.spacing.unit}px 0`,
  },
  price: {
    fontWeight: '700',
  },
  title: {
    marginTop: theme.spacing.unit * 1,
  },
  buttons: {
    display: 'flex',
    justifyContent: 'space-between',
  },
});

const purchase = props => {
  const url = '/api/permits/purchasePermit';
  let body = props.location.state.data;
  let startDate = new Date(props.location.state.data.startDate);
  let expirationDate = new Date(props.location.state.data.expirationDate);
  startDate.setHours(0, 0, 0, 0);
  expirationDate.setHours(23, 59, 59, 999);
  startDate = startDate.getTime();
  expirationDate = expirationDate.getTime();
  body.startDate = startDate;
  body.expirationDate = expirationDate;
  if (props.unauthenticated === true) {
    axios
      .post(url, body, null)
      .then(res => {
        const data = res.data;
        props.history.push({
          pathname: '/unauthenticated/page-5',
          state: { status: 'success', res: data },
        });
        props.resetPermitForm();
        props.resetVehicleForm();
      })
      .catch(err => {
        console.log(err.response);
        const data = err.response;
        props.history.push({
          pathname: '/unauthenticated/page-5',
          state: { status: 'fail', res: data },
        });
      });
  } else {
    props.fetchHelp().then(res => {
      axios
        .post(url, body, {
          headers: res.headers,
        })
        .then(res => {
          const data = res.data;
          props.history.push({
            pathname: '/authenticated/page-5',
            state: { status: 'success', res: data },
          });
          props.resetPermitForm();
          props.resetVehicleForm();
        })
        .catch(err => {
          console.log(err.response);
          const data = err.response;
          props.history.push({
            pathname: '/authenticated/page-5',
            state: { status: 'fail', res: data },
          });
        });
    });
  }
};

const Review = props => {
  const { classes } = props;
  const dollars = props.location.state.data.purchasePrice / 100;
  const price = dollars.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  let startDate = new Date(props.location.state.data.startDate);
  let expDate = new Date(props.location.state.data.expirationDate);
  startDate.setHours(0, 0, 0, 0);
  expDate.setHours(23, 59, 59, 999);
  const car = props.location.state.car;
  const information = {
    name: `${props.location.state.data.permitType.permitType} Permit`,
    startDate: `${startDate.toLocaleString()}`,
    expDate: `${expDate.toLocaleString()}`,
    vehicleMake: `${car.make}`,
    vehicleModel: `${car.model}`,
    vehicleYear: `${car.year}`,
    vehicleColor: `${car.color}`,
    licensePlate: `${car.licensePlate.tag}`,
    state: `${car.licensePlate.state}`,
  };
  const payment = {
    cardType: props.location.state.cardPartial.brand,
    cardNumber: `xxxx-xxxx-xxxx-${props.location.state.cardPartial.last4}`,
    expirationDate: `${props.location.state.cardPartial.expMonth}/${props.location.state.cardPartial.expYear}`,
    eamil: props.location.state.email,
    price: price,
  };
  return (
    <React.Fragment>
      <Typography variant='h4' gutterBottom component='h4'>
        Order Review
      </Typography>
      <StepperSetter activeStep={3} />
      <Typography variant='h6' gutterBottom>
        Permit Information
      </Typography>
      <List disablePadding>
        <ListItem className={classes.listItem} key={information.name}>
          <ListItemText>
            Permit Type: {information.name} <br />
            Start Date: {information.startDate} <br />
            Expiration Date: {information.expDate} <br />
          </ListItemText>
        </ListItem>
        <Typography variant='h6' gutterBottom>
          Applied Vehicle
        </Typography>
        <ListItem className={classes.listItem}>
          <ListItemText>
            Make: {information.vehicleMake} <br />
            Model: {information.vehicleModel} <br />
            Year: {information.vehicleYear} <br />
            Color: {information.vehicleColor} <br />
            Tag: {information.licensePlate} <br />
            State: {information.state}
          </ListItemText>
        </ListItem>
        <Typography variant='h6' gutterBottom>
          Payment Information
        </Typography>
        <ListItem className={classes.listItem}>
          <ListItemText>
            {/* Card Type: {payment.cardType} <br /> */}
            Card: {payment.cardNumber} <br />
            {/* Expiration Date: {payment.expirationDate} <br /> */}
            Receipt Email: {payment.eamil} <br />
            Price: {payment.price}
          </ListItemText>
        </ListItem>
      </List>
      <br />
      <div className={classes.buttons}>
        <Button type='button' variant='contained' color='secondary' onClick={() => props.history.goBack()}>
          Back
        </Button>
        <Button type='submit' variant='contained' color='secondary' onClick={() => purchase(props)}>
          Purchase
        </Button>
      </div>
    </React.Fragment>
  );
};

const mapDispatchToProps = dispatch => ({
  fetchHelp: (url, method, header, body) => dispatch(fetchHelper(url, method, header, body)),
  resetPermitForm: () => dispatch(reset('PermitForm')),
  resetVehicleForm: () => dispatch(reset('VehiclesForm')),
});

export default compose(
  withRouter,
  withStyles(styles),
  connect(
    null,
    mapDispatchToProps
  )
)(Review);
