import React from 'react';
import { connect } from 'react-redux';
import {
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Hidden,
  InputAdornment,
  FormControl,
  MenuItem,
} from '@material-ui/core';
import { FilterList } from '@material-ui/icons';
import { withRouter } from 'react-router-dom';
import { fetchHelper } from '../actions/AuthActions';
import Spinner from '../components/generic/Spinner';
import axios from 'axios';

class UserSearch extends React.Component {
  state = {
    nid: '',
    first: '',
    last: '',
    email: '',
    level: '',
    results: '100',
    data: null,
  };

  componentDidMount() {
    this.updateTable();
  }

  getLevelNum = type => {
    if (type === '') return '';
    if (type === 'Standard') return '100';
    if (type === 'Enforcer') return '200';
    if (type === 'Administrator') return '300';
    return '';
  };

  getLevelType = level => {
    if (level === '') return 'All';
    if (level === '100') return 'Standard';
    if (level === '200') return 'Enforcer';
    if (level === '300') return 'Administrator';
    return 'All';
  };

  searchOnChange = name => event => {
    if (/\s/g.test(event.target.value)) return;
    this.setState({ [name]: event.target.value.trim() }, () => this.updateTable());
  };

  updateTable = () => {
    let urlParams = {
      usernameFilter: this.state.nid,
      firstNameFilter: this.state.first,
      lastNameFilter: this.state.last,
      emailAddressFilter: this.state.email,
      maxResults: this.state.results,
    };
    urlParams['accountLevelFilter'] = this.getLevelNum(this.state.level);
    this.props
      .fetchHelp()
      .then(res => {
        axios
          .get(`/api/users/searchUsers?${new URLSearchParams(urlParams).toString()}`, {
            headers: res.headers,
          })
          .then(res => this.setState({ data: res.data.results }))
          .catch(err => console.log(err.response));
      })
      .catch(err => console.log(err));
  };

  renderTable = () => {
    const data = [];
    if (this.state.data) {
      this.state.data.map(user => {
        const userData = {};
        const allowedPermits = [];
        userData.username = user.username;
        userData.firstName = user.firstName;
        userData.lastName = user.lastName;
        userData.emailAddress = user.emailAddress;
        if (user.accountLevel === 100) userData.accountLevel = 'Standard';
        if (user.accountLevel === 200) userData.accountLevel = 'Enforcer';
        if (user.accountLevel === 300) userData.accountLevel = 'Administrator';
        user.allowedPermits.map(permit => allowedPermits.push(permit.permitType));
        userData.permits = allowedPermits.join(', ');
        data.push(userData);
        return null;
      });
    }
    const levels = ['All', 'Standard', 'Enforcer', 'Administrator'];
    const tablehead = ['NID', 'First Name', 'Last Name', 'Email', 'Allowed Permits', 'User Level'];
    return (
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              {tablehead.map((header, key) => (
                <TableCell key={key} style={{ fontWeight: 700 }}>
                  {header}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell>
                <TextField
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <FilterList />
                      </InputAdornment>
                    ),
                  }}
                  onChange={this.searchOnChange('nid')}
                  value={this.state.nid}
                />
              </TableCell>
              <TableCell>
                <TextField
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <FilterList />
                      </InputAdornment>
                    ),
                  }}
                  onChange={this.searchOnChange('first')}
                  value={this.state.first}
                />
              </TableCell>
              <TableCell>
                <TextField
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <FilterList />
                      </InputAdornment>
                    ),
                  }}
                  onChange={this.searchOnChange('last')}
                  value={this.state.last}
                />
              </TableCell>
              <TableCell>
                <TextField
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <FilterList />
                      </InputAdornment>
                    ),
                  }}
                  onChange={this.searchOnChange('email')}
                  value={this.state.email}
                />
              </TableCell>
              <TableCell>&nbsp;</TableCell>
              <TableCell>
                <FormControl margin='normal' required fullWidth>
                  <TextField
                    select
                    value={this.state.level}
                    onChange={this.searchOnChange('level')}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <FilterList />
                        </InputAdornment>
                      ),
                    }}
                  >
                    {levels.map((level, key) => (
                      <MenuItem key={key} value={level}>
                        {level}
                      </MenuItem>
                    ))}
                  </TextField>
                </FormControl>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data !== null ? (
              data.map((row, key) => (
                <TableRow
                  onClick={() => {
                    this.props.history.push({
                      pathname: '/users/update',
                      state: { username: row.username },
                    });
                  }}
                  key={key}
                  style={{ cursor: 'pointer' }}
                >
                  <TableCell>{row.username}</TableCell>
                  <TableCell>{row.firstName}</TableCell>
                  <TableCell>{row.lastName}</TableCell>
                  <TableCell>{row.emailAddress}</TableCell>
                  <TableCell>{row.permits}</TableCell>
                  <TableCell>{row.accountLevel}</TableCell>
                </TableRow>
              ))
            ) : (
              <Spinner />
            )}
          </TableBody>
        </Table>
      </Paper>
    );
    // }
  };

  render() {
    return (
      <React.Fragment>
        <Typography variant='h4' gutterBottom component='h4'>
          User Look Up
        </Typography>
        <Button onClick={() => this.props.history.push('/users/create')} color='secondary' variant='contained'>
          Create User
        </Button>
        <br />
        <br />
        <Hidden mdDown>{this.renderTable()}</Hidden>
        <Hidden lgUp>Please switch to a larger screen to use this tool.</Hidden>
      </React.Fragment>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  fetchHelp: (url, method, header, body) => dispatch(fetchHelper(url, method, header, body)),
});

export default withRouter(
  connect(
    null,
    mapDispatchToProps
  )(UserSearch)
);
