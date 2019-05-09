import React from 'react';
import Enzyme from '../../Enzyme';
import GuestRouter from '../../routes/GuestRouter';
import { Route } from 'react-router-dom';

// Makes sure GuestRouter contains routes
describe('<GuestRouter />', () => {
  it('renders and contains routes', () => {
    const wrapper = Enzyme.shallow(<GuestRouter />);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find(Route).exists()).toBe(true);
  });
});
