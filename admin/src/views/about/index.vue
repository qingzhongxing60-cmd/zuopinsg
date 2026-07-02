<template>
  <div class="about-manage">
    <!-- 个人介绍编辑 -->
    <ProfileForm />
    <!-- 技能管理 -->
    <SkillTable />
  </div>
</template>

<script setup lang="ts">
  // 关于我管理：组合个人介绍编辑与技能管理两个子模块
  import ProfileForm from './components/ProfileForm.vue'
  import SkillTable from './components/SkillTable.vue'

  defineOptions({ name: 'About' })
</script>

<style lang="scss" scoped>
  .about-manage {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow-y: auto;
  }
</style>
