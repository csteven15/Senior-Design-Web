import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Spinner from '../components/generic/Spinner';
import Notifier from '../components/Notifier';
import Navigation from '../components/Navigation';

const Permits = React.lazy(() => import('../pages/Permits'));
const Information = React.lazy(() => import('../pages/Information'));
const SignIn = React.lazy(() => import('../pages/SignIn'));
const Dashboard = React.lazy(() => import('../pages/Dashboard'));
const GuestRouter = React.lazy(() => import('./GuestRouter'));

export const AppRouter = () => (
  <BrowserRouter>
    <React.Fragment>
      <Notifier />
      <Navigation>
        <React.Suspense fallback={<Spinner />}>
          <Switch>
            <Route exact path='/' component={props => <Permits {...props} />} />
            <Route exact path='/dashboard' component={props => <Dashboard {...props} />} />
            <Route exact path='/information' component={props => <Information {...props} />} />
            <Route exact path='/signin' component={props => <SignIn {...props} />} />
            <Route path='/unauthenticated' render={props => <GuestRouter {...props} />} />
          </Switch>
        </React.Suspense>
      </Navigation>
    </React.Fragment>
  </BrowserRouter>
);

export default AppRouter;
