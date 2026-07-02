<template>
  <footer class="border-t border-sand/60 bg-cream">
    <div
      class="max-w-7xl mx-auto px-6 lg:px-8 py-8 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-mute"
    >
      <p>© {{ year }} 作品拾光. All rights reserved.</p>
      <p class="font-serif text-stone">用设计创造价值，用思考驱动未来。</p>
    </div>
    <!-- 备案信息：ICP 备案号 + 公安备案号（图标在前，编号在右） -->
    <div
      class="border-t border-sand/40 px-6 py-4 flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 text-xs text-mute"
    >
      <a
        class="hover:text-stone transition-colors"
        href="https://beian.miit.gov.cn/"
        rel="noopener noreferrer"
        target="_blank"
      >辽ICP备2024044905号-3</a>
      <a
        class="inline-flex items-center gap-1 hover:text-stone transition-colors"
        href="https://beian.mps.gov.cn/#/query/webSearch?code=11010802049092"
        rel="noopener noreferrer"
        target="_blank"
      >
        <img
          src="/beian-police.png"
          alt=""
          width="14"
          height="15"
          loading="lazy"
        />
        <span>京公网安备11010802049092号</span>
      </a>
    </div>
  </footer>
</template>

<script setup lang="ts">
// 页脚版权年份
const year = new Date().getFullYear()
</script>
