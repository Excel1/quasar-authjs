<template>
  <q-page class="row items-center justify-evenly">
    <p>You should see this page only when logged in.</p>
    <q-btn outline color="primary" label="Go to home" @click="router.push('/')" />
  </q-page>
</template>

<script setup lang="ts">

import {useRouter} from "vue-router";

const router = useRouter();
</script>
