import React from 'react';
import ReactMapGL from 'react-map-gl';

const MAPBOX_TOKEN = 'pk.eyJ1Ijoic2VhbmF0aGFubWxlZSIsImEiOiJjanJyMWtzdG8xdW10NDlwOXc4bDNtejA3In0.jfEEyI0M1BWfsoEOVe84sA';

class MapUber extends React.Component {
  state = {
    viewport: {
      latitude: 28.6024274,
      longitude: -81.2022486,
      zoom: 14,
    },
  };

  onViewportChange = viewport => {
    const { width, height, ...etc } = viewport;
    this.setState({ viewport: etc });
  };

  render() {
    const { viewport } = this.state;
    let url = 'mapbox://sprites/mapbox/streets-v8';
    if (this.props.permit) {
      url = this.props.permit;
    }
    return (
      <ReactMapGL
        mapStyle={url}
        width='95%'
        height='700px'
        {...viewport}
        mapboxApiAccessToken={MAPBOX_TOKEN}
        onViewportChange={viewport => this.onViewportChange(viewport)}
        style={{ minWidth: '300px' }}
      />
    );
  }
}

export default MapUber;
