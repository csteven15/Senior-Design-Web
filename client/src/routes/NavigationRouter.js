import React from 'react';
import { Switch, Route } from 'react-router-dom';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider } from 'material-ui-pickers';
import Spinner from '../components/generic/Spinner';

const PermitDetails = React.lazy(() => import('../pages/PermitDetails'));
const PurchasePermit = React.lazy(() => import('../components/payment/PurchasePermit'));
const PurchaseVehicle = React.lazy(() => import('../components/payment/PurchaseVehicle'));
const Summary = React.lazy(() => import('../components/payment/Summary'));
const Review = React.lazy(() => import('../components/payment/Review'));
const PurchasePayment = React.lazy(() => import('../components/payment/PurchasePayment'));
const AddVehicle = React.lazy(() => import('../pages/AddVehicle'));
const EditVehicle = React.lazy(() => import('../pages/EditVehicle'));
const User = React.lazy(() => import('../pages/User'));
const UserSearch = React.lazy(() => import('../pages/UserSearch'));
const HeatMap = React.lazy(() => import('../pages/HeatMap'));
const GlobalSettings = React.lazy(() => import('../pages/GlobalSettings'));

const NavigationRouter = () => (
  <React.Fragment>
    <React.Suspense fallback={<Spinner />}>
      <Switch>
        <Route exact path='/users/search' component={props => <UserSearch {...props} />} />
        <Route exact path='/users/create' component={props => <User {...props} create />} />
        <Route exact path='/users/update' component={props => <User {...props} update />} />
        <Route
          exact
          path='/users/heatmap'
          component={props => (
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <HeatMap {...props} />
            </MuiPickersUtilsProvider>
          )}
        />
        <Route exact path='/users/global' component={props => <GlobalSettings {...props} />} />
        <Route exact path='/permits/:number' component={props => <PermitDetails {...props} />} />
        <Route exact path='/authenticated/page-1' component={props => <PurchasePermit {...props} />} />
        <Route exact path='/authenticated/page-2' component={props => <PurchaseVehicle {...props} />} />
        <Route exact path='/authenticated/page-3' component={props => <PurchasePayment {...props} />} />
        <Route exact path='/authenticated/page-4' component={props => <Review {...props} />} />
        <Route exact path='/authenticated/page-5' component={props => <Summary {...props} />} />
        <Route exact path='/addVehicle' component={props => <AddVehicle {...props} />} />
        <Route exact path='/changeVehicle' component={props => <PurchaseVehicle {...props} changeVehicle />} />
        <Route exact path='/editVehicle' component={props => <EditVehicle {...props} />} />
      </Switch>
    </React.Suspense>
  </React.Fragment>
);

export default NavigationRouter;
