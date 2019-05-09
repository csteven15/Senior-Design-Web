import React from 'react';
import { withStyles } from '@material-ui/core/styles';

const styles = () => ({
  root: {
    width: '100%',
    padding: '6px 0 7px',
    cursor: 'text',
  },
});

class StripeInput extends React.PureComponent {
  render() {
    const { classes: c, component: Component, onFocus, onBlur, onChange } = this.props;

    return <Component className={c.root} onFocus={onFocus} onBlur={onBlur} onChange={onChange} placeholder='' />;
  }
}

export default withStyles(styles)(StripeInput);
