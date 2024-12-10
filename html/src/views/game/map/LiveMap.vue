<template>
  <div class="row q-pa-sm">
    <q-slide-transition>
      <DialogWrapper :transition-attrs="{ name: 'dialog' }" />
    </q-slide-transition>

    <q-card
      class="bg-secondary full-width q-mb-md"
      v-if="can(ACTION.GAME.LIVEMAP.PLAYER, RESOURCE.GAME)"
    >
      <div class="row">
        <div class="col-12">
          <q-list>
            <q-expansion-item
              expand-separator
              icon="groups"
              :label="$t('breadcrumb.players')"
            >
              <q-card class="bg-secondary">
                <q-card-section class="row">
                  <q-item v-if="playerList.length === 0" class="col-12">
                    <div class="text-subtitle2 full-width text-center">
                      {{ $t('components.liveMap.noOnlinePlayers') }}
                    </div>
                  </q-item>
                  <q-item
                    class="rounded-borders q-ma-xs"
                    style="background: var(--q-dark)"
                    v-for="player in playerList"
                    :key="`players${player.name}`"
                    clickable
                    v-ripple
                    @click="focusMarker(player)"
                    :active="activeMarker?.name === player.name"
                    @contextmenu.prevent="openPlayerContextMenu($event, player)"
                  >
                    <q-item-section>
                      <q-item-label class="text-primary">{{
                        player.name
                      }}</q-item-label>
                      <q-item-label caption class="text-sub"
                        >ID: {{ player.source }}</q-item-label
                      >
                    </q-item-section>
                  </q-item>
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </q-list>
        </div>
      </div>
    </q-card>

    <q-card
      class="bg-secondary full-width q-mb-md"
      v-if="can(ACTION.GAME.LIVEMAP.VEHICLE, RESOURCE.GAME)"
    >
      <div class="row">
        <div class="col-12">
          <q-list>
            <q-expansion-item
              expand-separator
              icon="time_to_leave"
              :label="$t('breadcrumb.vehicles')"
            >
              <q-card class="bg-secondary">
                <q-card-section class="row">
                  <q-item v-if="vehicleList.length === 0" class="col-12">
                    <div class="text-subtitle2 full-width text-center">
                      {{ $t('components.liveMap.noSpawnedVehicles') }}
                    </div>
                  </q-item>
                  <q-item
                    class="rounded-borders q-ma-xs"
                    style="background: var(--q-dark)"
                    v-for="vehicle in vehicleList"
                    :key="`vehicle${vehicle.plate}`"
                    clickable
                    v-ripple
                    @click="focusMarker(vehicle)"
                    :active="activeMarker?.plate === vehicle.plate"
                    @contextmenu.prevent="
                      openVehicleContextMenu($event, vehicle)
                    "
                  >
                    <q-item-section>
                      <q-item-label class="text-primary">{{
                        vehicle.plate
                      }}</q-item-label>
                      <q-item-label caption class="text-sub">{{
                        vehicle.vehicle
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </q-list>
        </div>
      </div>
    </q-card>

    <q-card class="bg-secondary full-width">
      <div class="row">
        <div class="col-12">
          <l-map
            ref="map"
            :zoom="zoom"
            :center="center"
            :style="{ background: getActiveTileColor }"
            :crs="crs"
            :options="{ zoomControl: false }"
            style="height: 75vh"
            @update:zoom="zoomUpdated"
            @contextmenu="rightClickMap"
          >
            <l-tile-layer
              v-for="tile in tiles"
              :key="tile.name"
              :name="tile.name"
              :url="tile.url"
              :visible="tile.visible"
              attribution="GTAV Map"
              layer-type="base"
              :min-zoom="tile.options.minZoom"
              :max-zoom="tile.options.maxZoom"
              :no-wrap="true"
              :options="tile.options"
            />
            <l-tile-layer
              v-for="overlay in overlays"
              :key="overlay.name"
              :name="overlay.name"
              :url="overlay.url"
              :visible="overlay.visible"
              layer-type="base"
              :min-zoom="overlay.options.minZoom"
              :max-zoom="overlay.options.maxZoom"
              :no-wrap="true"
              :options="overlay.options"
            />

            <!-- Overlay Control -->
            <l-control :position="'topright'">
              <q-card class="bg-secondary q-pr-md">
                <q-checkbox
                  v-for="overlay in overlays"
                  :key="overlay.name"
                  v-model="overlay.visible"
                  :label="overlay.name"
                />
              </q-card>
            </l-control>

            <!-- Marker Control -->
            <l-control :position="'topright'">
              <q-card class="bg-secondary q-pr-md">
                <template
                  v-for="markerGroup in markerGroups"
                  :key="markerGroup.label"
                >
                  <div
                    class="col-12 col-md-2"
                    v-show="can(markerGroup.action, markerGroup.resource)"
                  >
                    <q-checkbox
                      v-model="markerGroup.active"
                      :label="
                        $t(`components.liveMap.markers.${markerGroup.label}`)
                      "
                    />
                  </div>
                </template>
              </q-card>
            </l-control>

            <!-- Zoom -->
            <l-control :position="'topleft'">
              <q-card class="bg-secondary">
                <div
                  class="text-main row column q-pa-xs"
                  style="font-size: 2.3em"
                >
                  <q-btn
                    text-color="main"
                    padding="none"
                    flat
                    icon="add"
                    @click="updateZoom(1)"
                    :disable="isZoomButtonDisabled(7)"
                  />
                  <q-btn
                    text-color="main"
                    padding="none"
                    flat
                    class="q-mt-xs"
                    icon="remove"
                    :disable="isZoomButtonDisabled(1)"
                    @click="updateZoom(-1)"
                  />
                </div>
              </q-card>
            </l-control>

            <!-- Markers -->
            <template v-for="markerGroup in activeMarkers">
              <l-marker
                v-for="(marker, index) in markerGroup.markers"
                :lat-lng="marker.pos"
                :key="`${markerGroup}-${index}`"
                @contextmenu="openContext($event.originalEvent, marker)"
              >
                <l-icon
                  :icon-size="dynamicSize"
                  :icon-anchor="dynamicAnchor"
                  :icon-url="dynamicIcon(markerGroup.icon)"
                />
              </l-marker>
            </template>
          </l-map>
        </div>
      </div>
    </q-card>
  </div>
</template>

<script>
import 'leaflet/dist/leaflet.css'
import {
  LMap,
  LTileLayer,
  LMarker,
  LIcon,
  LControl,
} from '@vue-leaflet/vue-leaflet'
import {
  CUSTOM_CORS,
  CUSTOM_MAX_BOUNDS,
  MAP_TILES,
  MAP_OVERLAYS,
} from '@libs/gtaMap'
import { can } from '@core/layouts/utils'
import { RESOURCE, ACTION } from '../../../../../common/permissions'
import { openDialog } from '@core/extensions/dialog'
import MapPlayerContextMenu from '@/views/game/map/components/MapPlayerContextMenu.vue'
import MapVehicleContextMenu from '@/views/game/map/components/MapVehicleContextMenu.vue'
import MapGeneralContextMenu from "@/views/game/map/components/MapGeneralContextMenu.vue";
import DialogWrapper from '@/components/DialogWrapper.vue'

export default {
  name: 'LiveMap',
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LIcon,
    LControl,
    DialogWrapper,
  },
  data() {
    return {
      RESOURCE,
      ACTION,
      activeMarker: null,
      playerListToggle: true,
      playerList: [],
      vehicleList: [],
      crs: CUSTOM_CORS,
      maxBounds: CUSTOM_MAX_BOUNDS,
      zoom: 2,
      center: [0, 0],
      tiles: MAP_TILES,
      overlays: MAP_OVERLAYS,
      activeTile: 'Atlas',
      tileColors: [
        {
          name: 'Atlas',
          color: '#006bcd',
        },
      ],
      // [y, x]
      markerGroups: {
        vehicles: {
          action: ACTION.GAME.LIVEMAP.VEHICLE,
          resource: RESOURCE.GAME,
          active: true,
          label: 'vehicles',
          icon: 'vehicle',
          markers: [],
        },
        players: {
          action: ACTION.GAME.LIVEMAP.PLAYER,
          resource: RESOURCE.GAME,
          active: true,
          label: 'players',
          icon: 'player',
          markers: [],
        },
      },
      iconSize: 18,
    }
  },
  computed: {
    getActiveTileColor() {
      return this.tileColors.filter(tile => tile.name === this.activeTile)[0]
        .color
    },
    activeMarkers() {
      return Object.values(this.markerGroups).filter(
        group => group.active === true
      )
    },
    dynamicSize() {
      return [this.iconSize, this.iconSize]
    },
    dynamicAnchor() {
      return [this.iconSize / 2, this.iconSize]
    },
  },
  methods: {
    can,
    openDialog,
    openContext(e, marker) {
      if (marker.player) this.openPlayerContextMenu(e, marker.player)
      else if (marker.vehicle) this.openVehicleContextMenu(e, marker.vehicle)
    },
    async openPlayerContextMenu(evt, player) {
      // toDo: Close vehicle context menu
      if (!player) return

      await this.openDialog(MapPlayerContextMenu, {
        evt,
        player,
      })
    },
    async openVehicleContextMenu(evt, vehicle) {
      // toDo: Close player context if open
      if (!vehicle) return

      await this.openDialog(MapVehicleContextMenu, {
        evt,
        vehicle,
      })
    },
    zoomUpdated(zoom) {
      this.zoom = zoom
    },
    updateLiveMap(data) {
      this.playerList = data.players
      this.vehicleList = data.vehicles

      let activeMarkerPresent = false

      // player
      let playerMarkers = []
      data.players.forEach(player => {
        if (this.activeMarker?.name === player.name) {
          activeMarkerPresent = true
          this.activeMarker = player
        }

        playerMarkers.push({
          pos: [player.coords.y, player.coords.x],
          player: player,
        })
      })

      // vehicle
      let vehicleMarkers = []
      data.vehicles.forEach(vehicle => {
        if (this.activeMarker?.plate === vehicle.plate) {
          activeMarkerPresent = true
          this.activeMarker = vehicle
        }

        vehicleMarkers.push({
          pos: [vehicle.coords.y, vehicle.coords.x],
          vehicle: vehicle,
        })
      })

      // active marker
      if (!activeMarkerPresent) this.activeMarker = null
      if (this.activeMarker) {
        this.$refs.map.leafletObject.setView([
          this.activeMarker.coords.y,
          this.activeMarker.coords.x,
        ])
      }

      // set markers
      this.markerGroups.players.markers = playerMarkers
      this.markerGroups.vehicles.markers = vehicleMarkers
    },
    dynamicIcon(icon) {
      return new URL(
        `../../../@core/assets/markers/${icon}.png`,
        import.meta.url
      ).href
    },
    isZoomButtonDisabled(value) {
      return this.zoom === value
    },
    updateZoom(value) {
      this.$refs.map.leafletObject.setZoom(
        this.$refs.map.leafletObject.getZoom() + value
      )
    },
    focusMarker(marker) {
      if (this.activeMarker && this.activeMarker === marker) {
        this.activeMarker = null
        return
      }

      this.activeMarker = marker

      this.$refs.map.leafletObject.flyTo([marker.coords.y, marker.coords.x], 7)
    },
    async rightClickMap(evt) {
      if (!evt.latlng) return
      const [x, y] = [evt.latlng.lng, evt.latlng.lat] // lng = x / lat = y

      await this.openDialog(MapGeneralContextMenu, {
        evt: evt.originalEvent,
        players: this.playerList,
        coords: {
          x: x,
          y: y,
          z: 0,
        },
      })
    },
  },
  mounted() {
    this.sockets.subscribe('livemap::update', this.updateLiveMap)
    this.$socket.emit('room::join', 'livemap')
  },
  beforeUnmount() {
    this.activeMarker = null
    this.sockets.unsubscribe('dashboard::update')
    this.$socket.emit('room::leave', 'livemap')
  },
}
</script>

<style>
.leaflet-control-attribution {
  color: var(--q-main);
  background: transparent !important;
}
</style>
