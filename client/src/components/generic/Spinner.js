import React from 'react';
import { CircularProgress } from '@material-ui/core';

const Spinner = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
    }}
  >
    <CircularProgress />
  </div>
);

export default Spinner;
