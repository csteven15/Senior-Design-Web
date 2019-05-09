import React from 'react';
import MapGL from 'react-map-gl';
import axios from 'axios';
import { connect } from 'react-redux';
import { fetchHelper } from '../actions/AuthActions';
import { enqueueSnackbar } from '../actions/UIActions';
import { Typography, Paper } from '@material-ui/core';
import { InlineDatePicker } from 'material-ui-pickers';

const MAPBOX_TOKEN = 'pk.eyJ1Ijoic2VhbmF0aGFubWxlZSIsImEiOiJjanJyMWtzdG8xdW10NDlwOXc4bDNtejA3In0.jfEEyI0M1BWfsoEOVe84sA';
const HEATMAP_SOURCE_ID = 'permit-violations';

class HeatMap extends React.Component {
  constructor(props) {
    super(props);
    let today = new Date();
    this.state = {
      viewport: {
        latitude: 28.6024274,
        longitude: -81.2022486,
        zoom: 15,
        bearing: 0,
        pitch: 0,
      },
      startDate: new Date(today.getTime() - 1000 * 60 * 60 * 24).getTime(),
      endDate: new Date().getTime(),
      violations: null,
    };

    this._mapRef = React.createRef();
    this.handleStartDateChange = this.handleStartDateChange.bind(this);
    this.handleEndDateChange = this.handleEndDateChange.bind(this);
  }

  handleStartDateChange = date => {
    this.setState({ startDate: date.getTime() }, () => this.updateMap());
  };

  handleEndDateChange = date => {
    date.setHours(23, 59, 59, 999);
    this.setState({ endDate: date.getTime() }, () => this.updateMap());
  };

  makeFeatureCollection = features => ({ type: 'FeatureCollection', features });

