import React from 'react';
import Enzyme from '../Enzyme';
import App from '../App';

// tests if App renders
describe('<App />', () => {
  it('renders', () => {
    const wrapper = Enzyme.shallow(<App />);
    expect(wrapper.exists()).toBe(true);
  });
});
