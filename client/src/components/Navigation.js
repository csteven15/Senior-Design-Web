import React from 'react';
import {
  AppBar,
  CssBaseline,
  Toolbar,
  IconButton,
  Typography,
  Hidden,
  SwipeableDrawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  withStyles,
} from '@material-ui/core';
import { Home, Menu, ContactSupport, ArrowBack, Dashboard } from '@material-ui/icons';
import classNames from 'classnames';
import { Link, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import NavigationRouter from '../routes/NavigationRouter';
import Spinner from './generic/Spinner';
import { userSignOut, finishGuestForm } from '../actions/AuthActions';
import { reset } from 'redux-form';

const SignIn = React.lazy(() => import('../pages/SignIn'));
const GuestRouter = React.lazy(() => import('../routes/GuestRouter'));

const knights = require('../images/knights.png');

const drawerWidth = '240px';
const appBarHeight = '60px';

const styles = theme => ({
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white,
    },
  },
  root: {
    flexGrow: 1,
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    height: appBarHeight,
  },
  menuButton: {
    marginLeft: -20,
    marginRight: 10,
  },
  navIconHide: {
    [theme.breakpoints.up('md')]: {
      display: 'inline',
    },
  },
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    position: 'fixed',
    width: drawerWidth,
    height: '100vh',
    marginRight: '240px',
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    width: theme.spacing.unit * 0,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing.unit * 0,
    },
  },
  contentPaper: {
    overflowX: 'hidden',
    padding: theme.spacing.unit * 2,
    marginTop: appBarHeight,
    marginLeft: drawerWidth,
    width: 'calc(100vw - 240px)',
    height: 'calc(100vh - 60px)',
    backgroundColor: '#fafafa',
  },
  contentPaperClose: {
    overflowX: 'hidden',
    padding: theme.spacing.unit * 2,
    marginTop: appBarHeight,
    width: '100vw',
    height: 'calc(100vh - 60px)',
    marginLeft: 0,
    backgroundColor: '#fafafa',
  },
  container: {},
});

class Navigation extends React.PureComponent {
  state = {
    mobileOpen: false,
    desktopOpen: true,
  };

  componentDidUpdate(prevProps, prevState) {
    if (this.props.history.action === 'POP' && prevProps.location.pathname === '/unauthenticated/page-1') {
      this.props.finishGuest();
      this.props.resetPermitForm();
      this.props.resetVehicleForm();
    }
  }

  handleDesktopDrawer = () => {
    this.setState({ desktopOpen: !this.state.desktopOpen });
  };

  handleMobileDrawer = () => {
    this.setState({ mobileOpen: !this.state.mobileOpen });
  };

  renderAdminControls() {
    if (this.props.accountLevel !== null && this.props.accountLevel === 300) {
      const {
        location: { pathname },
      } = this.props;
      return (
        <React.Fragment>
          <ListItem
            button
            component={Link}
            to='/dashboard'
            selected={pathname === '/dashboard'}
            onClick={() => {
              if (this.state.mobileOpen === true) {
                this.handleMobileDrawer();
              }
              this.props.resetPermitForm();
              this.props.resetVehicleForm();
            }}
          >
            <ListItemIcon>
              <Dashboard />
            </ListItemIcon>
            <ListItemText primary='Dashboard' />
          </ListItem>
        </React.Fragment>
      );
    }
    return null;
  }

