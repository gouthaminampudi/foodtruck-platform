import React from "react";
import { StyleSheet } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

export default function CustomerMap({ mapRegion, nearbyTruckMarkers, placeLabel }) {
  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={styles.mapView}
      pointerEvents="none"
      initialRegion={mapRegion}
      region={mapRegion}
      scrollEnabled={false}
      zoomEnabled={false}
      rotateEnabled={false}
      pitchEnabled={false}
      showsUserLocation
      showsMyLocationButton
      showsCompass
    >
      <Marker
        coordinate={{
          latitude: mapRegion.latitude,
          longitude: mapRegion.longitude
        }}
        title="You are here"
        description={placeLabel}
        pinColor="#22404b"
      />
      {nearbyTruckMarkers.map((truck) => (
        <Marker
          key={truck.id}
          coordinate={{
            latitude: truck.latitude,
            longitude: truck.longitude
          }}
          title={truck.name}
          description={`${truck.cuisine} · ${truck.eta} · ${truck.distance}`}
          pinColor={truck.pinColor}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  mapView: {
    width: "100%",
    height: "100%"
  }
});
