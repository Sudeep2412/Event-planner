const fetch = require('node-fetch');

async function testOverpass() {
  let lat = 19.0760;
  let lng = 72.8777;
  let radiusMeters = 20000;
  
  const overpassQuery = `
    [out:json];
    (
      node(around:${radiusMeters}, ${lat}, ${lng})["amenity"="restaurant"];
      node(around:${radiusMeters}, ${lat}, ${lng})["leisure"="park"];
    );
    out 5;
  `;
  try {
    const overpassRes = await fetch(`https://overpass-api.de/api/interpreter`, {
      method: 'POST',
      body: 'data=' + encodeURIComponent(overpassQuery),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    const data = await overpassRes.text();
    console.log("Raw Response:");
    console.log(data);
  } catch (err) {
    console.error("Overpass failed:", err.message);
  }
}
testOverpass();
