import React from 'react';
import Enzyme from '../Enzyme';
import AppProvider from '../AppProvider';
import { Provider } from 'react-redux';
import { MuiThemeProvider } from '@material-ui/core';
import { SnackbarProvider } from 'notistack';
import App from '../App';

// tests if AppProvider loads all providers
describe('<AppProvider />', () => {
  it('renders all providers without crashing', () => {
    const wrapper = Enzyme.shallow(<AppProvider />);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find(Provider).exists()).toBe(true);
    expect(wrapper.find(MuiThemeProvider).exists()).toBe(true);
    expect(wrapper.find(SnackbarProvider).exists()).toBe(true);
    expect(wrapper.find(App).exists()).toBe(true);
  });
});
