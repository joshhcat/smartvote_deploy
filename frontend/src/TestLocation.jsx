import React, { useEffect, useState } from "react";

const TestLocation = () => {
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (err) => {
        setError(`Error getting location: ${err.message}`);
      }
    );
  }, []);

  return (
    <div>
      <h2>Your Location</h2>
      {error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : location.latitude && location.longitude ? (
        <p>
          Latitude: {location.latitude} <br />
          Longitude: {location.longitude}
        </p>
      ) : (
        <p>Fetching location...</p>
      )}
    </div>
  );
};

export default TestLocation;
