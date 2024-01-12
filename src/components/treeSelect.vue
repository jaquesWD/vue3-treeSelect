<template>
  <el-select
    ref="select"
    v-model="selectValue"
    :multiple="multiple"
    collapse-tags
    :filter-method="dataFilter"
    @clear="handleReset"
    @remove-tag="removeTag"
    popper-class="t-tree-select"
    :style="{ width: width || '100%' }"
    v-bind="attrs"
  >
    <el-option :value="selectTree" class="option-style" disabled>
      <div class="check-box" v-if="multiple && checkBoxBtn">
        <el-button type="text" @click="handlecheckAll">全选</el-button>
        <el-button type="text" @click="handleReset">清空</el-button>
        <el-button type="text" @click="handleReverseCheck">反选</el-button>
      </div>
      <el-tree
        :data="options"
        :props="treeProps"
        class="tree-style"
        ref="treeNode"
        :show-checkbox="multiple"
        :node-key="treeProps.value"
        :filter-node-method="filterNode"
        :default-checked-keys="defaultValue"
        :current-node-key="currentKey"
        @node-click="handleTreeClick"
        @check-change="handleNodeChange"
        v-bind="treeAttrs"
      ></el-tree>
    </el-option>
  </el-select>
</template>

<script setup>
const emit = defineEmits(["handleNodeClick"]);

const props = defineProps({
  // 多选默认值数组
  defaultValue: {
    type: Array,
    default: () => [],
  },
  // 单选默认展示数据必须是{value:***,label:***}格式
  defaultData: {
    type: Object,
  },
  // 可用选项的数组
  options: {
    type: Array,
    default: () => [],
  },
  // 配置选项——>属性值为后端返回的对应的字段名
  treeProps: {
    type: Object,
    default: () => ({
      value: "id", // ID字段名
      label: "name", // 显示名称
      children: "children", // 子级字段名
    }),
  },
  // 是否显示全选、反选、清空操作
  checkBoxBtn: {
    type: Boolean,
    default: true,
  },
  // 是否多选
  multiple: {
    type: Boolean,
    default: false,
  },
  // 选择框宽度
  width: {
    type: String,
  },
});

const treeNode = ref(null);
const select = ref(null);

const selectTree = ref(props.multiple ? [] : "");
const selectValue = ref(props.multiple ? [] : "");
const highlightNode = ref(undefined);
const currentKey = ref(null);
const filterText = ref(null);
const VALUE_NAME = ref(props.treeProps.value);
const VALUE_TEXT = ref(props.treeProps.label);

const attrs = computed(() => {
  return {
    clearable: true,
    filterable: true,
    ...attrs,
  };
});

const treeAttrs = computed(() => {
  return {
    "default-expand-all": true,
    ...attrs,
  };
});

watch(
  () => props.defaultValue,
  () => {
    nextTick(() => {
      if (props.multiple) {
        let datalist = treeNode.value.getCheckedNodes();
        selectTree.value = datalist;
        selectValue.value = datalist.map((v) => v[VALUE_TEXT.value]);
      }
    });
  },
  { deep: true }
);

watch(
  () => props.filterText,
  (val) => {
    treeNode.value.filter(val);
  }
);

onMounted(() => {
  if (props.multiple) {
    let datalist = treeNode.value.getCheckedNodes();
    selectTree.value = datalist;
    selectValue.value = datalist.map((v) => v[VALUE_TEXT.value]);
  }
  if (props.defaultData?.id) {
    setDefaultValue(props.defaultData);
  }
});

// 单选设置默认值
const setDefaultValue = (obj) => {
  selectTree.value = obj.id;
  selectValue.value = obj.label;
  nextTick(() => {
    currentKey.value = selectTree.value;
    setTreeChecked(selectTree.value);
  });
};

// 全选
const handlecheckAll = () => {
  nextTick(() => {
    treeNode.value.setCheckedNodes(props.options);
  });
};

// 清空
const handleReset = () => {
  nextTick(() => {
    treeNode.value.setCheckedKeys([]);
  });
};

// 反选
const handleReverseCheck = () => {
  nextTick(() => {
    let res = treeNode.value;
    let nodes = res.getCheckedNodes(true, true);
    batchSelect(props.options, res, true, nodes);
  });
};

