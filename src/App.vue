<script setup>
import { ref } from 'vue'
import wdTree from './components/treeSelect.vue'

const list = ref([
  {
    name: '系统',
    id: 1,
    children: [
      { name: '用户', id: 2 },
      { name: '用户组', id: 3 },
      { name: '角色', id: 4 },
      { name: '菜单', id: 5 },
      { name: '组织架构', id: 6 }
    ]
  },
  {
    name: '购物',
    id: 11,
    children: [
      { name: '菜', id: 12 },
      { name: '苹果', id: 13 },
      { name: '西瓜', id: 14 },
      { name: '火龙果', id: 15 },
      { name: '雪梨', id: 16 }
    ]
  }
]
)

const changeNode = (value) => {
  console.log(value);
}
</script>

<template>
  <wdTree :options="list" :multiple="true" @handleNodeClick="changeNode"/>
  <!-- <WdDemo :options="list" :multiple="true"/> -->
</template>

<style scoped></style>
