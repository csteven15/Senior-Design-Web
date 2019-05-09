import React from 'react';
import { Input, InputLabel, FormHelperText, FormControl } from '@material-ui/core';
import StripeInput from './StripeInput';

class StripeElementWrapper extends React.PureComponent {
  state = {
    focused: false,
    empty: true,
    error: false,
  };

  handleBlur = () => {
    this.setState({ focused: false });
  };

  handleFocus = () => {
    this.setState({ focused: true });
  };

  handleChange = changeObj => {
    this.setState({
      error: changeObj.error,
      empty: changeObj.empty,
    });
  };

  render() {
    const { component, label, autoComplete } = this.props;
    const { focused, empty, error } = this.state;

    return (
      <React.Fragment>
        <FormControl margin='normal' required fullWidth>
          <InputLabel autoComplete={autoComplete} focused={focused} shrink={focused || !empty} error={!!error}>
            {label}
          </InputLabel>
          <Input
            fullWidth
            inputComponent={StripeInput}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
            onChange={this.handleChange}
            inputProps={{ component }}
            error={!!error}
          />
        </FormControl>
        {error && <FormHelperText error>{error.message}</FormHelperText>}
      </React.Fragment>
    );
  }
}

export default StripeElementWrapper;
