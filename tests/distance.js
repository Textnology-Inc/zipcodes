var codesUS = require("../lib/codesOld.js"),
  states = require("../lib/states"),
  codesCanada = require("../lib/codesCanada");

var codes = {};
codes.codes = Object.assign({}, codesUS.codes, codesCanada.codes);
codes.stateMap = Object.assign({}, codesUS.stateMap, codesCanada.stateMap);

var lookup = require("../lib/index.js").lookup;
var radius = require("../lib/index.js").radius;

var radiusNew = function (zip, miles, full) {
  var ret = [],
    i,
    d;
  // Validate zip before scanning
  if (!lookup(zip)) return [];
  var zipA = lookup(zip);
  for (i in codes.codes) {
    var zipB = lookup(i);
    if (!zipB) {
      return null;
    }

    if (
      haversine(zipA.latitude, zipA.longitude, zipB.latitude, zipB.longitude) <=
      miles
    ) {
      ret.push(full ? codes.codes[i] : i);
    }
  }

  return ret;
};

var deg2rad = function (value) {
  return value * 0.017453292519943295;
};

function haversine(lat1, lon1, lat2, lon2) {
  // Retuns the great circle distance between two coordinate points in miles
  var dLat = deg2rad(lat2 - lat1);
  var dLon = deg2rad(lon2 - lon1);
  var lat1 = deg2rad(lat1);
  var lat2 = deg2rad(lat2);

  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return 3960 * c;
}

var dist = function (zipA, zipB) {
  zipA = lookup(zipA);
  zipB = lookup(zipB);
  if (!zipA || !zipB) {
    return null;
  }

  var zipALatitudeRadians = deg2rad(zipA.latitude);
  var zipBLatitudeRadians = deg2rad(zipB.latitude);

  var distance =
    Math.sin(zipALatitudeRadians) * Math.sin(zipBLatitudeRadians) +
    Math.cos(zipALatitudeRadians) *
      Math.cos(zipBLatitudeRadians) *
      Math.cos(deg2rad(zipA.longitude - zipB.longitude));

  distance = Math.acos(distance) * 3958.56540656;
  return distance;
};

const zipCodeA = "37167";
const zipCodeB = "37086";

const { latitude, longitude } = codes.codes[zipCodeA];
const { latitude: latitude2, longitude: longitude2 } = codes.codes[zipCodeB];

console.log(radius(zipCodeA, 5));
console.log(radiusNew(zipCodeA, 5));
