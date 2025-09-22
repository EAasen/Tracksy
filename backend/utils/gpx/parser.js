const crypto = require('crypto');
const { parseStringPromise } = require('xml2js');

/**
 * Parse raw GPX XML buffer and extract track points.
 * Returns { points: [{ lon, lat, ele, time }], checksum }
 */
async function parseGpx(buffer) {
  const checksum = crypto.createHash('sha256').update(buffer).digest('hex');
  const xml = buffer.toString('utf8');
  let doc;
  try {
    doc = await parseStringPromise(xml, { explicitArray: true, mergeAttrs: true });
  } catch (e) {
    const err = new Error('INVALID_GPX_XML');
    err.code = 'INVALID_GPX_XML';
    throw err;
  }
  const gpx = doc.gpx;
  if (!gpx) {
    const err = new Error('MISSING_GPX_ROOT');
    err.code = 'INVALID_GPX_XML';
    throw err;
  }
  // Navigate to first trk > trkseg > trkpt
  const trks = gpx.trk || [];
  if (!trks.length) {
    const err = new Error('NO_TRACK');
    err.code = 'NO_TRACK';
    throw err;
  }
  const firstTrk = trks[0];
  const segs = (firstTrk.trkseg) || [];
  if (!segs.length || !segs[0].trkpt || !segs[0].trkpt.length) {
    const err = new Error('NO_TRACKPOINTS');
    err.code = 'NO_TRACKPOINTS';
    throw err;
  }
  const pts = [];
  for (const p of segs[0].trkpt) {
    const lon = parseFloat(p.lon?.[0] || p.lon);
    const lat = parseFloat(p.lat?.[0] || p.lat);
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;
    const ele = p.ele && p.ele[0] ? parseFloat(p.ele[0]) : null;
    const time = p.time && p.time[0] ? new Date(p.time[0]) : null;
    pts.push({ lon, lat, ele, time });
  }
  if (pts.length < 2) {
    const err = new Error('INSUFFICIENT_POINTS');
    err.code = 'INSUFFICIENT_POINTS';
    throw err;
  }
  return { points: pts, checksum };
}

module.exports = { parseGpx };
