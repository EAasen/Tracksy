// Geospatial utility functions (ADR-0002)
// Haversine distance between two [lon,lat] points in meters
function haversine(a, b) {
  const R = 6371000; // earth radius meters
  const toRad = d => d * Math.PI / 180;
  const [lon1, lat1] = a;
  const [lon2, lat2] = b;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const sLat1 = toRad(lat1);
  const sLat2 = toRad(lat2);
  const h = Math.sin(dLat/2)**2 + Math.cos(sLat1) * Math.cos(sLat2) * Math.sin(dLon/2)**2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function computeDistance(coords) {
  let d = 0;
  for (let i=1;i<coords.length;i++) d += haversine(coords[i-1], coords[i]);
  return d;
}

function computeBbox(coords) {
  let minLon=Infinity,minLat=Infinity,maxLon=-Infinity,maxLat=-Infinity;
  for (const [lon,lat] of coords) {
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }
  return [minLon,minLat,maxLon,maxLat];
}

function computeCenter(bbox) {
  const [minLon,minLat,maxLon,maxLat] = bbox;
  return [ (minLon+maxLon)/2, (minLat+maxLat)/2 ];
}

module.exports = { computeDistance, computeBbox, computeCenter };