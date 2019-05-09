import React from 'react';
import Enzyme from '../../Enzyme';
import { Route } from 'react-router-dom';
import NavigationRouter from '../../routes/NavigationRouter';

// Makes sure NavigationRouter contains routes
describe('<NavigationRouter />', () => {
  it('renders and contains routes', () => {
    const wrapper = Enzyme.shallow(<NavigationRouter />);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find(Route).exists()).toBe(true);
  });
});
