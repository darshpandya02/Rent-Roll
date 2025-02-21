import React from "react";
import mark from "../images/icons/gps.png";
import ReactMapGL, { Marker } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
// import mapboxgl from "!mapbox-gl";
// import MapboxWorker from "worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker";

// mapboxgl.workerClass = MapboxWorker;
const Map = () => {
  const longitude = -71.10104;
  const latitude = 42.33416;
  const [viewport, setViewport] = React.useState({
    latitude: latitude,
    longitude: longitude,
    width: "100vw",
    height: "80vh",
    zoom: 12,
  });
  return (
    <div style={{ marginBottom: "2rem" }}>
      <h2
        style={{
          color: "white",
          marginBottom: "5rem",
          display: "block",
          fontWeight: "700",
        }}>
        OUR <span style={{ color: "#4B0082df" }}>LOCATION</span>
      </h2>
      <ReactMapGL
        {...viewport}
        mapboxApiAccessToken="pk.eyJ1IjoiZGFyc2hwYW5keWEwMiIsImEiOiJjbTdiNHEwaWgwNnUwMm1waXJlZG84NDA1In0.vBosJZHMTVLkKff_WOif2w"
        onViewportChange={(viewport) => setViewport(viewport)}
        mapStyle={"mapbox://styles/mapbox/navigation-night-v1"}>
        <Marker latitude={latitude} longitude={longitude}>
          <div className="marker">
            <a href="https://maps.app.goo.gl/ak2dtaqiw6ntdD7f9" target="_blank">
              <img
                src={mark}
                alt="Our Location"
                style={{ height: "50px", width: "48px" }}
              />
            </a>
          </div>
        </Marker>
      </ReactMapGL>
    </div>
  );
};

export default Map;
