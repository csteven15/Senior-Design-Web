import React from 'react';
import { Typography, Button, Grid, withStyles } from '@material-ui/core';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { fetchHelper } from '../actions/AuthActions';
import Spinner from '../components/generic/Spinner';
import axios from 'axios';

const styles = theme => ({
  layout: {
    justifyContent: 'left',
    width: 'auto',
    marginLeft: theme.spacing.unit * 2,
    marginRight: theme.spacing.unit * 2,
    [theme.breakpoints.up(600 + theme.spacing.unit * 2 * 2)]: {
      width: '100%',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
  stepper: {
    padding: `${theme.spacing.unit * 3}px 0 ${theme.spacing.unit * 5}px`,
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  button: {
    marginTop: theme.spacing.unit * 3,
    marginLeft: theme.spacing.unit,
  },
});

class PermitDetails extends React.Component {
  state = {
    permitData: null,
  };

  componentDidMount() {
    this.getPermitDetails();
  }

  getPermitDetails() {
    this.props
      .fetchHelp()
      .then(res => {
        axios
          .get(`/api/permits/idspecific/${this.props.location.state.data._id}`, {
            headers: res.headers,
          })
          .then(res => {
            if (res.status !== 400) {
              this.setState({ permitData: res.data.result });
            }
          });
      })
      .catch(err => console.log(err));
  }

  render() {
    const { classes } = this.props;
    const { permitData } = this.state;
    if (permitData === null) {
      return <Spinner />;
    }
    const expirationDate = new Date(permitData.expirationDate);
    const expiration = `${expirationDate.getMonth() + 1}-${expirationDate.getDate()}-${expirationDate.getFullYear()}`;

    const purchaseDate = new Date(permitData.purchaseDate);
    const purchase = `${purchaseDate.getMonth() + 1}-${purchaseDate.getDate()}-${purchaseDate.getFullYear()}`;

    return (
      <div className={classes.layout}>
        <Typography variant='h4' gutterBottom component='h4'>
          Permit Details
        </Typography>
        <Typography variant='h6' gutterBottom component='h6'>
          Permit Type:&nbsp;
          {permitData.permitType.permitType}
        </Typography>
        <Typography variant='h6' gutterBottom component='h6'>
          Expiration Date:&nbsp;
          {purchase}
        </Typography>
        <Typography variant='h6' gutterBottom component='h6'>
          Expiration Date:&nbsp;
          {expiration}
        </Typography>
        <Typography variant='h6' gutterBottom component='h6'>
          Associated Vehicle:&nbsp;
        </Typography>
        <Typography variant='h6' gutterBottom component='h6'>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          {`${permitData.car.year} ${permitData.car.make} ${permitData.car.model}`}
        </Typography>
        <Typography variant='h6' gutterBottom component='h6'>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Color:&nbsp;
          {permitData.car.color}
        </Typography>
        <Typography variant='h6' gutterBottom component='h6'>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; License Plate:&nbsp;
          {`${permitData.car.licensePlate.tag}, ${permitData.car.licensePlate.state}`}
        </Typography>
        <Grid container spacing={24}>
          <Grid item xs={12} sm={6}>
            <Button
              onClick={() =>
                this.props.history.push({
                  pathname: '/changeVehicle',
                  state: { id: permitData._id },
                })
              }
            >
              Change Vehicle
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button onClick={() => this.props.history.goBack()}>Done</Button>
          </Grid>
        </Grid>
      </div>
    );
  }
}
const mapDispatchToProps = dispatch => {
  return {
    fetchHelp: (url, method, header, body) => dispatch(fetchHelper(url, method, header, body)),
  };
};

export default compose(
  withRouter,
  withStyles(styles),
  connect(
    null,
    mapDispatchToProps
  )
)(PermitDetails);
