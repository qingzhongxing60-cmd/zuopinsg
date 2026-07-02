<template>
  <!-- 能力雷达图：纯 SVG 绘制，根据能力评分动态生成多边形 -->
  <svg :viewBox="`0 0 ${size} ${size}`" class="w-full h-auto" role="img" aria-label="能力雷达图">
    <!-- 背景网格环 -->
    <polygon
      v-for="ring in rings"
      :key="ring"
      :points="gridPoints(ring)"
      fill="none"
      stroke="var(--color-sand)"
      stroke-width="1"
    />
    <!-- 轴线 -->
    <line
      v-for="(pt, i) in axisPoints"
      :key="`axis-${i}`"
      :x1="center"
      :y1="center"
      :x2="pt.x"
      :y2="pt.y"
      stroke="var(--color-sand)"
      stroke-width="1"
    />
    <!-- 能力区域 -->
    <polygon :points="dataPoints" fill="rgba(187,77,43,0.18)" stroke="var(--color-rust)" stroke-width="1.5" />
    <!-- 顶点 -->
    <circle
      v-for="(pt, i) in valuePoints"
      :key="`dot-${i}`"
      :cx="pt.x"
      :cy="pt.y"
      r="2.5"
      fill="var(--color-rust)"
    />
    <!-- 轴标签 -->
    <text
      v-for="(pt, i) in labelPoints"
      :key="`label-${i}`"
      :x="pt.x"
      :y="pt.y"
      text-anchor="middle"
      dominant-baseline="middle"
      fill="var(--color-stone)"
      font-size="11"
    >
      {{ items[i].name }}
    </text>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface RadarItem {
  name: string
  score: number
}

const props = defineProps<{ items: RadarItem[] }>()

const size = 260
const center = size / 2
const radius = 88
const rings = [0.25, 0.5, 0.75, 1]

// 计算第 i 个顶点的角度（从正上方开始，顺时针均分）
function angle(i: number): number {
  const count = props.items.length || 1
  return -Math.PI / 2 + (i * 2 * Math.PI) / count
}

// 按比例 r（0~1）生成该顶点坐标
function point(i: number, ratio: number) {
  const a = angle(i)
  return {
    x: center + Math.cos(a) * radius * ratio,
    y: center + Math.sin(a) * radius * ratio,
  }
}

// 网格环顶点字符串
function gridPoints(ratio: number): string {
  return props.items.map((_, i) => `${point(i, ratio).x},${point(i, ratio).y}`).join(' ')
}

// 各轴末端坐标
const axisPoints = computed(() => props.items.map((_, i) => point(i, 1)))

// 能力值顶点坐标
const valuePoints = computed(() =>
  props.items.map((item, i) => point(i, Math.min(Math.max(item.score, 0), 100) / 100)),
)

// 能力多边形 points 字符串
const dataPoints = computed(() => valuePoints.value.map((p) => `${p.x},${p.y}`).join(' '))

// 标签坐标（略微外扩，避免压在轴端）
const labelPoints = computed(() => props.items.map((_, i) => point(i, 1.18)))
</script>
