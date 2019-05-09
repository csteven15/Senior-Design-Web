import React from 'react';
import { Stepper, Step, StepLabel, withStyles } from '@material-ui/core';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { connect } from 'react-redux';

const styles = theme => ({
  layout: {
    width: 'auto',
    marginLeft: 'auto',
    marginRight: 'auto',
    [theme.breakpoints.up(600 + theme.spacing.unit * 2 * 2)]: {
      width: '100%',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
  stepper: {
    padding: `${theme.spacing.unit * 3}px 0 ${theme.spacing.unit * 5}px`,
  },
  icon: {
    color: 'green',
  },
});

const StepperSetter = props => {
  const { classes, activeStep, guestForm } = props;
  const steps = ['Permit', 'Vehicle', 'Payment', 'Review'];
  let backgroundColor = '#fafafa';
  if (guestForm) {
    backgroundColor = '#ffffff';
  }
  return (
    <div className={classes.layout}>
      <Stepper activeStep={activeStep} className={classes.stepper} alternativeLabel style={{ backgroundColor: backgroundColor }}>
        {steps.map(label => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </div>
  );
};

const mapStateToProps = state => ({
  guestForm: state.auth.guestForm,
});

export default compose(
  withRouter,
  withStyles(styles),
  connect(mapStateToProps)
)(StepperSetter);
