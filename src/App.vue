<template>
  <div id="app">
    <Menu/>
    <div class="main-content">
      <Header/>
      <div class="content-layout">
        <div class="widgets">
          <TaskWidget/>
          <NotesWidget/>
        </div>
        <Schedule/>
        <RightPanel/>
      </div>
    </div>
  </div>
</template>

<script>
import Menu from '/src/components/Menu.vue'
import Header from '/src/components/Header.vue'
import TaskWidget from '/src/components/TaskWidget.vue'
import NotesWidget from '/src/components/NotesWidget.vue'
import Schedule from '/src/components/Schedule.vue'
import RightPanel from '/src/components/RightPanel.vue'

export default {
  components: {
    Menu,
    Header,
    TaskWidget,
    NotesWidget,
    Schedule,
    RightPanel
  }
}
</script>

<style scoped>
#app {
  display: flex;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>