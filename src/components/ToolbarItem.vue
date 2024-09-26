
<script setup lang="ts">
    defineProps<{
        icon: any,
        text: string,
    }>();
</script>
    
<template>
    <div
        class="items-center flex h-full hover:cursor-pointer hover:bg-gray-200 ml-3 rounded-[4px]"
    >
        <div class="w-[24px] h-[24px] flex items-center justify-center">
            <component
                :is="icon"
                size="16"
                :strokeWidth="3"
                strokeLinecap="round"
            />
        </div>
        <span class="text-[#1f2329] text-[14px] mr-[4px]">
            {{ text }}
        </span>
    </div>
</template>

