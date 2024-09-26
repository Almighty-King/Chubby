<template>
  <div class="slider">
    <div class="slider-wrapper" :style="wrapperStyle">
      <div 
        v-for="(slide, index) in slides" 
        :key="index" 
        class="slide"
        :style="{ backgroundImage: `url(${slide})` }"
      ></div>
    </div>
    <div class="slider-controls">
      <button @click="prevSlide">Previous</button>
      <button @click="nextSlide">Next</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const slides = ref([
  'https://via.placeholder.com/800x300?text=Slide+1',
  'https://via.placeholder.com/800x300?text=Slide+2',
  'https://via.placeholder.com/800x300?text=Slide+3'
])

const currentIndex = ref(0)

const wrapperStyle = computed(() => ({
  transform: `translateX(-${currentIndex.value * 100}%)`
}))

function nextSlide() {
  currentIndex.value = (currentIndex.value + 1) % slides.value.length
}

function prevSlide() {
  currentIndex.value = (currentIndex.value - 1 + slides.value.length) % slides.value.length
}
</script>

<style scoped>
.slider {
  position: relative;
  width: 800px;
  overflow: hidden;
}

.slider-wrapper {
  display: flex;
  transition: transform 0.5s ease;
}

.slide {
  min-width: 100%;
  height: 300px;
  background-size: cover;
  background-position: center;
}

.slider-controls {
  position: absolute;
  top: 50%;
  width: 100%;
  display: flex;
  justify-content: space-between;
  transform: translateY(-50%);
}
</style>
