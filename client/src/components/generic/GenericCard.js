import React from 'react';
import { withStyles, Card, CardHeader, CardContent, CardActions, Collapse, IconButton, Menu, MenuItem } from '@material-ui/core';
import classnames from 'classnames';
import { ExpandMore, MoreVert } from '@material-ui/icons';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { fetchHelper } from '../../actions/AuthActions';
import { enqueueSnackbar } from '../../actions/UIActions';
import axios from 'axios';

const styles = theme => ({
  actions: {
    display: 'flex',
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
});

class GenericCard extends React.Component {
  state = {
    expanded: false,
    anchorEl: null,
  };

  handleExpandClick = () => {
    this.setState(state => ({ expanded: !state.expanded }));
  };

  handleClickMore = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleCloseMore = command => {
    this.setState({ anchorEl: null });
    if (command === 'edit') {
      this.props.history.push({
        pathname: '/editVehicle',
        state: { carData: this.props.cardata },
      });
    } else if (command === 'delete') {
      const url = `/api/users/specific/${this.props.username}/removeCar`;
      const body = JSON.stringify({
        id: this.props.cardata._id,
      });
      this.props
        .fetchHelp()
        .then(res => {
          axios
            .post(url, body, {
              headers: res.headers,
            })
            .then(res => {
              if (res.status !== 400) {
                this.props.removeCard(this.props.id);
                this.props.dispatch(
                  enqueueSnackbar({
                    message: `Successfully deleted vehicle`,
                  })
                );
              } else {
                this.props.dispatch(
                  enqueueSnackbar({
                    message: `Failed to delete vehicle`,
                    options: {
                      variant: 'warning',
                    },
                  })
                );
              }
            })
            .catch(err => console.log(err.response));
        })
        .catch(err => {
          console.log(err);
        });
    }
  };

  renderHiddenCardContent() {
    const { classes, hiddencardcontent, leftactions } = this.props;
    if (hiddencardcontent) {
      return (
        <React.Fragment>
          <CardActions className={classes.actions} disableActionSpacing>
            {leftactions}
            <IconButton
              className={classnames(classes.expand, {
                [classes.expandOpen]: this.state.expanded,
              })}
              onClick={this.handleExpandClick}
              aria-expanded={this.state.expanded}
              aria-label='Show more'
            >
              <ExpandMore />
            </IconButton>
          </CardActions>
          <Collapse in={this.state.expanded} timeout='auto' unmountOnExit>
            <CardContent>{hiddencardcontent}</CardContent>
          </Collapse>
        </React.Fragment>
      );
    }
    return null;
  }

  render() {
    const { title, subheader, cardcontent, cardheaderstyle, cardbodystyle, onClick, action } = this.props;

    const { anchorEl } = this.state;

    return (
      <Card style={{ minHeight: '10vw' }}>
        <CardHeader
          title={title}
          subheader={subheader}
          style={cardheaderstyle}
          action={
            action === 'car' ? (
              <React.Fragment>
                <IconButton style={{ zIndex: '100' }} onClick={this.handleClickMore} aria-owns={anchorEl ? 'simple-menu' : undefined} aria-haspopup='true'>
                  <MoreVert />
                </IconButton>
                <Menu id='simple-menu' anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={this.handleCloseMore}>
                  <MenuItem onClick={() => this.handleCloseMore('edit')}>Edit</MenuItem>
                  <MenuItem onClick={() => this.handleCloseMore('delete')}>Delete</MenuItem>
                </Menu>
              </React.Fragment>
            ) : null
          }
        />
        <CardContent style={cardbodystyle} onClick={onClick}>
          {cardcontent}
        </CardContent>
        {this.renderHiddenCardContent()}
      </Card>
    );
  }
}

const mapStateToProps = state => ({
  username: state.auth.user.username,
});

const mapDispatchToProps = dispatch => ({
  fetchHelp: (url, method, header, body) => dispatch(fetchHelper(url, method, header, body)),
  dispatch,
});

export default compose(
  withStyles(styles),
  withRouter,
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(GenericCard);
