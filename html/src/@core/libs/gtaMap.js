import {
  latLngBounds,
  latLng,
  Util,
  CRS,
  Projection,
  Transformation,
} from 'leaflet/dist/leaflet-src.esm'

const centerX = 122.9
const centerY = 146.65
const scaleX = 0.01422
const scaleY = 0.01424

const CUSTOM_MAX_BOUNDS = latLngBounds([
  latLng(8700, 7000),
  latLng(-5000, -6400),
])

const CUSTOM_CORS = Util.extend({}, CRS.Simple, {
  projection: Projection.LonLat,
  scale(zoom) {
    return 2 ** zoom
  },
  zoom(sc) {
    return Math.log(sc) / 0.6931471805599453
  },
  distance(pos1, pos2) {
    const xDifference = pos2.lng - pos1.lng
    const yDifference = pos2.lat - pos1.lat
    return Math.sqrt(xDifference * xDifference + yDifference * yDifference)
  },
  transformation: new Transformation(scaleX, centerX, -scaleY, centerY),
  infinite: true,
})

const MAP_TILES = [
  {
    name: 'Atlas',
    visible: true,
    url: 'https://cdn.unlimited.wtf/mapfiles/atlas_cayo/{z}/{x}/{y}.png',
    color: '#006bcd',
    options: {
      minZoom: 0,
      maxZoom: 7,
      bounds: latLngBounds([latLng(10200, 8500), latLng(-6500, -5900)]),
    },
  },
]

const MAP_OVERLAYS = [
  {
    name: 'Postal',
    visible: false,
    url: 'https://cdn.unlimited.wtf/mapfiles/postal_01/{z}/{x}/{y}.png',
    options: {
      minZoom: 0,
      maxZoom: 7,
      bounds: latLngBounds([latLng(10200, 8500), latLng(-6500, -5900)]),
    },
  },
]

export { CUSTOM_CORS, CUSTOM_MAX_BOUNDS, MAP_TILES, MAP_OVERLAYS }
