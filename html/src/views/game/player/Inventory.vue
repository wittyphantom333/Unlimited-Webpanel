<template>
  <div class="row justify-between">
    <!--  Inventory  -->
    <div class="q-pa-sm" :class="{ 'full-width': isMobile }">
      <q-card class="bg-secondary">
        <q-card-section class="col-12">
          <div class="row">
            <div class="text-h6">
              {{ $t('components.inventory.playerInventory') }}
            </div>
            <q-btn
              v-if="can(ACTION.GAME.PLAYER.INVENTORY, RESOURCE.GAME)"
              color="primary"
              icon="add"
              class="q-ml-auto"
              @click="addItem('p')"
            >
              <q-tooltip v-if="!dragging">
                {{ $t('components.inventory.addItemTip') }}
              </q-tooltip>
            </q-btn>
            <q-btn
              v-if="can(ACTION.GAME.PLAYER.INVENTORY, RESOURCE.GAME)"
              color="primary"
              icon="clear"
              class="q-ml-sm"
              @click="clearInventory"
            >
              <q-tooltip v-if="!dragging">
                {{ $t('components.inventory.clearInvTip') }}
              </q-tooltip>
            </q-btn>
          </div>
        </q-card-section>
        <q-card-section class="col-12 inventory-wrapper q-pa-none">
          <transition
            appear
            enter-active-class="animated fadeIn"
            leave-active-class="animated fadeOut"
          >
            <div
              :class="
                isMobile ? 'inventory-container-mobile' : 'inventory-container'
              "
            >
              <!--  Item  -->
              <div
                v-show="!loading"
                v-for="(item, index) in inventory"
                :key="`p-${index}`"
                class="item-slot"
                :id="`p:${index}`"
                v-on="
                  !item
                    ? {}
                    : {
                        mousedown: selectItem,
                        touchstart: selectItem,
                      }
                "
              >
                <template v-if="item">
                  <item :item="item" :isPlayer="true" />
                  <q-tooltip
                    v-if="
                      item.info &&
                      Object.keys(item.info).length !== 0 &&
                      !dragging
                    "
                    :offset="[0, 8]"
                  >
                    <div
                      v-for="(info, key) in item.info"
                      :key="`p-${index}-${key}`"
                    >
                      {{ key }}: {{ info }}
                    </div>
                  </q-tooltip>
                </template>
                <template v-else>
                  <fake-item :slotNumber="index + 1" />
                </template>
              </div>
            </div>
          </transition>
        </q-card-section>
        <q-inner-loading dark :showing="loading">
          <q-spinner-cube color="primary" size="2em" />
        </q-inner-loading>
      </q-card>
    </div>

    <!--  Actions  -->
    <div
      class="q-pa-sm self-center actions"
      :class="{ 'full-width': isMobile }"
    >
      <q-card
        class="bg-secondary q-mb-md"
        id="edit:0"
        style="border: 2px solid transparent"
      >
        <div class="extra-dropzone row justify-center items-center text-main">
          <q-icon name="edit" size="5vh" />
        </div>
      </q-card>
      <q-card class="bg-secondary">
        <q-input
          label-color="primary"
          :input-style="{ color: 'var(--q-main)' }"
          filled
          type="number"
          v-model.number="amount"
          :label="$t(`components.inventory.amount`)"
        />
      </q-card>
      <q-card
        class="bg-secondary q-mt-md"
        id="delete:0"
        style="border: 2px solid transparent"
      >
        <div class="extra-dropzone row justify-center items-center text-main">
          <q-icon name="delete" size="5vh" />
        </div>
      </q-card>
    </div>

    <!--  Support Stash  -->
    <div class="q-pa-sm" :class="{ 'full-width': isMobile }">
      <q-card class="bg-secondary">
        <q-card-section class="col-12">
          <div class="row">
            <div class="text-h6">
              {{ $t('components.inventory.supporterStash') }}
            </div>
            <q-btn
              v-if="can(ACTION.GAME.PLAYER.INVENTORY, RESOURCE.GAME)"
              color="primary"
              icon="add"
              class="q-ml-auto"
              @click="addItem('s')"
            >
              <q-tooltip v-if="!dragging">
                {{ $t('components.inventory.addItemTip') }}
              </q-tooltip>
            </q-btn>
          </div>
        </q-card-section>
        <q-card-section class="col-12 inventory-wrapper q-pa-none">
          <transition
            appear
            enter-active-class="animated fadeIn"
            leave-active-class="animated fadeOut"
          >
            <div
              :class="
                isMobile ? 'inventory-container-mobile' : 'inventory-container'
              "
            >
              <!--  Item  -->
              <div
                v-show="!loading"
                v-for="(item, index) in supStash"
                :key="`s-${index}`"
                class="item-slot"
                :id="`s:${index}`"
                v-on="
                  !item
                    ? {}
                    : {
                        mousedown: selectItem,
                        touchstart: selectItem,
                      }
                "
              >
                <template v-if="item">
                  <item :item="item" />
                  <q-tooltip
                    v-if="
                      item.info &&
                      Object.keys(item.info).length !== 0 &&
                      !dragging
                    "
                    :offset="[0, 8]"
                  >
                    <div
                      v-for="(info, key) in item.info"
                      :key="`p-${index}-${key}`"
                    >
                      {{ key }}: {{ info }}
                    </div>
                  </q-tooltip>
                </template>
                <template v-else>
                  <fake-item />
                </template>
              </div>
            </div>
          </transition>
        </q-card-section>
        <q-inner-loading dark :showing="loading">
          <q-spinner-cube color="primary" size="2em" />
        </q-inner-loading>
      </q-card>
    </div>
  </div>
