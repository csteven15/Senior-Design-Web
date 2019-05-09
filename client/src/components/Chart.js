import React from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Typography } from '@material-ui/core';
import { InlineDatePicker } from 'material-ui-pickers';
import { connect } from 'react-redux';
import { fetchHelper } from './../actions/AuthActions';
import { enqueueSnackbar } from './../actions/UIActions';
import axios from 'axios';

const styles = {
  container: {
    textAlign: 'center',
  },
  graphContainer: {
    backgroundColor: '#1baec3',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#ffffff',
  },
  graphTitle: {
    color: '#ffffff',
    margin: '10px',
  },
  chart: {
    marginTop: '10px',
  },
};

class Chart extends React.Component {
  state = {
    startDate: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 7).getTime(),
    endDate: new Date().getTime(),
    violations: null,
  };

  handleStartDateChange = date => {
    this.setState({ startDate: date.getTime() }, () => this.updateGraph());
  };

  handleEndDateChange = date => {
    date.setHours(23, 59, 59, 999);
    this.setState({ endDate: date.getTime() }, () => this.updateGraph());
  };

  componentDidMount() {
    this.updateGraph();
  }

  updateGraph = () => {
    let newStartDate = new Date(this.state.startDate).setHours(0, 0, 0, 0);
    let newEndDate = new Date(this.state.endDate).setHours(23, 59, 59, 999);
    let urlParams = {
      startDate: newStartDate,
      endDate: newEndDate,
    };
    this.props.fetchHelp().then(res => {
      axios
        .get(`/api/violations/fetchViolations?${new URLSearchParams(urlParams).toString()}`, {
          headers: res.headers,
        })
        .then(res => {
          if (res.status !== 400) {
            let permitViolations = [];

            let permitTypeCounter = {};
            this.props.permitTypesList.map((permit, index) => {
              permitTypeCounter[permit.permitType] = 0;
              return null;
            });
            let data = res.data.results;
            data.map(violation => {
              permitTypeCounter[violation.requiredPermitType]++;
              return null;
            });
            this.props.permitTypesList.map(permit => {
              let permitValue = {};
              permitValue.name = permit.permitType;
              permitValue.Violations = permitTypeCounter[permit.permitType];
              permitViolations.push(permitValue);
              return null;
            });
            this.setState({ violations: permitViolations });
          } else {
            this.props.dispatch(
              enqueueSnackbar({
                message: `Failed to fetch data.`,
                options: {
                  variant: 'warning',
                },
              })
            );
          }
        });
    });
  };

  render() {
    const { startDate, endDate, violations } = this.state;
    return (
      <div style={styles.container}>
        <div style={styles.graphContainer}>
          <Typography variant='h5' gutterBottom component='h5' style={styles.graphTitle}>
            Violations
          </Typography>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: '20px' }}>
          <p>Start Date:</p>
          &nbsp;
          <InlineDatePicker
            keyboard={false}
            clearable
            disableOpenOnEnter
            value={startDate}
            onChange={this.handleStartDateChange}
            maxdate={new Date()}
            disableFuture
            format='MM/dd/yyyy'
            mask={date => (date ? [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/] : [])}
          />
          <p>End Date:</p>
          &nbsp;
          <InlineDatePicker
            keyboard={false}
            clearable
            disableOpenOnEnter
            value={endDate}
            onChange={this.handleEndDateChange}
            minDate={startDate}
            maxdate={new Date()}
            format='MM/dd/yyyy'
            disableFuture
            mask={date => (date ? [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/] : [])}
          />
        </div>
        <br />
        <div>
          <ResponsiveContainer width='99%' height={300}>
            <BarChart width={730} height={250} data={violations} style={styles.chart}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='name' />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey='Violations' fill='#8884d8' />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  permitTypesList: state.ui.formValues.permitTypesList,
});

const mapDispatchToProps = dispatch => ({
  fetchHelp: (url, method, header, body) => dispatch(fetchHelper(url, method, header, body)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Chart);
