<template>
  <div class="tabs">
    <div class="tab-headers">
      <div 
        v-for="(tab, index) in tabs" 
        :key="index" 
        :class="['tab-header', { active: activeTab === index }]" 
        @click="selectTab(index)"
      >
        {{ tab.name }}
      </div>
    </div>
    <div class="tab-content">
      <slot :name="tabs[activeTab].slot"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import toobar from './toobar.vue';

const activeTab = ref(0)
console.log(activeTab.value)
const tabs = ref([
  { name: 'Tab 1', slot: 'tab1'},
  { name: 'Tab 2', slot: 'tab2' },
  { name: 'Tab 3', slot: 'tab3' }
])

function selectTab(index: number) {
  activeTab.value = index
}
</script>

<style scoped>
.tabs {
  display: flex;
  flex-direction: column;
}

.tab-headers {
  display: flex;
}

.tab-header {
  padding: 10px;
  cursor: pointer;
}

.tab-header.active {
  font-weight: bold;
  border-bottom: 2px solid #000;
}

.tab-content {
  padding: 10px;
  border: 1px solid #ddd;
}
</style>

