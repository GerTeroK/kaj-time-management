<template>
  <div class="menu">
    <img src="../../public/assets/Icon%20Button.svg" class="button_icon" alt="">

    <ul class="menu-list">
      <li>
        <router-link to="/" class="button_icon"><i class="fas fa-list"></i></router-link>
      </li>
      <li>
        <router-link to="/tasks" class="button_icon"><img src="../../public/assets/Check%20square.svg" alt=""></router-link>
      </li>
      <li>
        <router-link to="/timer" class="button_icon"><img src="../../public/assets/schedule.svg" alt=""></router-link>
      </li>
      <li>
        <router-link to="/reports" class="button_icon"><img src="../../public/assets/marketing_report_data_business_analytics_stats_graph_statistics_icon_218746%20(1).svg" alt=""></router-link>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "Menu"
};
</script>

<style scoped>
.menu {
  width: 6.563rem;
  height: 100%;
  background-color: #D9D9D9;

  display: -ms-grid;
  display: grid;

  -ms-grid-rows: 20% 30%;
  grid-template-rows: 20% 30%;

  -ms-grid-columns: 1fr;
  grid-template-columns: 1fr;

  gap: 1rem;
  position: fixed;
  box-sizing: border-box;
  padding: 1rem;
  top: 0;
  left: 0;
  z-index: 999;
}

.menu-list {
  list-style-type: none;
  padding: 0;
  width: 100%;
  grid-column: 1 / 2;
}

.menu-list li {
  width: 100%;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .menu {
    width: 4rem;
    padding: 0.5rem;

    display: -webkit-box;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;

    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    -webkit-flex-direction: column;
    flex-direction: column;

    grid-template-rows: auto auto auto auto;
    gap: 0.5rem;
    position: relative;
  }

  .menu-list li {
    margin-bottom: 0.5rem;
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .menu {
    position: fixed;
    top: 50px;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 50px;

    display: -webkit-box;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;

    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -ms-flex-direction: row;
    -webkit-flex-direction: row;
    flex-direction: row;

    -webkit-box-pack: center;
    -ms-flex-pack: center;
    -webkit-justify-content: center;
    justify-content: center;

    -webkit-box-align: center;
    -ms-flex-align: center;
    -webkit-align-items: center;
    align-items: center;

    padding: 0.5rem;
    background-color: #d9d9d9;
    z-index: 999;
  }

  .menu-list {
    display: -webkit-box;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;

    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -ms-flex-direction: row;
    -webkit-flex-direction: row;
    flex-direction: row;

    width: 100%;

    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    -webkit-justify-content: space-around;
    justify-content: space-around;

    -webkit-box-align: center;
    -ms-flex-align: center;
    -webkit-align-items: center;
    align-items: center;

    padding: 0;
    margin: 0;
  }

  .menu-list li {
    margin: 0;

    display: -webkit-box;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;

    -webkit-box-pack: center;
    -ms-flex-pack: center;
    -webkit-justify-content: center;
    justify-content: center;

    -webkit-box-align: center;
    -ms-flex-align: center;
    -webkit-align-items: center;
    align-items: center;
  }

  .menu img.button_icon {
    margin: 0;
  }
}


</style>