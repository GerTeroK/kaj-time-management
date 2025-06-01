<template>
  <select v-model="selectedValue">
    <option v-for="opt in options" :key="opt.value" :value="opt.value">
      {{ opt.name }}
    </option>
  </select>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  options: {
    type: Array,
    default: () => []
  },
  selected: {
    type: String,
    default: 'In Progress'
  }
});

const emit = defineEmits(['update:selected']);

const selectedValue = ref(props.selected);

watch(() => props.selected, (newValue) => {
  selectedValue.value = newValue;
});

watch(selectedValue, (newValue) => {
  emit('update:selected', newValue);
});
</script>


<style scoped>
select {
  width: 90px;
  height: 38px;
  padding: 10px;
  border-radius: 12px;
  border: 1px solid #CCCCCC;
  background-color: #FFFFFF;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: none;
}

select:hover {
  background-color: #F0F0F0;
}
</style>