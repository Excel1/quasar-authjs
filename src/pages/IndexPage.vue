<template>
  <q-page class="row items-center justify-evenly">
    <q-btn outline color="primary" label="Login" @click="authService.login()" />

    <q-btn outline color="primary" label="Go to secure site" @click="router.push('secure')" />
  </q-page>
</template>

<script setup lang="ts">
import authService from "src/services/auth.service";
import {useRouter} from "vue-router";

const router = useRouter();

</script>
