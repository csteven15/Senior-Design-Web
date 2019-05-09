import React from 'react';
import { Typography, Grid, Fab, Icon, withStyles } from '@material-ui/core';
import { Link, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { Add as AddIcon } from '@material-ui/icons';
import { fetchHelper } from '../actions/AuthActions';
import GenericCard from '../components/generic/GenericCard';
import axios from 'axios';

const styles = theme => ({
  fab: {
    position: 'fixed',
    bottom: 0,
    right: 0,
    margin: '5%',
  },
});

export class Permits extends React.Component {
  state = {
    permitsData: null,
    today: new Date(),
  };

  componentDidMount() {
    this.fetchPermitsData();
  }

  componentWillUnmount() {
    this.setState({ permitsData: null });
  }

  fetchPermitsData() {
    const { username } = this.props;
    this.props
      .fetchHelp()
      .then(res => {
        axios
          .get(`/api/permits/specific/${username}`, {
            headers: res.headers,
          })
          .then(res => {
            if (res.status !== 400) {
              this.setState({ permitsData: res.data.results });
            }
          });
      })
      .catch(err => console.log(err));
  }

  renderPermits() {
    const { permitsData } = this.state;
    if (permitsData && permitsData.length > 0) {
      return (
        <React.Fragment>
          {permitsData.map((data, key) => {
            const { car, permitType } = data;
            const permit = data;
            const permitColors = this.props.permitTypesList;
            let cardheaderstyle = {};

            for (let i = 0; i < permitColors.length; i++) {
              if (permit.permitType.permitType === permitColors[i].permitType) {
                cardheaderstyle.backgroundColor = permitColors[i].color;
                break;
              }
            }

            const title = (
              <Typography variant='h6' style={{ color: '#ffffff' }}>
                {permitType.permitType}
                &nbsp;Permit
              </Typography>
            );

            const expirationDate = new Date(permit.expirationDate);
            const expiration = `${expirationDate.getMonth() + 1}/${expirationDate.getDate()}/${expirationDate.getFullYear()}`;

            const content = (
              <React.Fragment>
                <p style={{ color: '#9E9E9E' }}>{`${car.year} ${car.make} ${car.model}`}</p>
                <p style={{ color: '#9E9E9E' }}>{`Expires: ${expiration}`}</p>
              </React.Fragment>
            );

            return (
              <Grid item xs={12} sm={4} md={3} key={key}>
                <Link to={{ pathname: `/permits/${key}`, state: { data: permit } }} style={{ textDecoration: 'none' }}>
                  <GenericCard subheader={title} cardcontent={content} hiddencardcontent={null} cardheaderstyle={cardheaderstyle} />
                </Link>
              </Grid>
            );
          })}
        </React.Fragment>
      );
    } else {
      return (
        <Grid item xs={12}>
          <Typography variant='h6'>
            You have no permits!
          </Typography>
          <Typography variant='h6'>
            Press the plus button to add a permit.
          </Typography>
        </Grid>
      );
    }
  }

  render() {
    const { classes } = this.props;
    return (
      <React.Fragment>
        <Typography variant='h4' gutterBottom component='h4'>
          Permits
        </Typography>
        <Grid container spacing={24}>
          {this.renderPermits()}
        </Grid>
        <div className={classes.fab}>
          <Link to='/authenticated/page-1' style={{ textDecoration: 'none' }}>
            <Fab color='secondary' style={{ lineHeight: 0 }}>
              <Icon>
                <AddIcon />
              </Icon>
            </Fab>
          </Link>
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  username: state.auth.user.username,
  permitTypesList: state.ui.formValues.permitTypesList,
});

const mapDispatchToProps = dispatch => ({
  fetchHelp: (url, method, header, body) => dispatch(fetchHelper(url, method, header, body)),
});

export default compose(
  withRouter,
  withStyles(styles),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(Permits);
