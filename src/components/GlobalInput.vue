<template>
    <Input v-model="value" ref="inputRef" allowClear @blur="handleBlur" @press-enter="handleEnter" size="mini" />
</template>

<script setup lang="ts">
import { Input } from '@arco-design/web-vue';
import { ref, watch, defineProps, defineEmits, onMounted } from 'vue';

const props = defineProps({
    modelValue: String,
    onClose: Function,
    onEnter: Function,
    height: Number,
    width: Number,
});

const emits = defineEmits(['update:modelValue']);
const value = ref(props.modelValue);
const inputRef = ref();
watch(value, (newValue) => {
    emits('update:modelValue', newValue);
});

onMounted(() => {
    inputRef.value.focus();
});

const handleBlur = () => {
    if (props.onClose) {
        props.onClose(value.value);
    }
};

const handleEnter = () => {
    if (props.onEnter) {
        props.onEnter(value.value);
    }
};

</script>
