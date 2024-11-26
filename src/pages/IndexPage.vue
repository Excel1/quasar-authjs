<template>
  <q-page class="column items-center justify-center">
    <q-btn outline color="primary" label="Login" @click="$authService.login()" />
    <q-btn outline color="primary" label="Logout" @click="$authService.logout()" />
    <q-btn outline color="primary" label="Silent renew" @click="$authService.renew()" />
    <q-btn outline color="primary" label="Go to secure site" @click="$router.push('secure')" />
    <div>----</div>
    <q-btn outline color="primary" label="fetch" @click="tryFetch()" />
    <q-btn outline color="primary" label="xhr" @click="tryXhr()" />
    <q-btn outline color="primary" label="axios" @click="tryAxios()" />
  </q-page>
</template>

<script setup lang="ts">
import {useAuthService} from "@badisi/auth-vue";
import axios from 'axios';

const authService = useAuthService();
// TODO: do something with authService

const API_URL = 'https://dev-fijd1e9x.us.auth0.com/api/v2/users/auth0|631b171682c639d40cb84d5c';
const tryFetch = async () => {
    await fetch(API_URL, { method: 'GET' }).catch(console.error);
};
const tryXhr = () => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', API_URL, true);
    xhr.send();
};
const tryAxios = async () => {
    await axios.get(API_URL).catch(console.error);
};
</script>
