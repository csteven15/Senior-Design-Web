import React from 'react';
import SwipeableViews from 'react-swipeable-views';
import {
  AppBar,
  Typography,
  Grid,
  Tabs,
  Tab,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  ListItem,
  ListItemText,
  Avatar,
  Paper,
  Button,
} from '@material-ui/core';
import { ExpandMore as ExpandMoreIcon } from '@material-ui/icons';
import MapUber from '../components/MapUber';

const TabContainer = ({ children }) => {
  return (
    <Paper elevation={9} style={{ overflowX: 'hidden' }}>
      {children}
    </Paper>
  );
};

const permits = [
  {
    permit: 'A',
    color: '#9E9E9E',
    description: 'Only the university president, vice presidents, dean, and others as approved are eligible to purchase A permits.',
    url: 'mapbox://styles/seanathanmlee/cjrzjhrpl00ki1fofvfl3kwmr',
  },
  {
    permit: 'B',
    color: '#d60000',
    description: 'Only university employees are eligible to purchase B permits.',
    url: 'mapbox://styles/seanathanmlee/cjrzjet1p0crb1fpds9dbhekd',
  },
  {
    permit: 'C',
    color: '#00bbe1',
    description: 'Only university staff are elibible to purchase C permits.',
    url: 'mapbox://styles/seanathanmlee/cjrzjbyp52g8q1gqkbxpu9doi',
  },
  {
    permit: 'D',
    color: '#00c81b',
    description: 'Only commuting students are eligible to purchase D permits.',
    url: 'mapbox://styles/seanathanmlee/cjrzgoqs82h4k1fkycd20daz5',
  },
  {
    permit: 'KP',
    color: '#a800e9',
    description: 'Only students who live in the Towers at Knights Plaza are eligible to purchase KP permits.',
    url: 'mapbox://styles/seanathanmlee/cjrziz8020cd01fpd6duncopx',
  },
  {
    permit: 'R',
    color: '#ebbc00',
    description: 'Only students who live in Academic Village, Appolo, and Libra Communities are eligible to purchase R permits.',
    url: 'mapbox://styles/seanathanmlee/cjrzj9imm324y1fohv21ejx93',
  },
  {
    permit: 'RL',
    color: '#ebbc00',
    description: 'Only students who live int he Lake Claire Community are eligible to purchase RL permits.',
    url: 'mapbox://styles/seanathanmlee/cjrzj6rvg2hyc1fmtk1me9qh2',
  },
  {
    permit: 'G',
    color: '#000000',
    description: 'Visitors to the UCF campus are eligible for a daily permit.',
    url: 'mapbox://styles/seanathanmlee/cjrzi1v9z311l1fohbfn25yxq',
  },
];

const faq = [
  {
    question: 'Are permits requried at Lake Nona, the Downtown Campus, and Rosen?',
    answer: 'UCF parking permits are required at all locations.',
  },
  {
    question: 'Is there any location on campus that does not require a parking permit?',
    answer: 'The campus is parking by UCF parking permit or daily fee only. There are no locations on campus that provide free parking.',
  },
  {
    question: 'Is there a fee to park in garage F?',
    answer:
      ' Garage F is complimentary for guests visiting the Knights Plaza except when there is an event. Please note signs for areas that require a specific parking permit.',
  },
  {
    question: 'Is there free parking after 5:30 PM?',
    answer:
      'There is no free parking on campus. However, after 5:30PM, students with valid UCF permits are permitted to park in B and C lots, except any specifically designated space.',
  },
  {
    question: 'Where can visitors park on campus?',
    answer: 'Visitors may park in any D (green) student lot or garage once a daily permit has been purchased.',
  },
  {
    question: 'Where can I park as an overnight guest?',
    answer:
      'Overnight guests need to purchase a multi-day parking permit which allows parking in Garage A, B, C, I, as well as designated student surface lots. These permits may be purchased at the Visitor and Parking Information Center or the main parking service’s office in Garage B.',
  },
];

