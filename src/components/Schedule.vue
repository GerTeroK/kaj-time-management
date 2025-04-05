<script setup>

</script>

<template>
  <div class="schedule">
    <div class="row">
      <h3>Schedule</h3>
      <div class="schedule-header">
        <button>Today</button>
        <button class="active">Week</button>
        <button>Month</button>
        <button>Year</button>
      </div>
    </div>
    <div class="table-wrapper">
      <div class="schedule-grid">
        <div class="corner"></div>

        <div class="day">Mon</div>
        <div class="day">Tue</div>
        <div class="day">Wed</div>
        <div class="day">Thu</div>
        <div class="day">Fri</div>
        <div class="day">Sat</div>
        <div class="day">Sun</div>

        <div class="time-slot">
          <div class="time">09:00</div>
          <div class="time">09:30</div>
          <div class="time">10:00</div>
          <div class="time">10:30</div>
          <div class="time">11:00</div>
          <div class="time">11:30</div>
          <div class="time">12:00</div>
          <div class="time">12:30</div>
          <div class="time">13:00</div>
          <div class="time">13:30</div>
          <div class="time">14:00</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.schedule {
  background: white;
  padding: 15px;
  border: 1px solid #CCCCCC;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  width: calc(100% - 6.563rem - 16.75rem);
  height: max-content;
}



.schedule-header {
  display: flex;
  border-radius: 12px;
  width: max-content;
  background: #CCCCCC;
}

.schedule-header button {
  background: #CCCCCC;
  border: none;
  border-radius: 12px;
}

.schedule-header button:hover {
  background: #D9D9D9;
}

.schedule-header .active {
  background: black;
  color: white;
}


.time-slot {
  border-radius: 5px;
  text-align: center;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: max-content;;
}

.row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 10px;
}

.row h3 {
  margin: 0;
  width: max-content;
}

.schedule-table {
  width: 100%;
  border-collapse: collapse;
}

.schedule-table th, .schedule-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: center;
}

.schedule-table th {
  background: #f4f4f4;
}

.table-wrapper {
  overflow-x: auto;
  width: 100%;
  white-space: nowrap;
}

.schedule-grid {
  display: grid;
  grid-template-columns: 80px repeat(7, 1fr);
  grid-template-rows: 40px repeat(10, 40px);
  gap: 2px;
  position: relative;
  overflow-y: auto;
  overflow-x: auto;
  white-space: nowrap;
  border: 2px solid rgba(0.2, 0.2, 0.2, 0.2);
  min-width: 800px;
}



.day {
  position: sticky;
  font-weight: bold;
  text-align: center;
  background: #f4f4f4;
  padding: 10px;
}

.time {
  position: sticky;
  font-size: 14px;
  text-align: center;
  padding: 10px;
  align-self: center;
  height: 3rem;
  margin-top: 2px;
  background: #f4f4f4;
}

.corner {
  background: #f4f4f4;
}

.event {
  background: #a0e3a0;
  border-radius: 5px;
  padding: 10px;
  position: absolute;
  width: 18%;
}

</style>