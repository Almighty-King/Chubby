<template>
  <div class="toolbar bg-gray-100 p-2 flex flex-wrap items-center">
    <div class="flex items-center space-x-2">
      <button class="btn" @click="undo">撤销</button>
      <button class="btn" @click="redo">重做</button>
    </div>
    <div class="flex items-center space-x-2 ml-4">
      <button class="btn" @click="cut">剪切</button>
      <button class="btn" @click="copy">复制</button>
      <button class="btn" @click="paste">粘贴</button>
    </div>
    <div class="flex items-center space-x-2 ml-4">
      <button class="btn" @click="bold">加粗</button>
      <button class="btn" @click="italic">斜体</button>
      <button class="btn" @click="underline">下划线</button>
    </div>
    <div class="flex items-center space-x-2 ml-4">
      <button class="btn" @click="alignLeft">左对齐</button>
      <button class="btn" @click="alignCenter">居中对齐</button>
      <button class="btn" @click="alignRight">右对齐</button>
    </div>
    <div class="flex items-center space-x-2 ml-4">
      <button class="btn" @click="insertRow">插入行</button>
      <button class="btn" @click="insertColumn">插入列</button>
      <button class="btn" @click="deleteRow">删除行</button>
      <button class="btn" @click="deleteColumn">删除列</button>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    undo() {
      // 撤销操作逻辑
    },
    redo() {
      // 重做操作逻辑
    },
    cut() {
      // 剪切操作逻辑
    },
    copy() {
      // 复制操作逻辑
    },
    paste() {
      // 粘贴操作逻辑
    },
    bold() {
      // 加粗操作逻辑
    },
    italic() {
      // 斜体操作逻辑
    },
    underline() {
      // 下划线操作逻辑
    },
    alignLeft() {
      // 左对齐操作逻辑
    },
    alignCenter() {
      // 居中对齐操作逻辑
    },
    alignRight() {
      // 右对齐操作逻辑
    },
    insertRow() {
      // 插入行操作逻辑
    },
    insertColumn() {
      // 插入列操作逻辑
    },
    deleteRow() {
      // 删除行操作逻辑
    },
    deleteColumn() {
      // 删除列操作逻辑
    }
  }
}
</script>

<style scoped>
.btn {
  @apply bg-white text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow;
  @apply hover:bg-gray-100;
}
</style>


