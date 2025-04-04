<template>
  <div class="row" v-if="player">
    <div class="col-12 q-pa-sm" v-if="player.banned.length > 0">
      <q-card class="bg-negative" style="height: 100%">
        <q-card-section class="col-12">
          <div class="text-h6">
            <div
                v-for="ban in player.banned"
                :key="ban.time"
                class="text-center"
            >
              {{
                $t('components.player.banMsg', {
                  by: ban.bannedby,
                  reason: ban.reason,
                  expire: new Date(ban.expire * 1000),
                })
              }}
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
    <div class="col-12 q-pa-sm" v-if="player.bans.length > 0">
      <q-card class="q-pa-sm bg-secondary" style="height: 100%">
        <q-card-section class="col-12">
          <div class="text-h6">
            <span class="text-main">{{
                $t('components.player.pastBans')
              }}</span>
          </div>
        </q-card-section>
        <q-card-section class="col-12">
          <q-table
              color="primary"
              card-class="bg-secondary text-main"
              table-class="text-main"
              table-header-class="text-primary"
              flat
              :rows="player.bans"
              :columns="columns"
              row-key="name"
              :pagination="pagination"
              :rows-per-page-options="[0, 5, 10]"
              :pagination-label="getPaginationLabel"
              :rows-per-page-label="`${$t(
              'components.playerList.recordsPerPage'
            )}:`"
          >
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="index" :props="props">
                  {{ props.row.split(']')[0] }}]
                </q-td>
                <q-td key="ban" :props="props">
                  {{ props.row.split(']')[2] }}
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>
    <div class="col-12 col-md-6 q-pa-sm">
      <q-card class="q-pa-sm bg-secondary" style="height: 100%">
        <q-card-section class="col-12">
          <div class="text-h6">
            <span class="text-main">{{
                $t('components.player.headers.general')
              }}</span>
          </div>
        </q-card-section>
        <q-separator></q-separator>
        <q-card-section class="col-12">
          <q-markup-table
              class="bg-secondary text-main"
              flat
              square
              separator="none"
          >
            <tr>
              <td class="text-left">
                {{ $t('components.player.labels.bucket') }}
              </td>
              <template
                  v-if="
                  can(ACTION.GAME.PLAYER.MODIFY, RESOURCE.GAME) &&
                  player.PlayerData.source
                "
              >
                <td class="row">
                  <div style="min-width: 250px" class="col-12 q-ma-xs">
                    <q-input
                        dense
                        label-color="primary"
                        :input-style="{ color: 'var(--q-main)' }"
                        filled
                        type="number"
                        v-model="player.PlayerData.bucket"
                        :label="$t(`components.player.labels.bucket`)"
                    />
                  </div>
                </td>
                <td>
                  <q-btn
                      class="q-ml-md"
                      style="max-height: 24px"
                      text-color="main"
                      color="primary"
                      @click="tryChangeBucket"
                      :label="$t('general.save')"
                  />
                </td>
              </template>
              <td v-else class="text-left">
                {{
                  player.PlayerData.bucket !== null
                      ? player.PlayerData.bucket
                      : $t('general.offline')
                }}
              </td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t('components.player.labels.ip') }}
              </td>
              <td class="text-left">
                {{
                  player.PlayerData.ip
                      ? player.PlayerData.ip
                      : $t('general.offline')
                }}
              </td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t('components.player.labels.discord') }}
              </td>
              <td class="text-left">
                {{
                  player.PlayerData.discord
                      ? player.PlayerData.discord
                      : $t('general.offline')
                }}
              </td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t('components.player.labels.name') }}
              </td>
              <td
                  class="text-left cursor-pointer text-primary"
                  style="text-decoration: underline"
                  v-if="can(ACTION.GAME.PLAYER.READ, RESOURCE.GAME)"
                  @click="
                  $router.push({
                    name: 'game-account-detail',
                    params: { license: player.PlayerData.license },
                        })
                  "
              >
                {{ player.PlayerData.name }}
              </td>
              <td v-else class="text-left">
                {{ player.PlayerData.name }}
              </td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t('components.player.labels.citizenid') }}
              </td>
              <td class="text-left">
                {{ player.PlayerData.citizenid }}
              </td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t('components.player.labels.license') }}
              </td>
              <template v-if="can(ACTION.GAME.PLAYER.MODIFY, RESOURCE.GAME)">
                <td class="row">
                  <div style="min-width: 250px" class="col-12 q-ma-xs">
                    <q-input
                        dense
                        label-color="primary"
                        :input-style="{ color: 'var(--q-main)' }"
                        filled
                        v-model="player.PlayerData.license"
                        :label="$t('components.player.labels.license')"
                    />
                  </div>
                </td>
                <td>
                  <q-btn
                      class="q-ml-md"
                      style="max-height: 24px"
                      text-color="main"
                      color="primary"
                      @click="tryChangeAccount"
                      :label="$t('general.save')"
                  />
                </td>
              </template>
              <td v-else class="text-left">
                {{ player.PlayerData.license }}
              </td>
            </tr>
            <tr>
              <td class="text-left vertical-top">
                {{ $t('components.player.labels.position') }}
              </td>
              <template v-if="can(ACTION.GAME.PLAYER.POSITION, RESOURCE.GAME)">
                <td class="row">
                  <div class="col-12 col-md-3 q-ma-xs" style="min-width: 250px">
                    <q-input
                        dense
                        label-color="primary"
                        :input-style="{ color: 'var(--q-main)' }"
                        filled
                        v-model="player.PlayerData.position.x"
                        label="x"
                    />
                  </div>
                  <div class="col-12 col-md-3 q-ma-xs" style="min-width: 250px">
                    <q-input
                        dense
                        label-color="primary"
                        :input-style="{ color: 'var(--q-main)' }"
                        filled
                        v-model="player.PlayerData.position.y"
                        label="y"
                    />
                  </div>
                  <div class="col-12 col-md-3 q-ma-xs" style="min-width: 250px">
                    <q-input
                        dense
                        label-color="primary"
                        :input-style="{ color: 'var(--q-main)' }"
                        filled
                        v-model="player.PlayerData.position.z"
                        label="z"
                    />
                  </div>
                </td>
                <td class="row" v-if="!player.Offline">
                  <q-btn
                      text-color="main"
                      class="q-ma-xs"
                      @click="teleportPlayer"
                      color="primary"
                      :label="$t('general.teleport')"
                  >
                  </q-btn>
                  <q-btn
                      v-if="can(ACTION.GAME.WAYPOINT.READ, RESOURCE.GAME)"
                      text-color="main"
                      class="q-ma-xs"
                      @click="loadWaypoint"
                      color="primary"
                      :label="$t('components.liveMap.btn.loadFromWaypoint')"
                  >
                  </q-btn>
                </td>
              </template>
              <td v-else class="text-left">
                x: {{ player.PlayerData.position.x }} y:
                {{ player.PlayerData.position.y }} z:
                {{ player.PlayerData.position.z }}
              </td>
            </tr>
          </q-markup-table>
        </q-card-section>
        <q-separator></q-separator>
        <q-card-section class="col-12 q-pb-none">
          <div class="text-h6">
            <span class="text-main">{{
                $t('components.player.headers.actions')
              }}</span>
          </div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div class="row">
            <q-btn
                text-color="main"
                class="q-ma-sm"
                color="primary"
                :label="$t('components.player.buttons.inventory')"
                @click="openInventory"
            />
            <q-btn
                text-color="main"
                v-if="
                player.PlayerData.source &&
                can(ACTION.GAME.PLAYER.SCREEN, RESOURCE.GAME)
              "
                class="q-ma-sm"
                color="primary"
                :label="$t('components.player.buttons.screen')"
                @click="tryGetPlayerScreen"
            />
            <template v-if="can(ACTION.GAME.PLAYER.WARN, RESOURCE.GAME)">
              <q-btn
                  text-color="main"
                  class="q-ma-sm"
                  color="primary"
                  :label="$t('components.player.buttons.warn')"
                  @click="tryPlayerWarn"
              />
            </template>
            <template v-if="can(ACTION.GAME.PLAYER.BAN, RESOURCE.GAME)">
              <q-btn
                  text-color="main"
                  v-if="player.banned.length > 0"
                  class="q-ma-sm"
                  color="primary"
                  :label="$t('components.player.buttons.unban')"
                  @click="tryPlayerUnban"
              />
              <q-btn
                  text-color="main"
                  v-else
                  class="q-ma-sm"
                  color="primary"
                  :label="$t('components.player.buttons.ban')"
                  @click="tryPlayerBan"
              />
            </template>
            <q-btn
                text-color="main"
                v-if="
                player.PlayerData.source &&
                can(ACTION.GAME.PLAYER.KICK, RESOURCE.GAME)
              "
                class="q-ma-sm"
                color="primary"
                :label="$t('components.player.buttons.kick')"
                @click="tryPlayerKick"
            />
            <q-btn
                text-color="main"
                v-if="can(ACTION.GAME.PLAYER.DELETE, RESOURCE.GAME)"
                class="q-ma-sm"
                color="primary"
                :label="$t('general.delete')"
                @click="tryDeletePlayer"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>
    <div class="col-12 col-md-6 q-pa-sm">
      <q-card class="q-pa-sm bg-secondary col-12 col-md-6" style="height: 100%">
        <q-card-section class="col-12">
          <div class="text-h6">
            <span class="text-main">
              {{ $t('components.player.headers.charinfo') }}</span
            >
          </div>
        </q-card-section>
        <q-separator></q-separator>
        <q-card-section class="col-12">
          <q-markup-table
              class="bg-secondary text-main"
              flat
              square
              separator="none"
          >
            <tr>
              <td class="text-left">
                {{ $t('components.player.labels.account') }}
              </td>
              <td class="text-left">
                {{ player.PlayerData.charinfo.account }}
              </td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t('components.player.labels.cid') }}
              </td>
              <template v-if="can(ACTION.GAME.PLAYER.MODIFY, RESOURCE.GAME)">
                <td style="min-width: 250px">
                  <q-input
                      dense
                      label-color="primary"
                      :input-style="{ color: 'var(--q-main)' }"
                      filled
                      type="number"
                      v-model="player.PlayerData.charinfo.cid"
                      :label="$t(`components.player.labels.cid`)"
                  />
                </td>
              </template>
              <td v-else class="text-left">
                {{ player.PlayerData.charinfo.cid }}
              </td>
            </tr>
            <tr>
              <td class="text-left col-4">
                {{ $t('components.player.labels.firstname') }}
              </td>
              <template v-if="can(ACTION.GAME.PLAYER.MODIFY, RESOURCE.GAME)">
                <td style="min-width: 250px">
                  <q-input
                      dense
                      label-color="primary"
                      :input-style="{ color: 'var(--q-main)' }"
                      filled
                      v-model="player.PlayerData.charinfo.firstname"
                      :label="$t(`components.player.labels.firstname`)"
                  />
                </td>
              </template>
              <td v-else class="text-left">
                {{ player.PlayerData.charinfo.firstname }}
              </td>
            </tr>
            <tr>
              <td class="text-left col-4">
                {{ $t('components.player.labels.lastname') }}
              </td>
              <template v-if="can(ACTION.GAME.PLAYER.MODIFY, RESOURCE.GAME)">
                <td style="min-width: 250px">
                  <q-input
                      dense
                      label-color="primary"
                      :input-style="{ color: 'var(--q-main)' }"
                      filled
                      v-model="player.PlayerData.charinfo.lastname"
                      :label="$t(`components.player.labels.lastname`)"
                  />
                </td>
              </template>
              <td v-else class="text-left">
                {{ player.PlayerData.charinfo.lastname }}
              </td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t('components.player.labels.gender') }}
              </td>
              <template v-if="can(ACTION.GAME.PLAYER.MODIFY, RESOURCE.GAME)">
                <td style="min-width: 250px">
                  <q-select
                      color="primary"
                      label-color="main"
                      v-model="player.PlayerData.charinfo.gender"
                      emit-value
                      :options="genders"
                      :popup-content-style="{
                      backgroundColor: 'var(--q-secondary)',
                    }"
                  >
                    <template v-slot:selected>
                      <div class="text-main">
                        {{
                          player.PlayerData.charinfo.gender
                              ? $t(`general.female`)
                              : $t(`general.male`)
                        }}
                      </div>
                    </template>

                    <template v-slot:option="scope">
                      <q-item v-bind="scope.itemProps">
                        <q-item-section>
                          <q-item-label class="text-main">{{
                              scope.opt.label
                            }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </td>
              </template>
              <td v-else class="text-left">
                {{ player.PlayerData.charinfo.gender }}
              </td>
            </tr>
            <tr>
              <td class="text-left col-4">
                {{ $t('components.player.labels.birthdate') }}
              </td>
              <template v-if="can(ACTION.GAME.PLAYER.MODIFY, RESOURCE.GAME)">
                <td style="min-width: 250px">
                  <q-input
                      :label="$t(`components.player.labels.birthdate`)"
                      dense
                      label-color="primary"
                      :input-style="{ color: 'var(--q-main)' }"
                      filled
                      v-model="player.PlayerData.charinfo.birthdate"
                  >
                    <template v-slot:prepend>
                      <q-icon
                          name="event"
                          class="cursor-pointer"
                          color="primary"
                      >
                        <q-popup-proxy
                            cover
                            transition-show="scale"
                            transition-hide="scale"
                        >
                          <q-date
                              v-model="player.PlayerData.charinfo.birthdate"
                              mask="YYYY-MM-DD"
                              color="secondary"
                          >
                            <div class="row items-center justify-end">
                              <q-btn
                                  text-color="main"
                                  v-close-popup
                                  label="Close"
                                  color="primary"
                                  flat
                              />
                            </div>
                          </q-date>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </td>
              </template>
              <td v-else class="text-left">
                {{ player.PlayerData.charinfo.birthdate }}
              </td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t('components.player.labels.nationality') }}
              </td>
              <template v-if="can(ACTION.GAME.PLAYER.MODIFY, RESOURCE.GAME)">
                <td style="min-width: 250px">
                  <q-input
                      dense
                      label-color="primary"
                      :input-style="{ color: 'var(--q-main)' }"
                      filled
                      v-model="player.PlayerData.charinfo.nationality"
                      :label="$t(`components.player.labels.nationality`)"
                  />
                </td>
              </template>
              <td v-else class="text-left">
                {{ player.PlayerData.charinfo.nationality }}
              </td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t('components.player.labels.phone') }}
              </td>
              <template v-if="can(ACTION.GAME.PLAYER.MODIFY, RESOURCE.GAME)">
                <td style="min-width: 250px">
                  <q-input
                      dense
                      label-color="primary"
                      :input-style="{ color: 'var(--q-main)' }"
                      filled
                      v-model="player.PlayerData.charinfo.phone"
                      :label="$t(`components.player.labels.phone`)"
                  />
                </td>
              </template>
              <td v-else class="text-left">
                {{ player.PlayerData.charinfo.phone }}
              </td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t('components.player.labels.backstory') }}
              </td>
              <template v-if="can(ACTION.GAME.PLAYER.MODIFY, RESOURCE.GAME)">
                <td style="min-width: 250px">
                  <q-input
                      dense
                      label-color="primary"
                      :input-style="{ color: 'var(--q-main)' }"
                      filled
                      v-model="player.PlayerData.charinfo.backstory"
                      :label="$t(`components.player.labels.backstory`)"
                  />
                </td>
              </template>
              <td v-else class="text-left">
                {{ player.PlayerData.charinfo.backstory }}
              </td>
            </tr>
          </q-markup-table>
          <q-btn
              text-color="main"
              v-if="can(ACTION.GAME.PLAYER.MODIFY, RESOURCE.GAME)"
              class="q-ma-md"
              color="primary"
              style="max-height: 24px"
              @click="setCharinfo"
              :label="$t('general.save')"
          >
          </q-btn>
        </q-card-section>
      </q-card>
    </div>
    <div class="col-12 col-md-6 q-pa-sm">
      <q-card class="q-pa-sm bg-secondary col-12 col-md-6" style="height: 100%">
        <q-card-section class="col-12">
          <div class="text-h6">
            <span class="text-main">
              {{ $t('components.player.headers.meta') }}</span
            >
          </div>
        </q-card-section>
        <q-separator></q-separator>
        <q-card-section class="col-12">
          <q-markup-table
              class="bg-secondary text-main"
              flat
              square
              separator="none"
          >
            <tr>
              <td class="text-left">
                {{ $t('components.player.labels.isdead') }}
              </td>
              <td v-if="can(ACTION.GAME.PLAYER.META, RESOURCE.GAME)">
                <q-toggle
                    v-model="player.PlayerData.metadata.isdead"
                    color="green"
                    @update:model-value="
                    setMeta('isdead', player.PlayerData.metadata.isdead)
                  "
                />
              </td>
              <td v-else>{{ player.PlayerData.metadata.isdead }}</td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t('components.player.labels.ishandcuffed') }}
              </td>
              <td v-if="can(ACTION.GAME.PLAYER.META, RESOURCE.GAME)">
                <q-toggle
                    v-model="player.PlayerData.metadata.ishandcuffed"
                    color="green"
                    @update:model-value="
                    setMeta(
                      'ishandcuffed',
                      player.PlayerData.metadata.ishandcuffed
                    )
                  "
                />
              </td>
              <td v-else class="text-left">
                {{ player.PlayerData.metadata.ishandcuffed }}
              </td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t('components.player.labels.walletid') }}
              </td>
              <td class="text-left">
                {{ player.PlayerData.metadata.walletid }}
              </td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t('components.player.labels.fingerprint') }}
              </td>
              <td class="text-left">
                {{ player.PlayerData.metadata.fingerprint }}
              </td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t('components.player.labels.bloodtype') }}
              </td>
              <td class="text-left">
                {{ player.PlayerData.metadata.bloodtype }}
              </td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t('components.player.labels.health') }}
              </td>
              <td class="text-left">
                {{
                  player.PlayerData.health
                      ? player.PlayerData.health.toFixed(2)
                      : $t('general.offline')
                }}
              </td>
              <td
                  v-if="
                  can(ACTION.GAME.PLAYER.META, RESOURCE.GAME) &&
                  player.PlayerData.source
                "
              >
                <q-btn
                    text-color="main"
                    color="primary"
                    @click="healPlayer"
                    :label="$t('general.heal')"
                />
              </td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t('components.player.labels.thirst') }}
              </td>
              <td class="text-left">
                {{ player.PlayerData.metadata.thirst.toFixed(2) }}
              </td>
              <td v-if="can(ACTION.GAME.PLAYER.META, RESOURCE.GAME)">
                <q-btn
                    text-color="main"
                    color="primary"
                    @click="setMeta('thirst', 100)"
                    :label="$t('general.fillUp')"
                />
              </td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t('components.player.labels.hunger') }}
              </td>
              <td class="text-left">
                {{ player.PlayerData.metadata.hunger.toFixed(2) }}
              </td>
              <td v-if="can(ACTION.GAME.PLAYER.META, RESOURCE.GAME)">
                <q-btn
                    text-color="main"
                    color="primary"
                    @click="setMeta('hunger', 100)"
                    :label="$t('general.fillUp')"
                />
              </td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t('components.player.labels.stress') }}
              </td>
              <td class="text-left">
                {{ player.PlayerData.metadata.stress }}
              </td>
              <td v-if="can(ACTION.GAME.PLAYER.META, RESOURCE.GAME)">
                <q-btn
                    text-color="main"
                    color="primary"
                    @click="setMeta('stress', 0)"
                    :label="$t('general.relax')"
                />
              </td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t('components.player.labels.armor') }}
              </td>
              <td class="text-left">
                {{ player.PlayerData.metadata.armor }}
              </td>
              <td v-if="can(ACTION.GAME.PLAYER.META, RESOURCE.GAME)">
                <q-btn
                    text-color="main"
                    color="primary"
                    @click="setMeta('armor', 100)"
                    :label="$t('general.fillUp')"
                />
              </td>
            </tr>
          </q-markup-table>
        </q-card-section>
      </q-card>
    </div>
    <div class="col-12 col-md-6 q-pa-sm">
      <q-card class="q-pa-sm bg-secondary col-12 col-md-6" style="height: 100%">
        <q-card-section class="col-12">
          <div class="text-h6">
            <span class="text-main">
              {{ $t('components.player.headers.money') }}</span
            >
          </div>
        </q-card-section>
        <q-separator></q-separator>
        <q-card-section class="col-12">
          <q-markup-table
              class="bg-secondary text-main"
              flat
              square
              separator="none"
          >
            <tr>
              <td class="text-left col-4">
                {{ $t('components.player.labels.money.cash') }}
              </td>
              <template v-if="can(ACTION.GAME.PLAYER.MONEY, RESOURCE.GAME)">
                <td style="min-width: 150px">
                  <q-input
                      dense
                      label-color="primary"
                      :input-style="{ color: 'var(--q-main)' }"
                      filled
                      v-model="player.PlayerData.money.cash"
                      :label="$t(`components.player.labels.money.cash`)"
                  />
                </td>
                <td>
                  <q-btn
                      text-color="main"
                      class="q-ml-md"
                      color="primary"
                      style="max-height: 24px"
                      @click="changeMoney('add', 'cash')"
                      :label="$t('components.player.buttons.money.give')"
                  />
                  <q-btn
                      text-color="main"
                      class="q-ml-md"
                      color="primary"
                      style="max-height: 24px"
                      @click="changeMoney('remove', 'cash')"
                      :label="$t('components.player.buttons.money.remove')"
                  />
                  <q-btn
                      text-color="main"
                      class="q-ml-md"
                      color="primary"
                      style="max-height: 24px"
                      @click="updateMoney('cash')"
                      :label="$t('components.player.buttons.money.set')"
                  />
                </td>
              </template>
              <td v-else>{{ player.PlayerData.money.cash }}</td>
            </tr>
            <tr>
              <td class="text-left col-4">
                {{ $t('components.player.labels.money.bank') }}
              </td>
              <template v-if="can(ACTION.GAME.PLAYER.MONEY, RESOURCE.GAME)">
                <td style="min-width: 250px">
                  <q-input
                      dense
                      label-color="primary"
                      :input-style="{ color: 'var(--q-main)' }"
                      filled
                      v-model="player.PlayerData.money.bank"
                      :label="$t(`components.player.labels.money.bank`)"
                  />
                </td>
                <td>
                  <q-btn
                      text-color="main"
                      class="q-ml-md"
                      color="primary"
                      style="max-height: 24px"
                      @click="changeMoney('add', 'bank')"
                      :label="$t('components.player.buttons.money.give')"
                  />
                  <q-btn
                      text-color="main"
                      class="q-ml-md"
                      color="primary"
                      style="max-height: 24px"
                      @click="changeMoney('remove', 'bank')"
                      :label="$t('components.player.buttons.money.remove')"
                  />
                  <q-btn
                      text-color="main"
                      class="q-ml-md"
                      color="primary"
                      style="max-height: 24px"
                      type="number"
                      @click="updateMoney('bank')"
                      :label="$t('components.player.buttons.money.set')"
                  />
                </td>
              </template>
              <td v-else>{{ player.PlayerData.money.bank }}</td>
            </tr>
            <tr>
              <td class="text-left col-4">
                {{ $t('components.player.labels.money.crypto') }}
              </td>
              <template v-if="can(ACTION.GAME.PLAYER.MONEY, RESOURCE.GAME)">
                <td style="min-width: 250px">
                  <q-input
                      dense
                      label-color="primary"
                      :input-style="{ color: 'var(--q-main)' }"
                      filled
                      v-model="player.PlayerData.money.crypto"
                      :label="$t(`components.player.labels.money.crypto`)"
                  />
                </td>
                <td>
                  <q-btn
                      text-color="main"
                      class="q-ml-md"
                      color="primary"
                      style="max-height: 24px"
                      @click="changeMoney('add', 'crypto')"
                      :label="$t('components.player.buttons.money.give')"
                  />
                  <q-btn
                      text-color="main"
                      class="q-ml-md"
                      color="primary"
                      style="max-height: 24px"
                      @click="changeMoney('remove', 'crypto')"
                      :label="$t('components.player.buttons.money.remove')"
                  />
                  <q-btn
                      text-color="main"
                      class="q-ml-md"
                      color="primary"
                      style="max-height: 24px"
                      type="number"
                      @click="updateMoney('crypto')"
                      :label="$t('components.player.buttons.money.set')"
                  />
                </td>
              </template>
              <td v-else>{{ player.PlayerData.money.crypto }}</td>
            </tr>
            <tr v-for="(moneyLabel, moneyKey) in moneyTypes" :key="moneyKey">
              <td class="text-left col-4">
                {{ moneyLabel }}
              </td>
              <template v-if="can(ACTION.GAME.PLAYER.MONEY, RESOURCE.GAME)">
                <td style="min-width: 250px">
                  <q-input
                      dense
                      label-color="primary"
                      :input-style="{ color: 'var(--q-main)' }"
                      filled
                      v-model="player.PlayerData.money[moneyKey]"
                      :label="moneyLabel"
                  />
                </td>
                <td>
                  <q-btn
                      text-color="main"
                      class="q-ml-md"
                      color="primary"
                      style="max-height: 24px"
                      @click="changeMoney('add', moneyKey)"
                      :label="$t('components.player.buttons.money.give')"
                  />
                  <q-btn
                      text-color="main"
                      class="q-ml-md"
                      color="primary"
                      style="max-height: 24px"
                      @click="changeMoney('remove', moneyKey)"
                      :label="$t('components.player.buttons.money.remove')"
                  />
                  <q-btn
                      text-color="main"
                      class="q-ml-md"
                      color="primary"
                      style="max-height: 24px"
                      type="number"
                      @click="updateMoney(moneyKey)"
                      :label="$t('components.player.buttons.money.set')"
                  />
                </td>
              </template>
              <td v-else>{{ player.PlayerData.money.cash }}</td>
            </tr>
          </q-markup-table>
          <div class="q-pa-md text-caption text-sub">
            {{ $t('components.player.moneyDisclaimer') }}
          </div>
        </q-card-section>
      </q-card>
    </div>
    <div class="col-12 col-md-6 q-pa-sm">
      <q-card class="q-pa-sm bg-secondary col-12 col-md-6" style="height: 100%">
        <q-card-section class="col-12">
          <div class="text-h6">
            <span class="text-main">
              {{ $t('components.player.headers.job') }}</span
            >
          </div>
        </q-card-section>
        <q-separator></q-separator>
        <q-card-section class="col-12">
          <q-markup-table
              class="bg-secondary text-main"
              flat
              square
              separator="none"
          >
            <tr>
              <td class="text-left">
                {{ $t('components.player.labels.job.name') }}
              </td>
              <td class="text-left">
                {{ player.PlayerData.job.label }}
              </td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t('components.player.labels.job.grade') }}
              </td>
              <td class="text-left">
                {{ player.PlayerData.job.grade.name }}
              </td>
            </tr>
          </q-markup-table>
          <q-btn
              text-color="main"
              v-if="can(ACTION.GAME.PLAYER.JOB, RESOURCE.GAME)"
              class="q-ma-md"
              @click="tryChangeJob"
              color="primary"
              :label="$t('general.change')"
          >
          </q-btn>
        </q-card-section>
      </q-card>
    </div>
    <div class="col-12 col-md-6 q-pa-sm">
      <q-card class="q-pa-sm bg-secondary col-12 col-md-6" style="height: 100%">
        <q-card-section class="col-12">
          <div class="text-h6">
            <span class="text-main">
              {{ $t('components.player.headers.gang') }}</span
            >
          </div>
        </q-card-section>
        <q-separator></q-separator>
        <q-card-section class="col-12">
          <q-markup-table
              class="bg-secondary text-main"
              flat
              square
              separator="none"
          >
            <tr>
              <td class="text-left">
                {{ $t('components.player.labels.gang.name') }}
              </td>
              <td class="text-left">
                {{ player.PlayerData.gang.label }}
              </td>
            </tr>
            <tr>
              <td class="text-left">
                {{ $t('components.player.labels.gang.grade') }}
              </td>
              <td class="text-left">
                {{ player.PlayerData.gang.grade.name }}
              </td>
            </tr>
          </q-markup-table>
          <q-btn
              text-color="main"
              v-if="can(ACTION.GAME.PLAYER.GANG, RESOURCE.GAME)"
              class="q-ma-md"
              @click="tryChangeGang"
              color="primary"
              :label="$t('general.change')"
          >
          </q-btn>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script>
import {ACTION, RESOURCE} from '../../../../../common/permissions'
import {can} from '@core/layouts/utils'
import PlayerBan from '@/components/PlayerBan'
import BasicDialog from '@/components/BasicDialog'
import BasicInput from '@/components/BasicInput'
import BasicPrompt from '@/components/BasicPrompt.vue'
import ChangePlayerJob from '@/components/ChangePlayerJob'
import ChangePlayerGang from '@/components/ChangePlayerGang'
import PlayerScreen from '@/components/PlayerScreen.vue'
import PlayerWarn from '@/components/PlayerWarn.vue'
import WaypointsModal from '@/components/WaypointsModal.vue'
import {exportFile} from 'quasar'

export default {
  name: 'PlayerGeneral',
  data() {
    return {
      ACTION,
      RESOURCE,
      columns: [
        {
          name: 'index',
          align: 'left',
          label: this.$i18n.t('general.timestamp'),
          field: row => row,
          format: val => `${val}`,
        },
        {
          name: 'ban',
          align: 'left',
          label: this.$i18n.t('general.warnBanHeader'),
          field: row => row,
          format: val => `${val}`,
        },
      ],
      pagination: {
        sortBy: 'desc',
        descending: false,
        page: 1,
        rowsPerPage: 5,
      },
      player: null,
      genders: [
        {
          label: this.$t('general.male'),
          value: 0,
        },
        {
          label: this.$t('general.female'),
          value: 1,
        },
      ],
      moneyTypes: {},
    }
  },
  methods: {
    can,
    getPaginationLabel(firstRowIndex, endRowIndex, totalRowsNumber) {
      return this.$i18n.t('components.playerList.paginationLabel', {
        from: firstRowIndex,
        to: endRowIndex,
        total: totalRowsNumber,
      })
    },
    isNumeric(str) {
      if (typeof str != 'string') return false
      return !isNaN(str) && !isNaN(parseFloat(str))
    },
    async loadPlayer() {
      await this.$axios
          .get(`/api/players/${this.$route.params.citizenid}`)
          .then(r => {
            const player = r.data.player

            if (!player) {
              this.$q.notify({
                message: 'Error',
                position: 'top',
                color: 'red',
                icon: 'fas fa-exclamation-triangle',
                caption: this.$i18n.t('components.player.msg.error.notOnline'),
              })
              this.$router.push({name: 'game-player-list'})
              return
            }

            this.player = player
            this.moneyTypes = r.data.moneyTypes || {}
            this.$emit(
                'updatePlayerName',
                `${player.PlayerData.charinfo.firstname} ${player.PlayerData.charinfo.lastname}`
            )
          })
          .catch(() => {
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
                        const {resCode, resMsg, resItems} = r.data

                        if (!resCode) {
                          this.$q.notify({
                            message: 'Error',
                            position: 'top',
                            color: 'red',
                            icon: 'fas fa-exclamation-triangle',
                          })
                          this.$router.push({name: 'game-player-list'})
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
                                    params: {citizenid: this.$route.params.citizenid},
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
    teleportPlayer() {
      this.$axios
          .post(`/api/players/teleport`, {
            citizenid: this.$route.params.citizenid,
            coords: this.player.PlayerData.position,
          })
          .then(r => {
            const resCode = r.data.resCode

            if (!resCode) {
              this.$q.notify({
                message: 'Error',
                position: 'top',
                color: 'red',
                icon: 'fas fa-exclamation-triangle',
                caption: this.$i18n.t('components.player.msg.error.notOnline'),
              })
              this.$router.push({name: 'game-player-list'})
              return
            }

            this.$q.notify({
              message: this.$i18n.t('general.success'),
              position: 'top',
              color: 'green',
              icon: 'fas fa-check',
              caption: this.$i18n.t(`general.teleported`),
            })
          })
    },
    tryChangeAccount() {
      this.$q
          .dialog({
            component: BasicDialog,
            componentProps: {
              title: this.$i18n.t('components.player.changeAccountHeader'),
              message: this.$i18n.t('components.player.changeAccountSub', {
                name: `${this.player.PlayerData.charinfo.firstname} ${this.player.PlayerData.charinfo.lastname}`,
              }),
            },
            cancel: true,
            persistent: true,
          })
          .onOk(() => {
            this.$axios
                .post('/api/players/change-account', {
                  citizenid: this.$route.params.citizenid,
                  license: this.player.PlayerData.license,
                })
                .then(r => {
                  const resCode = r.data.resCode

                  if (!resCode) {
                    this.$q.notify({
                      message: 'Error',
                      position: 'top',
                      color: 'red',
                      icon: 'fas fa-exclamation-triangle',
                      caption: this.$i18n.t(
                          `components.player.msg.error.${r.data.resMsg}`
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

                  this.loadPlayer()
                })
          })
    },
    tryChangeBucket() {
      this.$axios
          .post('/api/players/bucket', {
            citizenid: this.$route.params.citizenid,
            bucket: this.player.PlayerData.bucket,
          })
          .then(r => {
            const resCode = r.data.resCode
            const resMsg = r.data.resMsg

            if (!resCode) {
              this.$q.notify({
                message: 'Error',
                position: 'top',
                color: 'red',
                icon: 'fas fa-exclamation-triangle',
                caption: this.$i18n.t(`components.player.msg.error.${resMsg}`),
              })
              return
            }

            this.$q.notify({
              message: this.$i18n.t('general.success'),
              position: 'top',
              color: 'green',
              icon: 'fas fa-check',
              caption: this.$i18n.t(
                  'components.player.msg.success.changedBucket'
              ),
            })

            this.loadPlayer()
          })
    },
    tryPlayerWarn() {
      this.$q
          .dialog({
            component: PlayerWarn,
            componentProps: {
              title: this.$i18n.t('general.warnHeader'),
              message: this.$i18n.t('general.warnMsg', {
                name: `${this.player.PlayerData.charinfo.firstname} ${this.player.PlayerData.charinfo.lastname}`,
              }),
            },
            cancel: true,
            persistent: true,
          })
          .onOk(res => {
            this.$axios
                .post('/api/players/warn', {
                  citizenid: this.$route.params.citizenid,
                  reason: res.input,
                })
                .then(r => {
                  const resCode = r.data.resCode

                  if (!resCode) {
                    this.$q.notify({
                      message: 'Error',
                      position: 'top',
                      color: 'red',
                      icon: 'fas fa-exclamation-triangle',
                      caption: this.$i18n.t(
                          `components.player.msg.error.${r.data.resMsg}`
                      ),
                    })
                    return
                  }

                  this.$q.notify({
                    message: this.$i18n.t('general.success'),
                    position: 'top',
                    color: 'green',
                    icon: 'fas fa-check',
                    caption: this.$i18n.t('general.warnSuccess'),
                  })

                  this.loadPlayer()
                })
          })
    },
    tryPlayerBan() {
      this.$q
          .dialog({
            component: PlayerBan,
            componentProps: {
              title: this.$i18n.t('general.banHeader'),
              message: this.$i18n.t('general.banMsg', {
                name: `${this.player.PlayerData.charinfo.firstname} ${this.player.PlayerData.charinfo.lastname}`,
              }),
            },
            cancel: true,
            persistent: true,
          })
          .onOk(res => {
            this.$axios
                .post('/api/players/ban', {
                  citizenid: this.$route.params.citizenid,
                  reason: res.input,
                  time: res.time,
                  hwid: res.hwid,
                })
                .then(r => {
                  const resCode = r.data.resCode

                  if (!resCode) {
                    this.$q.notify({
                      message: 'Error',
                      position: 'top',
                      color: 'red',
                      icon: 'fas fa-exclamation-triangle',
                      caption: this.$i18n.t(
                          'components.player.msg.error.notOnline'
                      ),
                    })
                    return
                  }

                  this.$q.notify({
                    message: this.$i18n.t('general.success'),
                    position: 'top',
                    color: 'green',
                    icon: 'fas fa-check',
                    caption: this.$i18n.t('general.banSuccess'),
                  })

                  this.loadPlayer()
                })
          })
    },
    tryGetPlayerScreen() {
      this.$axios
          .get(`/api/players/${this.$route.params.citizenid}/screen`)
          .then(r => {
            const resCode = r.data.resCode

            if (!resCode) {
              this.$q.notify({
                message: 'Error',
                position: 'top',
                color: 'red',
                icon: 'fas fa-exclamation-triangle',
                caption: this.$i18n.t(
                    'components.player.msg.error.couldNotFetchScreen'
                ),
              })
              return
            }

            const image = r.data.img

            this.$q.dialog({
              component: PlayerScreen,
              componentProps: {
                img: image,
              },
              cancel: true,
              persistent: true,
            })
          })
    },
    tryPlayerUnban() {
      this.$q
          .dialog({
            component: BasicDialog,
            componentProps: {
              title: this.$i18n.t('general.unbanHeader'),
              message: this.$i18n.t('general.unbanMsg', {
                name: `${this.player.PlayerData.charinfo.firstname} ${this.player.PlayerData.charinfo.lastname}`,
              }),
            },
            cancel: true,
            persistent: true,
          })
          .onOk(() => {
            this.$axios
                .post('/api/players/unban', {
                  citizenid: this.$route.params.citizenid,
                })
                .then(r => {
                  const resCode = r.data.resCode

                  if (!resCode) {
                    this.$q.notify({
                      message: 'Error',
                      position: 'top',
                      color: 'red',
                      icon: 'fas fa-exclamation-triangle',
                      caption: this.$i18n.t(
                          'components.player.msg.error.notOnline'
                      ),
                    })
                    return
                  }

                  this.$q.notify({
                    message: this.$i18n.t('general.success'),
                    position: 'top',
                    color: 'green',
                    icon: 'fas fa-check',
                    caption: this.$i18n.t('general.unbanSuccess'),
                  })

                  this.loadPlayer()
                })
          })
    },
    tryPlayerKick() {
      this.$q
          .dialog({
            component: BasicInput,
            componentProps: {
              title: this.$i18n.t('general.kickHeader'),
              message: this.$i18n.t('general.kickMsg', {
                name: `${this.player.PlayerData.charinfo.firstname} ${this.player.PlayerData.charinfo.lastname}`,
              }),
            },
            cancel: true,
            persistent: true,
          })
          .onOk(res => {
            this.$axios
                .post('/api/players/kick', {
                  source: this.player.PlayerData.source,
                  reason: res.input,
                })
                .then(r => {
                  const resCode = r.data.resCode

                  if (!resCode) {
                    this.$q.notify({
                      message: 'Error',
                      position: 'top',
                      color: 'red',
                      icon: 'fas fa-exclamation-triangle',
                      caption: this.$i18n.t(
                          'components.player.msg.error.notOnline'
                      ),
                    })
                    return
                  }

                  this.$q.notify({
                    message: this.$i18n.t('general.success'),
                    position: 'top',
                    color: 'green',
                    icon: 'fas fa-check',
                    caption: this.$i18n.t('general.kickSuccess'),
                  })
                })
          })
    },
    tryChangeJob() {
      this.$q
          .dialog({
            component: ChangePlayerJob,
            componentProps: {
              title: this.$i18n.t('components.player.changeJobHeader'),
            },
            cancel: true,
            persistent: true,
          })
          .onOk(async res => {
            if (!res.job.name) {
              this.$q.notify({
                message: 'Error',
                position: 'top',
                color: 'red',
                icon: 'fas fa-exclamation-triangle',
                caption: this.$i18n.t(
                    'components.player.msg.error.missingFields'
                ),
              })
              return
            }

            await this.$axios
                .post('/api/players/change-job', {
                  citizenid: this.$route.params.citizenid,
                  name: res.job.name,
                  grade: res.job.grade,
                })
                .then(r => {
                  const resCode = r.data.resCode

                  if (!resCode) {
                    this.$q.notify({
                      message: 'Error',
                      position: 'top',
                      color: 'red',
                      icon: 'fas fa-exclamation-triangle',
                      caption: this.$i18n.t(
                          'components.player.msg.error.changeJob'
                      ),
                    })
                    return
                  }

                  this.$q.notify({
                    message: this.$i18n.t('general.success'),
                    position: 'top',
                    color: 'green',
                    icon: 'fas fa-check',
                    caption: this.$i18n.t(
                        'components.player.msg.success.changeJob'
                    ),
                  })

                  this.loadPlayer()
                })
          })
    },
    tryChangeGang() {
      this.$q
          .dialog({
            component: ChangePlayerGang,
            componentProps: {
              title: this.$i18n.t('components.player.changeGangHeader'),
            },
            cancel: true,
            persistent: true,
          })
          .onOk(async res => {
            if (!res.gang.name) {
              this.$q.notify({
                message: 'Error',
                position: 'top',
                color: 'red',
                icon: 'fas fa-exclamation-triangle',
                caption: this.$i18n.t(
                    'components.player.msg.error.missingFields'
                ),
              })
              return
            }

            await this.$axios
                .post('/api/players/change-gang', {
                  citizenid: this.$route.params.citizenid,
                  name: res.gang.name,
                  grade: res.gang.grade,
                })
                .then(r => {
                  const resCode = r.data.resCode

                  if (!resCode) {
                    this.$q.notify({
                      message: 'Error',
                      position: 'top',
                      color: 'red',
                      icon: 'fas fa-exclamation-triangle',
                      caption: this.$i18n.t(
                          'components.player.msg.error.changeGang'
                      ),
                    })
                    return
                  }

                  this.$q.notify({
                    message: this.$i18n.t('general.success'),
                    position: 'top',
                    color: 'green',
                    icon: 'fas fa-check',
                    caption: this.$i18n.t(
                        'components.player.msg.success.changeGang'
                    ),
                  })

                  this.loadPlayer()
                })
          })
    },
    openInventory() {
      this.$router.push({
        name: 'game-player-inventory',
      })
    },
    tryDeletePlayer() {
      this.$q
          .dialog({
            component: BasicDialog,
            componentProps: {
              title: this.$i18n.t('components.player.deleteHeader'),
              message: this.$i18n.t('components.player.deletePlayerMsg', {
                name: this.$route.params.citizenid,
              }),
            },
            cancel: true,
            persistent: true,
          })
          .onOk(() => {
            this.$axios
                .post('/api/players/delete', {
                  citizenid: this.$route.params.citizenid,
                })
                .then(r => {
                  const resCode = r.data.resCode

                  if (!resCode) {
                    this.$q.notify({
                      message: 'Error',
                      position: 'top',
                      color: 'red',
                      icon: 'fas fa-exclamation-triangle',
                      caption: this.$i18n.t(
                          `components.player.msg.error.deleteError`
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
                  this.$router.push({name: 'game-player-list'})
                })
          })
    },
    updateMoney(type) {
      this.$axios
          .post(`/api/players/set-money`, {
            citizenid: this.$route.params.citizenid,
            type: type,
            value: parseFloat(this.player.PlayerData.money[type]),
          })
          .then(r => {
            const resCode = r.data.resCode

            if (!resCode) {
              this.$q.notify({
                message: 'Error',
                position: 'top',
                color: 'red',
                icon: 'fas fa-exclamation-triangle',
                caption: this.$i18n.t(
                    `components.player.msg.error.${r.data.resMsg}`
                ),
              })
              if (r.data.resMsg === 'notFound')
                this.$router.push({name: 'game-player-list'})
              return
            }

            this.$q.notify({
              message: this.$i18n.t('general.success'),
              position: 'top',
              color: 'green',
              icon: 'fas fa-check',
              caption: this.$i18n.t(`general.saved`),
            })

            this.loadPlayer()
          })
    },
    changeMoney(option, type) {
      this.$q
          .dialog({
            component: BasicInput,
            componentProps: {
              title: this.$i18n.t(`components.player.${option}MoneyHeader`),
              message: this.$i18n.t(`components.player.${option}MoneyMsg`, {
                name: this.player.name,
              }),
            },
            cancel: true,
            persistent: true,
          })
          .onOk(res => {
            this.$axios
                .post(`/api/players/${option}-money`, {
                  citizenid: this.$route.params.citizenid,
                  type: type,
                  value: parseFloat(res.input),
                })
                .then(r => {
                  const resCode = r.data.resCode

                  if (!resCode) {
                    this.$q.notify({
                      message: 'Error',
                      position: 'top',
                      color: 'red',
                      icon: 'fas fa-exclamation-triangle',
                      caption: this.$i18n.t(
                          `components.player.msg.error.${r.data.resMsg}`
                      ),
                    })
                    if (r.data.resMsg === 'notFound')
                      this.$router.push({name: 'game-player-list'})
                    return
                  }

                  this.$q.notify({
                    message: this.$i18n.t('general.success'),
                    position: 'top',
                    color: 'green',
                    icon: 'fas fa-check',
                    caption: this.$i18n.t(`general.saved`),
                  })

                  this.loadPlayer()
                })
          })
    },
    setCharinfo() {
      this.$axios
          .post(`/api/players/set-charinfo`, {
            citizenid: this.$route.params.citizenid,
            charinfo: this.player.PlayerData.charinfo,
          })
          .then(r => {
            const resCode = r.data.resCode

            if (!resCode) {
              this.$q.notify({
                message: 'Error',
                position: 'top',
                color: 'red',
                icon: 'fas fa-exclamation-triangle',
                caption: this.$i18n.t('components.player.msg.error.notOnline'),
              })
              this.$router.push({name: 'game-player-list'})
              return
            }

            this.$q.notify({
              message: this.$i18n.t('general.success'),
              position: 'top',
              color: 'green',
              icon: 'fas fa-check',
              caption: this.$i18n.t(
                  `components.player.msg.success.${r.data.resMsg}`
              ),
            })

            this.loadPlayer()
          })
    },
    healPlayer() {
      this.$axios
          .post(`/api/players/heal`, {
            citizenid: this.$route.params.citizenid,
          })
          .then(r => {
            const resCode = r.data.resCode
            const resMsg = r.data.resMsg

            if (!resCode) {
              this.$q.notify({
                message: 'Error',
                position: 'top',
                color: 'red',
                icon: 'fas fa-exclamation-triangle',
                caption: this.$i18n.t(`components.player.msg.error.${resMsg}`),
              })
              if (resMsg === 'notFound')
                this.$router.push({name: 'game-player-list'})
              return
            }

            this.$q.notify({
              message: this.$i18n.t('general.success'),
              position: 'top',
              color: 'green',
              icon: 'fas fa-check',
              caption: this.$i18n.t(`components.player.msg.success.${resMsg}`),
            })

            this.loadPlayer()
          })
    },
    setMeta(meta, value) {
      this.$axios
          .post(`/api/players/set-meta`, {
            citizenid: this.$route.params.citizenid,
            meta: meta,
            value: value,
          })
          .then(r => {
            const resCode = r.data.resCode

            if (!resCode) {
              this.$q.notify({
                message: 'Error',
                position: 'top',
                color: 'red',
                icon: 'fas fa-exclamation-triangle',
                caption: this.$i18n.t('components.player.msg.error.notOnline'),
              })
              this.$router.push({name: 'game-player-list'})
              return
            }

            this.$q.notify({
              message: this.$i18n.t('general.success'),
              position: 'top',
              color: 'green',
              icon: 'fas fa-check',
              caption: this.$i18n.t(
                  `components.player.msg.success.${r.data.resMsg}`
              ),
            })

            this.loadPlayer()
          })
    },
    loadWaypoint() {
      this.$q
          .dialog({
            component: WaypointsModal,
            componentProps: {
              title: this.$i18n.t('components.waypoint.modalHeader'),
            },
            cancel: true,
            persistent: true,
          })
          .onOk(res => {
            if (res.coords) {
              this.player.PlayerData.position = res.coords
            }
          })
    },
  },
  mounted() {
    this.loadPlayer()
  },
}
</script>
