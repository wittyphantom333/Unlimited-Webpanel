<template>
  <div class="q-mx-sm q-mb-sm row">
    <q-card class="row full-width bg-secondary" v-if="$route.meta.breadcrumb">
      <q-card-section class="col-12">
        <q-breadcrumbs gutter="sm" style="font-size: 20px">
          <q-breadcrumbs-el icon="home" to="/" />
          <q-breadcrumbs-el
            v-for="item in $route.meta.breadcrumb"
            :key="item.text"
            :active="item.active"
            :to="item.to"
            :label="$t(`breadcrumb.${item.text}`)"
          />
          <div v-if="$route.params?.stashId">
            {{ ` - ${this.$route.query.type} ${this.$route.params.stashId}` }}
          </div>
        </q-breadcrumbs>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
export default {
  name: 'AppBreadcrumb',
}
</script>

<style scoped></style>