  makeHeatMapLayer = (id, source) => {
    const MAX_ZOOM_LEVEL = 24;
    return {
      id,
      source,
      maxzoom: MAX_ZOOM_LEVEL,
      type: 'heatmap',
      paint: {
        // Increase the heatmap weight based on frequency and property magnitude
        'heatmap-weight': ['interpolate', ['linear'], ['get', 'mag'], 0, 0, 1, 1],
        // Increase the heatmap color weight weight by zoom level
        // heatmap-intensity is a multiplier on top of heatmap-weight
        'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, MAX_ZOOM_LEVEL, 3],
        // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
        // Begin color ramp at 0-stop with a 0-transparancy color
        // to create a blur-like effect.
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0,
          'rgba(33,102,172,0)',
          0.2,
          'rgb(103,169,207)',
          0.4,
          'rgb(209,229,240)',
          0.6,
          'rgb(253,219,199)',
          0.8,
          'rgb(239,138,98)',
          1,
          'rgb(178,24,43)',
        ],
        // Adjust the heatmap radius by zoom level
        'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, MAX_ZOOM_LEVEL, 20],
        // Transition from heatmap to circle layer by zoom level
        'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 7, 1, 50, 0],
      },
    };
  };

  onViewportChange = viewport => this.setState({ viewport });

  getMap = () => {
    return this._mapRef.current ? this._mapRef.current.getMap() : null;
  };

  setMapData = features => {
    const map = this._getMap();
    map && map.getSource(HEATMAP_SOURCE_ID).setData(this._mkFeatureCollection(features));
  };

  componentDidMount() {
    const map = this.getMap();
    let urlParams = {
      startDate: this.state.startDate,
      endDate: this.state.endDate,
    };
    this.props.fetchHelp().then(res => {
      axios
        .get(`/api/violations/fetchViolations?${new URLSearchParams(urlParams).toString()}`, {
          headers: res.headers,
        })
        .then(res => {
          if (res.status !== 400) {
            let violations = {
              type: 'FeatureCollection',
              features: [],
            };
            let data = res.data.results;
            data.map(violation => {
              let transformedViolation = {
                geometry: {
                  coordinates: [violation.location.longitude, violation.location.latitude, violation.location.altitude],
                  type: 'Point',
                },
                properties: {
                  date: violation.data,
                  issuer: violation.issuer,
                  licensePlate: violation.licensePlate,
                },
                type: 'Feature',
              };
              violations.features.push(transformedViolation);
              return 0;
            });
            this.setState({ violations: violations }, () => {
              map.on('load', () => {
                map.addSource(HEATMAP_SOURCE_ID, {
                  type: 'geojson',
                  data: violations,
                });
                map.addLayer(this.makeHeatMapLayer('heatmap-layer', HEATMAP_SOURCE_ID));
              });
            });
          } else {
            this.props.dispatch(
              enqueueSnackbar({
                message: `Failed to fetch data.`,
                options: {
                  variant: 'warning',
                },
              })
            );
          }
        });
    });
  }

  updateMap = () => {
    const map = this.getMap();
    let newStartDate = new Date(this.state.startDate).setHours(0, 0, 0, 0);
    let newEndDate = new Date(this.state.endDate).setHours(23, 59, 59, 999);
    let urlParams = {
      startDate: newStartDate,
      endDate: newEndDate,
    };
    this.props.fetchHelp().then(res => {
      axios
        .get(`/api/violations/fetchViolations?${new URLSearchParams(urlParams).toString()}`, {
          headers: res.headers,
        })
        .then(res => {
          if (res.status !== 400) {
            let violations = {
              type: 'FeatureCollection',
              features: [],
            };
            let data = res.data.results;
            data.map(violation => {
              let transformedViolation = {
                geometry: {
                  coordinates: [violation.location.longitude, violation.location.latitude, violation.location.altitude],
                  type: 'Point',
                },
                properties: {
                  date: violation.data,
                  issuer: violation.issuer,
                  licensePlate: violation.licensePlate,
                },
                type: 'Feature',
              };
              violations.features.push(transformedViolation);
              return 0;
            });
            this.setState({ violations: violations }, () => {
              map.getSource(HEATMAP_SOURCE_ID).setData(this.makeFeatureCollection(violations.features));
            });
          } else {
            this.props.dispatch(
              enqueueSnackbar({
                message: `Failed to fetch data.`,
                options: {
                  variant: 'warning',
                },
              })
            );
          }
        });
    });
  };

  render() {
    const { viewport, startDate, endDate } = this.state;
    return (
      <div style={{ height: '100%' }}>
        <MapGL
          ref={this._mapRef}
          {...viewport}
          width='100%'
          height='95%'
          mapStyle='mapbox://styles/mapbox/dark-v9'
          onViewportChange={this.onViewportChange}
          mapboxApiAccessToken={MAPBOX_TOKEN}
        />
        <Paper
          style={{
            width: '250px',
            position: 'absolute',
            right: '30px',
            top: '100px',
            padding: '20px',
          }}
        >
          <Typography variant='body1' gutterBottom>
            Showing Heat Map from:
          </Typography>
          <Typography variant='body1' gutterBottom>
            Start Date
          </Typography>
          <InlineDatePicker
            keyboard={false}
            clearable
            disableOpenOnEnter
            value={startDate}
            onChange={this.handleStartDateChange}
            maxdate={new Date()}
            disableFuture
            format='MM/dd/yyyy'
            mask={date => (date ? [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/] : [])}
          />
          <br />
          <br />
          <Typography variant='body1' gutterBottom>
            End Date
          </Typography>
          <InlineDatePicker
            keyboard={false}
            clearable
            disableOpenOnEnter
            value={endDate}
            onChange={this.handleEndDateChange}
            minDate={startDate}
            maxdate={new Date()}
            format='MM/dd/yyyy'
            disableFuture
            mask={date => (date ? [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/] : [])}
          />
        </Paper>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  fetchHelp: (url, method, header, body) => dispatch(fetchHelper(url, method, header, body)),
});

export default connect(
  null,
  mapDispatchToProps
)(HeatMap);
