import React from 'react';
import { connect } from 'react-redux';
import { Typography } from '@material-ui/core';
import axios from 'axios';
import { enqueueSnackbar } from '../actions/UIActions';
import { fetchHelper } from '../actions/AuthActions';
import GlobalForm from './../forms/GlobalForm';

const update = (values, props) => {
  values.permitList.map((permit, index) => {
    values.permitList[index].priceOneDay = values.permitTypesPriceOneDayList[index] * 100;
    values.permitList[index].priceOneYear = values.permitTypesPriceOneYearList[index] * 100;
    return null;
  });
  let permitTypesBody = {
    value: values.permitList,
  };
  let swapPeriodBody = {
    value: values.swapPeriod * 1000,
  };
  let swapsAllowedDefaultBody = {
    value: values.swapsAllowedDefault,
  };
  props
    .fetchHelp()
    .then(res => {
      axios
        .all([
          axios.post(`/api/putGlobal/permitTypes`, permitTypesBody, res),
          axios.post(`/api/putGlobal/swapPeriod`, swapPeriodBody, res),
          axios.post(`/api/putGlobal/swapsAllowedDefault`, swapsAllowedDefaultBody, res),
        ])
        .then(
          axios.spread((permitTypesRes, swapPeriodRes, swapsAllowedDefaultRes) => {
            if (permitTypesRes.status === 200) {
              props.dispatch(
                enqueueSnackbar({
                  message: 'Updated permit pricing',
                })
              );
            } else {
              props.dispatch(
                enqueueSnackbar({
                  message: 'Failed to update permit pricing',
                  options: {
                    variant: 'warning',
                  },
                })
              );
            }
            if (swapPeriodRes.status === 200) {
              props.dispatch(
                enqueueSnackbar({
                  message: 'Updated swap period',
                })
              );
            } else {
              props.dispatch(
                enqueueSnackbar({
                  message: 'Failed to update swap period',
                  options: {
                    variant: 'warning',
                  },
                })
              );
            }
            if (swapsAllowedDefaultRes.status === 200) {
              props.dispatch(
                enqueueSnackbar({
                  message: 'Updated default swaps allowed',
                })
              );
            } else {
              props.dispatch(
                enqueueSnackbar({
                  message: 'Failed to update default swaps allowed',
                  options: {
                    variant: 'warning',
                  },
                })
              );
            }
          })
        );
    })
    .catch(err => console.log(err));
};

const GlobalSettings = props => {
  return (
    <div>
      <Typography variant='h4' gutterBottom component='h4'>
        Global Form
      </Typography>
      <GlobalForm onSubmit={values => update(values, props)} />
    </div>
  );
};

const mapDispatchToProps = dispatch => ({
  fetchHelp: () => dispatch(fetchHelper()),
  dispatch,
});

export default connect(
  null,
  mapDispatchToProps
)(GlobalSettings);
