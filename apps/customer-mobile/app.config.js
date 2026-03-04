const { expo } = require("./app.json");

const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY ?? "";

module.exports = () => ({
  ...expo,
  ios: {
    config: {
      googleMapsApiKey
    }
  },
  android: {
    config: {
      googleMaps: {
        apiKey: googleMapsApiKey
      }
    }
  }
});
