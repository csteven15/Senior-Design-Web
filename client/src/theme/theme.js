import { createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
  typography: {
    useNextVariants: true,
    suppressDeprecationWarnings: true,
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  palette: {
    primary: {
      500: '#000000',
    },
    secondary: {
      main: '#FDC542',
    },
  },
  overrides: {
    MuiStepIcon: {
      root: {
        color: '#000000', // or 'rgba(0, 0, 0, 1)'
        '&$active': {
          color: '#FDC542',
        },
        '&$completed': {
          color: '#FDC542',
        },
      },
    },
  },
});

export default theme;