/**
 * @description: 反选处理方法
 * @param {*} nodes 整个tree的数据
 * @param {*} refs  this.$refs.treeNode
 * @param {*} flag  选中状态
 * @param {*} seleteds 当前选中的节点
 * @return {*}
 */
const batchSelect = (nodes, refs, flag, seleteds) => {
  if (Array.isArray(nodes)) {
    nodes.forEach((element) => {
      refs.setChecked(element, flag, true);
    });
  }
  if (Array.isArray(seleteds)) {
    seleteds.forEach((node) => {
      refs.setChecked(node, !flag, true);
    });
  }
};

// 输入框关键字
const dataFilter = (val) => {
  setTimeout(() => {
    filterText.value = val;
  }, 100);
};

/**
 * @description: tree搜索过滤
 * @param {*} value 搜索的关键字
 * @param {*} data  筛选到的节点
 * @return {*}
 */
const filterNode = (value, data) => {
  if (!value) return true;
  return data[props.treeProps.label].toLowerCase().indexOf(value.toLowerCase()) !== -1;
};

/**
 * @description: 勾选树形选项
 * @param {*} data 该节点所对应的对象
 * @param {*} self 节点本身是否被选中
 * @param {*} child 节点的子树中是否有被选中的节点
 * @return {*}
 */
// 多选赋值组件
const handleNodeChange = (data, self, child) => {
  nextTick(() => {
    const datalist = treeNode.value.getCheckedNodes();
    selectTree.value = datalist;
    selectValue.value = datalist.map((v) => {
      return v[VALUE_TEXT.value];
    });
    emit("handleNodeClick", selectTree.value);
  });
};

// 单选tree点击赋值
const handleTreeClick = (data, node) => {
  if (props.multiple) {
  } else {
    filterText.value = "";
    selectTree.value = data[VALUE_NAME.value];
    selectValue.value = data[VALUE_TEXT.value];
    currentKey.value = selectTree.value;
    highlightNode.value = data[VALUE_NAME.value];
    emit("handleNodeClick", { id: selectTree.value, label: selectValue.value }, node);
    setTreeChecked(highlightNode.value);
    select.value.blur();
  }
};

const setTreeChecked = (highlightNode) => {
  if (treeAttrs.value.hasOwnProperty("show-checkbox")) {
    // 通过 keys 设置目前勾选的节点，使用此方法必须设置 node-key 属性
    treeNode.value.setCheckedKeys([highlightNode]);
  } else {
    // 通过 key 设置某个节点的当前选中状态，使用此方法必须设置 node-key 属性
    treeNode.value.setCurrentKey(highlightNode);
  }
};

// 移除单个标签
const removeTag = (tagName) => {
  // 判断回显的值是否可删除
  selectTree.value = selectTree.value.filter((v) => v[VALUE_TEXT.value] !== tagName);
  console.log(selectTree.value);
  const selectTreeValue = selectTree.value.map((v) => v[VALUE_NAME.value]);
  let setlist = treeNode.value.getCheckedNodes();
  console.log(setlist);
  setlist = setlist.filter(
    (v) =>
      v[VALUE_NAME.value] === selectTreeValue.find((item) => item === v[VALUE_NAME.value])
  );
  const newList = setlist.map((obj) => {
    if (!obj.children) {
      return obj;
    }
  });
  nextTick(() => {
    treeNode.value.setCheckedNodes(newList);
  });
  emit("handleNodeClick", selectTree.value);
};

defineExpose({ handleReset });
</script>

<style lang="scss" scoped>
.t-tree-select {
  .check-box {
    padding: 0 20px;
  }

  .option-style {
    height: 100%;
    max-height: 300px;
    margin: 0;
    overflow-y: auto;
    cursor: default !important;
  }

  .tree-style {
    :deep(.el-tree-node.is-current > .el-tree-node__content) {
      color: #3370ff;
    }
  }

  .el-select-dropdown__item.selected {
    font-weight: 500;
  }

  .el-input__inner {
    height: 36px;
    line-height: 36px;
  }

  .el-input__icon {
    line-height: 36px;
  }

  .el-tree-node__content {
    height: 32px;
  }
}
</style>
