import React from 'react';
import { Paper, Grid, Typography, withStyles } from '@material-ui/core';
import { Error, Search, Map, Settings } from '@material-ui/icons';
import { Link, withRouter } from 'react-router-dom';
import DashboardCard from '../components/generic/DashboardCard';
import axios from 'axios';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { fetchHelper } from '../actions/AuthActions';
import Chart from '../components/Chart';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider } from 'material-ui-pickers';

const styles = theme => ({
  icon: {
    width: '50%',
    height: '50%',
  },
});

export class Dashboard extends React.Component {
  state = {
    violations: 0,
  };

  componentDidMount() {
    let today = new Date();
    let urlParams = {
      startDate: new Date(today.getTime() - 1000 * 60 * 60 * 24 * 1).getTime(),
      endDate: today.getTime(),
    };
    this.props.fetchHelp().then(res => {
      axios
        .get(`/api/violations/fetchViolations?${new URLSearchParams(urlParams).toString()}`, res)
        .then(res => {
          let data = res.data.results;
          let count = 0;
          data.map(violation => {
            count++;
            return null;
          });
          this.setState({ violations: count });
        })
        .catch(err => console.log(err.response));
    });
  }

  toggleChart = () => {
    this.setState(state => ({ graph: !state.graph }));
  };

  render() {
    const { classes } = this.props;
    return (
      <React.Fragment>
        <Typography variant='h4' gutterBottom component='h4'>
          Dashboard
        </Typography>
        <Grid container spacing={24}>
          <Grid lg={3} md={4} sm={6} xs={12} item>
            <Link to='/users/search' style={{ textDecoration: 'none' }}>
              <DashboardCard left={<Search className={classes.icon} />} right={'Search, create, edit, and delete users'} bgColor={'#2196f3'} />
            </Link>
          </Grid>
          <Grid lg={3} md={4} sm={6} xs={12} item>
            <DashboardCard
              left={<Error className={classes.icon} />}
              right={`There are ${this.state.violations} violations in the past 24 hours`}
              bgColor={'#f44336'}
            />
          </Grid>
          <Grid lg={3} md={4} sm={6} xs={12} item>
            <Link to='/users/heatmap' style={{ textDecoration: 'none' }}>
              <DashboardCard left={<Map className={classes.icon} />} right={'See a heatmap of the violations'} bgColor={'#7e57c2'} />
            </Link>
          </Grid>
          <Grid lg={3} md={4} sm={6} xs={12} item>
            <Link to='/users/global' style={{ textDecoration: 'none' }}>
              <DashboardCard left={<Settings className={classes.icon} />} right={`Change global settings`} bgColor={'#9e9e9e'} />
            </Link>
          </Grid>
          <Grid xs={12} item>
            <Paper>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <Chart toggleChart={this.toggleChart} graph={this.state.graph} />
              </MuiPickersUtilsProvider>
            </Paper>
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  fetchHelp: (url, method, header, body) => dispatch(fetchHelper(url, method, header, body)),
});

export default compose(
  withRouter,
  withStyles(styles),
  connect(
    null,
    mapDispatchToProps
  )
)(Dashboard);
