<template>
    <div class="modal">
        <div class="modal-content">
            <slot name="header"></slot>
            <slot name="body"></slot>
            <slot name="footer"></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isOpen = ref(false)

const openModal = () => {
    isOpen.value = true
}

const closeModal = () => {
    isOpen.value = false
}

defineExpose({
    openModal,
    closeModal,
})
</script>