const contact = [
  {
    heading: 'Parking Services',
    hours: 'Monday – Friday 7:30 a.m. – 5:00 p.m.',
    phone: '(407) 823-5812',
    fax: '(407)823-6715',
  },
  {
    heading: 'Police Department',
    hours: 'Open 24 Hours a Day',
    phone: '(407) 823-5555',
    fax: '(407) 823-5429',
  },
  {
    heading: 'Visitors and Parking Information Center',
    hours: 'Monday – Friday  7:00 a.m. – 5:00 p.m.',
    hours2: 'Saturday 7:30 a.m. – 4:00 p.m.',
    phone: '(407) 823-2131',
    email: 'vicenter@ucf.edu',
  },
  {
    heading: 'Safety Escort/Patrol Services',
    hours: 'Sunday – Saturday: 7:00 p.m. – 1:00 a.m.',
    phone: '(407) 823-2424',
  },
  {
    heading: 'Transportation Visitors Information Center',
    hours: 'Monday – Friday: 7:30 a.m. – 5:00 p.m.',
    phone: '(407)823-2131',
    email: 'shuttles@ucf.edu',
  },
];

class Information extends React.Component {
  state = {
    value: 0,
    permit: 'mapbox://styles/seanathanmlee/cjrzgoqs82h4k1fkycd20daz5',
  };

  handleChange = (event, value) => {
    this.setState({ value });
  };

  handleChangeIndex = index => {
    this.setState({ value: index });
  };

  permit = permit => {
    this.setState({ permit: permit });
  };

  handleClose = () => {
    this.setState({ permit: null });
  };

  updateMap = permit => {
    this.setState({ permit: permit });
  };

  render() {
    return (
      <div>
        <Typography variant='h4' gutterBottom component='h4'>
          Information
        </Typography>
        <AppBar position='static' color='default'>
          <Tabs value={this.state.value} onChange={this.handleChange} indicatorColor='primary' textColor='primary' variant='fullWidth'>
            <Tab label='Permit Types' />
            <Tab label='FAQS' />
            <Tab label='Contact' />
          </Tabs>
        </AppBar>
        <SwipeableViews axis={'x'} index={this.state.value} onChangeIndex={this.handleChangeIndex}>
          <TabContainer>
            <Grid container>
              <Grid item md={6} sm={12} xs={12}>
                <Grid container>
                  {permits.map(item => (
                    <ListItem key={item.permit}>
                      <Avatar style={{ backgroundColor: item.color }}>{item.permit}</Avatar>
                      <ListItemText>
                        <Grid container>
                          <Grid item xs={12}>
                            {item.description}
                          </Grid>
                          <Grid item xs={12}>
                            <Button variant='contained' color='secondary' onClick={() => this.updateMap(item.url)}>
                              View on map
                            </Button>
                          </Grid>
                        </Grid>
                      </ListItemText>
                    </ListItem>
                  ))}
                </Grid>
              </Grid>
              <Grid item md={6} sm={12} xs={12}>
                <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                  <MapUber permit={this.state.permit} />
                </div>
              </Grid>
            </Grid>
          </TabContainer>
          <TabContainer>
            {faq.map(section => (
              <ExpansionPanel key={section.question}>
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Question: {section.question}</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                  <Typography>Answer: {section.answer}</Typography>
                </ExpansionPanelDetails>
              </ExpansionPanel>
            ))}
          </TabContainer>
          <TabContainer>
            <Grid container spacing={24} style={{ margin: '10px' }}>
              {contact.map(section => (
                <Grid item sm={6} xs={12} key={section.heading}>
                  <h3>{section.heading}</h3>
                  <p>{section.hours}</p>
                  {section.hours2 ? <p>{section.hours2}</p> : null}
                  <p>{section.phone}</p>
                  {section.fax ? <p>{section.fax}</p> : null}
                  {section.email ? <p>{section.email}</p> : null}
                </Grid>
              ))}
            </Grid>
          </TabContainer>
        </SwipeableViews>
      </div>
    );
  }
}

export default Information;
