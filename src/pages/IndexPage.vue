<template>
  <q-page class="column items-center justify-center">
    <q-btn outline color="primary" label="Login" @click="$authService.login()" />
    <q-btn outline color="primary" label="Logout" @click="$authService.logout()" />
    <q-btn outline color="primary" label="Silent renew" @click="$authService.renew()" />
    <q-btn outline color="primary" label="Go to secure site" @click="$router.push('secure')" />
  </q-page>
</template>

<script setup lang="ts">
import {useAuthService} from "@badisi/auth-vue";

const authService = useAuthService();
// TODO: do something with authService
</script>
