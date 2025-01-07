<script setup lang="ts">
import TheWelcome from '../components/TheWelcome.vue'
import { healthUsingGet } from '@/api/mainController'

healthUsingGet().then((res) => {
  console.log(res)
})
</script>

<template>
  <main>
     <TheWelcome />
  </main>
</template>
