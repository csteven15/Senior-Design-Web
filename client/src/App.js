import React from 'react';
import { connect } from 'react-redux';
import AppRouter from './routes/AppRouter';
import { initializeForm } from './actions/UIActions';

export class App extends React.Component {
  componentDidMount() {
    this.updateUser();
  }

  updateUser = () => {
    this.props.initializeFormValues();
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.accountLevel !== this.props.accountLevel) {
      this.updateUser();
      return true;
    }
    return false;
  }

  render() {
    return <AppRouter />;
  }
}

const mapStateToProps = state => ({
  accountLevel: state.auth.user.accountLevel,
});

const mapDispatchToProps = dispatch => ({
  initializeFormValues: () => dispatch(initializeForm()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