  render() {
    const {
      classes,
      location: { pathname },
      children,
      guestForm,
      authState,
      firstName,
      lastName,
      emailAddress,
    } = this.props;
    const drawer = (
      <div style={{ marginTop: '-5px' }}>
        <Hidden smDown>
          <div className={classes.toolbar} />
        </Hidden>
        <List style={{ backgroundColor: '#000', fontSize: '12px', color: '#fff' }}>
          {/* <Hidden smUp> */}
          <ListItem>
            <br />
            <img src={knights} alt='knights' height='100px' />
          </ListItem>
          {/* </Hidden> */}
          <ListItem>
            {`${firstName} ${lastName}\n`}
            <br />
            <br />
            {`${emailAddress}`}
          </ListItem>
        </List>
        <List>
          <ListItem
            button
            component={Link}
            to='/'
            selected={pathname === '/'}
            onClick={() => {
              if (this.state.mobileOpen === true) {
                this.handleMobileDrawer();
              }
              this.props.resetPermitForm();
              this.props.resetVehicleForm();
            }}
          >
            <ListItemIcon>
              <Home />
            </ListItemIcon>
            <ListItemText primary='Home' />
          </ListItem>
          {this.renderAdminControls()}
          <ListItem
            button
            component={Link}
            to='/information'
            selected={pathname === '/information'}
            onClick={() => {
              if (this.state.mobileOpen === true) {
                this.handleMobileDrawer();
              }
              this.props.resetPermitForm();
              this.props.resetVehicleForm();
            }}
          >
            <ListItemIcon>
              <ContactSupport />
            </ListItemIcon>
            <ListItemText primary='Information' />
          </ListItem>
          <ListItem
            button
            component={Link}
            to='/'
            onClick={() => {
              if (this.state.mobileOpen === true) {
                this.handleMobileDrawer();
              }
              this.props.signOut();
              this.props.history.push('/');
              this.props.resetPermitForm();
              this.props.resetVehicleForm();
            }}
          >
            <ListItemIcon>
              <ArrowBack />
            </ListItemIcon>
            <ListItemText primary='Sign Out' />
          </ListItem>
        </List>
      </div>
    );

    if (guestForm === false && authState === 'guest') {
      return (
        <React.Fragment>
          <React.Suspense fallback={<Spinner />}>
            <SignIn />
          </React.Suspense>
        </React.Fragment>
      );
    }
    if (guestForm === true && authState === 'guest') {
      return (
        <React.Fragment>
          <React.Suspense fallback={<Spinner />}>
            <div style={{ margin: '5%' }}>
              <GuestRouter />
            </div>
          </React.Suspense>
        </React.Fragment>
      );
    }
    return (
      <div>
        <CssBaseline />
        <div className={classes.root}>
          <AppBar position='fixed' className={classes.appBar}>
            <Toolbar>
              <IconButton
                color='inherit'
                aria-label='open drawer'
                onClick={() => {
                  this.handleDesktopDrawer();
                  this.handleMobileDrawer();
                }}
                className={classes.menuButton}
              >
                <Menu />
              </IconButton>
              <Link
                to='/'
                style={{
                  textDecoration: 'none',
                  color: 'white',
                  fontSize: '24px',
                }}
                onClick={() => {
                  this.props.resetPermitForm();
                  this.props.resetVehicleForm();
                }}
              >
                <Typography variant='h6' color='inherit'>
                  Virtually No Tag
                </Typography>
              </Link>
            </Toolbar>
          </AppBar>
          <Hidden mdUp>
            <SwipeableDrawer
              variant='temporary'
              open={this.state.mobileOpen}
              onOpen={this.handleMobileDrawer}
              onClose={this.handleMobileDrawer}
              classes={{
                paper: classNames(classes.drawerPaper, this.state.mobileOpen && classes.drawerPaper),
              }}
              ModalProps={{
                keepMounted: true, // Better open performance on mobile.
              }}
            >
              {drawer}
            </SwipeableDrawer>
          </Hidden>
          <Hidden smDown implementation='css'>
            <SwipeableDrawer
              variant='permanent'
              open={this.state.mobileOpen}
              onOpen={this.handleDesktopDrawer}
              onClose={this.handleDesktopDrawer}
              classes={{
                paper: classNames(
                  classes.drawerPaper,
                  this.state.desktopOpen === true && classes.drawerPaper,
                  this.state.desktopOpen === false && classes.drawerPaperClose
                ),
              }}
            >
              {drawer}
            </SwipeableDrawer>
          </Hidden>
          <Hidden mdUp>
            <Paper
              classes={{
                root: classNames(classes.contentPaperClose, this.state.mobileOpen && classes.contentPaperClose),
              }}
            >
              <NavigationRouter />
              {children}
            </Paper>
          </Hidden>
          <Hidden smDown implementation='css'>
            <Paper
              classes={{
                root: classNames(
                  classes.contentPaper,
                  this.state.desktopOpen === true && classes.contentPaper,
                  this.state.desktopOpen === false && classes.contentPaperClose
                ),
              }}
            >
              <NavigationRouter />
              {children}
            </Paper>
          </Hidden>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  if (state.auth.user !== null) {
    return {
      authState: state.auth.authState,
      accountLevel: state.auth.user.accountLevel,
      guestForm: state.auth.guestForm,
      emailAddress: state.auth.user.emailAddress,
      firstName: state.auth.user.firstName,
      lastName: state.auth.user.lastName,
    };
  }
  return {
    authState: state.auth.authState,
    accountLevel: null,
    guestForm: state.auth.guestForm,
    emailAddress: '',
    firstName: '',
    lastName: '',
  };
};

const mapDispatchToProps = dispatch => ({
  signOut: () => dispatch(userSignOut()),
  finishGuest: () => dispatch(finishGuestForm()),
  resetPermitForm: () => dispatch(reset('PermitForm')),
  resetVehicleForm: () => dispatch(reset('VehiclesForm')),
});

export default compose(
  withRouter,
  withStyles(styles),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(Navigation);
