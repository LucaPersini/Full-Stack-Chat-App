<script>
import { ref } from 'vue';
export default {
  name: 'Message',
  props: {
    user: String,
    text: String,
    date: String
  },
}
</script>

<template>
  <div class="flex flex-col">
    <div class="text-xs my-1">
      <p>{{ user }}</p>
    </div>
    <div class="text-sm">
      {{ text }}
    </div>
    <div class="flex justify-end text-xs my-1">
      {{ date }}
    </div>
  </div>
</template>