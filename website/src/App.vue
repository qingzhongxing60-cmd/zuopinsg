<template>
  <RouterView />
</template>

<script setup lang="ts">
import { ref, provide, onMounted, onUnmounted } from 'vue'

// 提供窗口滚动位置，供 AppHeader 切换头部背景
const scrollY = ref(0)
provide('scrollY', scrollY)

function onScroll() {
  scrollY.value = window.scrollY
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>