</template>

<script>
import FakeItem from '@/components/FakeItem.vue'
import Item from '@/components/Item.vue'
import BasicDialog from '@/components/BasicDialog.vue'
import BasicPrompt from '@/components/BasicPrompt.vue'
import AddGameItem from '@/components/AddGameItem.vue'
import EditGameItem from '@/components/EditGameItem.vue'
import { RESOURCE, ACTION } from '../../../../../common/permissions'
import { can } from '@core/layouts/utils'
import { exportFile } from 'quasar'

export default {
  name: 'Inventory',
  components: {
    FakeItem,
    Item,
  },
  data() {
    return {
      RESOURCE,
      ACTION,
      loading: false,
      amount: 0,
      supportStashSlots: 250,
      playerSlots: 0,
      inventory: [],
      supStash: [],
      // Item Movement Data / Dragging
      dragging: false,
      dragAndDrop: {
        shiftX: null,
        shiftY: null,
        clonedElement: null,
        itemIndex: null,
        selectedElement: null,
      },
    }
  },
  computed: {
    isMobile() {
      return this.$q.platform.is.mobile
    },
  },
  methods: {
    can,
    isNumeric(value) {
      return /^-?\d+$/.test(value)
    },
    async loadInventory() {
      await this.$axios
        .get(`/api/players/${this.$route.params.citizenid}/inventory`)
        .then(r => {
          const resCode = r.data.resCode
          const inventory = r.data.inventory
          const playerSlots = r.data.playerSlots
          const stash = r.data.stash

          if (!resCode || !inventory || !playerSlots || !stash) {
            this.$q.notify({
              message: 'Error',
              position: 'top',
              color: 'red',
              icon: 'fas fa-exclamation-triangle',
              caption: this.$i18n.t(
                `components.inventory.msg.error.${r.data.resMsg}`
              ),
            })
            setTimeout(this.$router.back(), 1500)
            return
          }

          this.updateInventory(inventory, playerSlots)
          this.updateStash(stash)
        })
        .catch(() => {
          this.$q.notify({
            message: 'Error',
            position: 'top',
            color: 'red',
            icon: 'fas fa-exclamation-triangle',
            caption: this.$i18n.t('components.inventory.msg.error.failedLoad'),
          })
          this.$q
            .dialog({
              component: BasicDialog,
              componentProps: {
                title: this.$i18n.t('components.inventory.msg.error.fixPlayer'),
                message: this.$i18n.t(
                  'components.inventory.msg.error.fixPlayerText'
                ),
              },
              cancel: true,
              persistent: true,
            })
            .onOk(() => {
              this.$axios
                .post(
                  `/api/players/${this.$route.params.citizenid}/inventory/fix-items`
                )
                .then(r => {
                  const { resCode, resMsg, resItems } = r.data

                  if (!resCode) {
                    this.$q.notify({
                      message: 'Error',
                      position: 'top',
                      color: 'red',
                      icon: 'fas fa-exclamation-triangle',
                    })
                    this.$router.push({ name: 'game-player-list' })
                    return
                  }

                  const status = exportFile(
                    'deletedItems.txt',
                    Object.entries(resItems)
                      .map(
                        ([k, v]) => `Slot ${k}: ${JSON.stringify(v, null, 4)}`
                      )
                      .join('\n')
                  )

                  this.$q
                    .dialog({
                      component: BasicPrompt,
                      componentProps: {
                        title: this.$i18n.t('general.success'),
                        message: this.$i18n.t(
                          'components.inventory.msg.success.fixedPlayerItems'
                        ),
                      },
                      persistent: true,
                    })
                    .onDismiss(() => {
                      this.$router
                        .push({
                          name: 'game-player-detail',
                          params: { citizenid: this.$route.params.citizenid },
                        })
                        .then(() => {
                          this.$router.go()
                        })
                    })
                })
            })
            .onCancel(() => {
              this.$router.back()
            })
        })
    },
    updateInventory(items, playerSlots) {
      const sizeToUse =
        Object.keys(items).length > playerSlots
          ? Object.keys(items).length
          : playerSlots
      const inventory = new Array(sizeToUse).fill(null)

      for (const [_, value] of Object.entries(items)) {
        const slot = value.slot
        inventory[slot - 1] = value
      }

      this.playerSlots = playerSlots
      this.inventory = inventory
    },
    updateStash(items) {
      const sizeToUse =
        Object.keys(items).length > this.supportStashSlots
          ? Object.keys(items).length
          : this.supportStashSlots
      const supStash = new Array(sizeToUse).fill(null)

      for (const [_, value] of Object.entries(items)) {
        const slot = value.slot
        supStash[slot - 1] = value
      }

      this.supStash = supStash
    },
    getTarget(e) {
      const isTouchElement = e.changedTouches ? e.changedTouches[0] : false
      let target = e.target

      if (isTouchElement) {
        target = document.elementFromPoint(
          isTouchElement.clientX,
          isTouchElement.clientY
        )
      }

      return target
    },
    selectItem(e) {
      if (!this.can(ACTION.GAME.PLAYER.INVENTORY, RESOURCE.GAME)) return
      if (this.dragging) {
        return
      }

      this.dragging = true

      // Calculate Element Size
      const element = document.getElementById(e.target.id)

      if (!element) {
        this.dragging = false
        return
      }

      const touch =
        (e.touches && e.touches[0]) ||
        (e.pointerType && e.pointerType === 'touch' && e)
      const clientX = (touch || e).clientX
      const clientY = (touch || e).clientY

      this.dragAndDrop.shiftX = clientX - element.getBoundingClientRect().left
      this.dragAndDrop.shiftY = clientY - element.getBoundingClientRect().top
      this.dragAndDrop.selectedElement = {
        style: element.style,
        classList: element.classList.toString(),
      }

      this.dragAndDrop.itemIndex = e.target.id

      // Append Cloned Element to Page and Modify Style
      const clonedElement = element.cloneNode(true)
      clonedElement['id'] = `cloned-${element.id}`
      document.getElementById('app').append(clonedElement)

      this.clonedElement = document.getElementById(`cloned-${element.id}`)
      this.clonedElement.style.left = `${clientX - this.dragAndDrop.shiftX}px`
      this.clonedElement.style.top = `${clientY - this.dragAndDrop.shiftY}px`
      this.clonedElement.classList.add('item-clone')
      this.clonedElement.style.position = 'absolute'

      // Modify Current Element
      element.style.pointerEvents = 'none'
      element.style.setProperty('opacity', '0.2', 'important')

      // Toggle Event Listeners
      document.addEventListener('mouseup', this.dropItem)
      document.addEventListener('touchend', this.dropItem)
      document.addEventListener('touchmove', this.updatePosition, {
        passive: false,
      })
      document.addEventListener('mousemove', this.updatePosition) // This calls UpdatePosition
    },
    updatePosition(e) {
      const touch =
        (e.touches && e.touches[0]) ||
        (e.pointerType && e.pointerType === 'touch' && e)
      const clientX = (touch || e).clientX
      const clientY = (touch || e).clientY

      this.clonedElement.style.left = `${clientX - this.dragAndDrop.shiftX}px`
      this.clonedElement.style.top = `${clientY - this.dragAndDrop.shiftY}px`

      this.mouseOver(e)
      e.preventDefault()
    },
    mouseOver(e) {
      const target = this.getTarget(e)
      if (this.lastHoverID) {
        const element = document.getElementById(this.lastHoverID)
        element.style.setProperty('border', '2px solid transparent')
        element.children[0].classList.remove('text-negative')
        this.lastHoverID = null
      }

      if (!e || !target || !target.id || target.id === '') {
        return
      }

      if (!this.lastHoverID && target.id === 'delete:0') {
        const element = document.getElementById(target.id)
        element.style.setProperty(
          'border',
          `2px dashed var(--q-negative)`,
          'important'
        )
        element.children[0].classList.add(`text-negative`)
        this.lastHoverID = target.id
      }

      if (!this.lastHoverID && target.id === 'edit:0') {
        const element = document.getElementById(target.id)
        element.style.setProperty(
          'border',
          `2px dashed var(--q-primary)`,
          'important'
        )
        element.children[0].classList.add(`text-primary`)
        this.lastHoverID = target.id
      }
    },
    async dropItem(e) {
      this.dragging = false
      const target = this.getTarget(e)

      if (this.lastHoverID) {
        const element = document.getElementById(this.lastHoverID)
        element.style.setProperty('border', '2px solid transparent')
        element.children[0].classList.remove('text-negative')
        element.children[0].classList.remove('text-primary')
        this.lastHoverID = null
      }

      document.removeEventListener('mouseup', this.dropItem)
      document.removeEventListener('touchend', this.dropItem)
      document.removeEventListener('touchmove', this.updatePosition)
      document.removeEventListener('mousemove', this.updatePosition)

      this.clonedElement.remove()

      const selectElement = document.getElementById(this.dragAndDrop.itemIndex)
      selectElement.style.pointerEvents = 'all'
      selectElement.style.setProperty('opacity', '1.0', 'important')

      if (!e || !target || !target.id || target.id === '') {
        return
      }

      // drop slot
      const [endSlotType, endSlotNumber] = target.id.split(':')
      if (!endSlotType || !this.isNumeric(endSlotNumber)) return

      // drag slot
      const [startSlotType, startSlotNumber] =
        this.dragAndDrop.itemIndex.split(':')
      if (!startSlotType || !this.isNumeric(startSlotNumber)) return

      // return if dropped on origin slot
      const isSameSlot =
        startSlotNumber === endSlotNumber && startSlotType === endSlotType
      if (isSameSlot) return

      this.loading = true

      // droped on delete slot
      if (target.id === 'delete:0') {
        this.$q
          .dialog({
            component: BasicDialog,
            componentProps: {
              title: this.$i18n.t('components.inventory.deleteHeader'),
              message: this.$i18n.t('components.inventory.deleteMsg'),
            },
            cancel: true,
            persistent: true,
          })
          .onOk(() => {
            this.$axios
              .post(
                `/api/players/${this.$route.params.citizenid}/inventory/delete`,
                {
                  fromStorage: startSlotType,
                  fromSlot: parseInt(startSlotNumber) + 1,
                  amount: this.amount,
                }
              )
              .then(r => {
                const resCode = r.data.resCode
                this.loading = false

                if (!resCode) {
                  const resMsg = r.data.resMsg
                  this.$q.notify({
                    message: this.$i18n.t('general.error'),
                    position: 'top',
                    color: 'red',
                    icon: 'fas fa-exclamation-triangle',
                    caption: this.$i18n.t(
                      `components.inventory.msg.error.${resMsg}`
                    ),
                  })
                  return
                }

                this.$q.notify({
                  message: this.$i18n.t('general.success'),
                  position: 'top',
                  color: 'green',
                  icon: 'fas fa-check',
                  caption: this.$i18n.t('general.deleted'),
                })
              })
              .catch(e => {
                console.error(e)
                this.loading = false
              })
          })
          .onCancel(() => {
            this.loading = false
          })
        return
      }

      // droped on edit slot
      if (target.id === 'edit:0') {
        this.$q
          .dialog({
            component: EditGameItem,
            componentProps: {
              title: this.$i18n.t('components.item.edit'),
              item: this.getItem(startSlotType, startSlotNumber),
            },
            cancel: true,
            persistent: true,
          })
          .onOk(res => {
            if (res.item.amount <= 0) res.item.amount = 1

            this.$axios
              .post(
                `/api/players/${this.$route.params.citizenid}/inventory/edit`,
                {
                  fromStorage: startSlotType,
                  fromSlot: parseInt(startSlotNumber) + 1,
                  item: res.item,
                }
              )
              .then(r => {
                const resCode = r.data.resCode
                this.loading = false

                if (!resCode) {
                  const resMsg = r.data.resMsg
                  this.$q.notify({
                    message: this.$i18n.t('general.error'),
                    position: 'top',
                    color: 'red',
                    icon: 'fas fa-exclamation-triangle',
                    caption: this.$i18n.t(
                      `components.inventory.msg.error.${resMsg}`
                    ),
                  })
                  return
                }

                this.$q.notify({
                  message: this.$i18n.t('general.success'),
                  position: 'top',
                  color: 'green',
                  icon: 'fas fa-check',
                  caption: this.$i18n.t('general.saved'),
                })
              })
              .catch(e => {
                console.error(e)
                this.loading = false
              })
          })
          .onCancel(() => {
            this.loading = false
          })
        return
      }

      await this.$axios
        .post(`/api/players/${this.$route.params.citizenid}/inventory/move`, {
          fromStorage: startSlotType,
          toStorage: endSlotType,
          fromSlot: parseInt(startSlotNumber) + 1,
          toSlot: parseInt(endSlotNumber) + 1,
          amount: this.amount,
        })
        .then(r => {
          const resCode = r.data.resCode
          this.loading = false

          if (!resCode) {
            const msg = r.data.resMsg
            this.$q.notify({
              message: this.$i18n.t('general.error'),
              position: 'top',
              color: 'red',
              icon: 'fas fa-exclamation-triangle',
              caption: this.$i18n.t(`components.item.msg.error.${msg}`),
            })
            if (msg === 'moved') this.loadInventory()
          }

          // success
        })
    },
    addItem(storage) {
      this.$q
        .dialog({
          component: AddGameItem,
          componentProps: {
            title: this.$i18n.t('components.inventory.addItemHeader'),
          },
          cancel: true,
          persistent: true,
        })
        .onOk(res => {
          if (!res.item.name) {
            this.$q.notify({
              message: this.$i18n.t('general.error'),
              position: 'top',
              color: 'red',
              icon: 'fas fa-exclamation-triangle',
              caption: this.$i18n.t(
                `components.inventory.msg.error.noItemName`
              ),
            })
            return
          }

          this.loading = true

          if (!res.item.amount) res.item.amount = 1

          this.$axios
            .post(
              `/api/players/${this.$route.params.citizenid}/inventory/add`,
              {
                storage: storage,
                item: res.item,
              }
            )
            .then(r => {
              const resCode = r.data.resCode
              this.loading = false

              if (!resCode) {
                const resMsg = r.data.resMsg
                this.$q.notify({
                  message: this.$i18n.t('general.error'),
                  position: 'top',
                  color: 'red',
                  icon: 'fas fa-exclamation-triangle',
                  caption: this.$i18n.t(
                    `components.inventory.msg.error.${resMsg}`
                  ),
                })
                return
              }

              this.$q.notify({
                message: this.$i18n.t('general.success'),
                position: 'top',
                color: 'green',
                icon: 'fas fa-check',
                caption: this.$i18n.t('general.added'),
              })
            })
            .catch(e => {
              console.error(e)
              this.loading = false
            })
        })
        .onCancel(() => {
          this.loading = false
        })
    },
    clearInventory() {
      this.$q
        .dialog({
          component: BasicDialog,
          componentProps: {
            title: this.$i18n.t('components.inventory.clearInvHeader'),
            message: this.$i18n.t('components.inventory.clearInvMsg'),
          },
          cancel: true,
          persistent: true,
        })
        .onOk(() => {
          this.loading = true

          this.$axios
            .post(
              `/api/players/${this.$route.params.citizenid}/inventory/clear`
            )
            .then(r => {
              const resCode = r.data.resCode
              this.loading = false

              if (!resCode) {
                const resMsg = r.data.resMsg
                this.$q.notify({
                  message: this.$i18n.t('general.error'),
                  position: 'top',
                  color: 'red',
                  icon: 'fas fa-exclamation-triangle',
                  caption: this.$i18n.t(
                    `components.inventory.msg.error.${resMsg}`
                  ),
                })
                return
              }

              this.$q.notify({
                message: this.$i18n.t('general.success'),
                position: 'top',
                color: 'green',
                icon: 'fas fa-check',
                caption: this.$i18n.t('general.cleared'),
              })
            })
            .catch(e => {
              console.error(e)
              this.loading = false
            })
        })
        .onCancel(() => {
          this.loading = false
        })
    },
    getItem(type, slotIndex) {
      const storage = type === 'p' ? this.inventory : this.supStash

      return storage[slotIndex]
    },
  },
  async mounted() {
    await this.loadInventory()
    this.sockets.subscribe(
      `inventory::${this.$route.params.citizenid}`,
      data => {
        this.updateInventory(data.items, this.playerSlots)
      }
    )
    this.sockets.subscribe(`supstash::update`, data => {
      this.updateStash(data.stash)
    })
    this.$socket.emit('room::join', `inventory:${this.$route.params.citizenid}`)
    this.$socket.emit('room::join', `supstash`)
  },
  beforeUnmount() {
    this.sockets.unsubscribe(`inventory::${this.$route.params.citizenid}`)
    this.sockets.unsubscribe(`supstash::update`)
    this.$socket.emit(
      'room::leave',
      `inventory:${this.$route.params.citizenid}`
    )
    this.$socket.emit('room::leave', `supstash`)
  },
}
</script>

