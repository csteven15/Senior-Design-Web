import React from 'react';
import { Paper, withStyles, Icon } from '@material-ui/core';

const styles = theme => ({
  card: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  right: {
    color: '#000000',
    width: '70%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px',
  },
  left: {
    width: '30%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
  },
  avatar: {
    height: '100%',
  },
});

const DashboardCard = props => {
  const { left, right, bgColor, classes } = props;
  return (
    <Paper className={classes.card}>
      <div className={classes.left} style={{ backgroundColor: bgColor }}>
        <Icon className={classes.icon}>{left}</Icon>
      </div>
      <div className={classes.right}>{right}</div>
    </Paper>
  );
};

export default withStyles(styles)(DashboardCard);
