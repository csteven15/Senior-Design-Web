import React from 'react';
import { withRouter, Switch, Route } from 'react-router-dom';
import Spinner from '../components/generic/Spinner';

const PurchasePermit = React.lazy(() => import('../components/payment/PurchasePermit'));
const PurchaseVehicle = React.lazy(() => import('../components/payment/PurchaseVehicle'));
const Summary = React.lazy(() => import('../components/payment/Summary'));
const Review = React.lazy(() => import('../components/payment/Review'));
const PurchasePayment = React.lazy(() => import('../components/payment/PurchasePayment'));
const AddVehicle = React.lazy(() => import('../pages/AddVehicle'));

const GuestRouter = () => (
  <React.Suspense fallback={<Spinner />}>
    <Switch>
      <Route exact path='/unauthenticated/page-1' component={props => <PurchasePermit {...props} unauthenticated />} />
      <Route exact path='/unauthenticated/page-2' component={props => <PurchaseVehicle {...props} unauthenticated />} />
      <Route exact path='/unauthenticated/page-3' component={props => <PurchasePayment {...props} unauthenticated />} />
      <Route exact path='/unauthenticated/page-4' component={props => <Review {...props} unauthenticated />} />
      <Route exact path='/unauthenticated/page-5' component={props => <Summary {...props} unauthenticated />} />
      <Route exact path='/unauthenticated/addVehicle' component={props => <AddVehicle {...props} unauthenticated />} />
    </Switch>
  </React.Suspense>
);

export default withRouter(GuestRouter);