<style lang="scss">
.actions {
  width: 15vh;
}

.inventory-wrapper {
  overflow-y: auto;
  overflow-x: hidden;
  background: #3b4253;
  height: 76vh;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 50px;
    background: var(--q-primary);
  }
}

.inventory-container {
  display: grid;
  box-sizing: border-box;
  grid-template-columns: repeat(4, 9.5vh);
  grid-gap: 0 4px;

  @media (min-width: 800px) {
    grid-template-columns: repeat(3, 9.5vh);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 9.5vh);
  }

  @media (min-width: 1440px) {
    grid-template-columns: repeat(5, 9.5vh);
  }
}

.inventory-container-mobile {
  display: flex;
  flex-wrap: wrap;
}

.item-slot {
  width: 9.5vh;
  display: flex;
  flex-direction: column;
  user-select: none;
  border: 1px solid rgb(68 68 68 / 40%);
  border-radius: 4px;
  margin: 2px;
}

.item {
  width: 9.5vh;
  font-size: 1.1vh;
  color: var(--q-main);
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: pointer;
  user-select: none !important;
  pointer-events: none !important;

  .header {
    display: flex;
    justify-content: space-between;
    height: 1.8vh;
    user-select: none !important;
    pointer-events: none !important;

    .slot {
      text-align: left;
      font-weight: bold;
      user-select: none !important;
      pointer-events: none !important;
    }

    .info {
      font-size: 0.9vh;
      flex-grow: 1;
      text-align: right;
      user-select: none !important;
      pointer-events: none !important;
    }
  }

  .image {
    height: 6.4vh;
    max-width: 9.5vh;
    user-select: none !important;
    pointer-events: none !important;
  }

  .caption {
    height: 2.8vh;
    background-color: rgba(0, 0, 0, 0.3);
    width: 100%;
    text-align: center;
    line-height: 2.8vh;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    user-select: none !important;
    pointer-events: none !important;
  }
}

.item-clone {
  position: fixed !important;
  pointer-events: none !important;
  z-index: 100;
}

.extra-dropzone {
  height: 15vh;
  width: 100%;
  user-select: none !important;
  pointer-events: none !important;
}
</style>
