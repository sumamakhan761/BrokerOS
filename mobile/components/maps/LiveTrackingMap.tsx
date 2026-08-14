import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

export default function LiveTrackingMap() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    })();
  }, []);

  const toggleMapType = () => {
    setMapType(prev => (prev === 'standard' ? 'satellite' : 'standard'));
  };

  return (
    <View style={styles.container}>
      {location ? (
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          mapType={mapType}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="You are here"
          />
        </MapView>
      ) : (
        <View style={styles.loadingContainer}>
          <Text>{errorMsg || 'Fetching location...'}</Text>
        </View>
      )}

      {/* Custom Map Type Toggle Button */}
      <TouchableOpacity style={styles.toggleBtn} onPress={toggleMapType}>
        <Text style={styles.toggleText}>
          {mapType === 'standard' ? 'Satellite View' : 'Map View'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 350,
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 16,
    position: 'relative',
    backgroundColor: '#e2e8f0'
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleText: {
    fontWeight: '600',
    color: '#334155',
  }
});
