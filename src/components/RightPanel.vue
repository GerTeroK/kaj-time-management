<script setup>

</script>

<template>
  <div class="right-panel">
    <div class="card activity">
      <h3>Activity</h3>
      <div class="activity-bars">
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar-label">Mon <br> 0%</div>
        <div class="bar-label">Tue <br> 50%</div>
        <div class="bar-label">Wed <br> 100%</div>
        <div class="bar-label">Thu <br> 0%</div>
        <div class="bar-label">Fri <br> 0%</div>
      </div>
    </div>

    <div class="card progress">
      <h3>Today's Progress</h3>
      <div class="progress-content">
        <div class="progress-circle">
          <span>100%</span>
        </div>
        <button class="view-tasks">View All Tasks</button>
      </div>
    </div>

    <div class="card remainders">
      <h3>Remainders</h3>
      <div class="remainder">
        <div class="remainder-time">
          <span class="small-topic">Topic</span>
          <span>11:45 AM</span>
        </div>
        <span class="priority medium">Medium</span>
      </div>
      <div class="remainder">
        <div class="remainder-time">
          <span class="small-topic">Topic</span>
          <span>11:45 AM</span>
        </div>
        <span class="priority medium">Medium</span>
      </div>
      <div class="remainder">
        <div class="remainder-time">
          <span class="small-topic">Topic</span>
          <span>11:45 AM</span>
        </div>
        <span class="priority medium">Medium</span>
      </div>
      <div class="remainder">
        <div class="remainder-time">
          <span class="small-topic">Topic</span>
          <span>11:45 AM</span>
        </div>
        <span class="priority medium">Medium</span>
      </div>
      <button class="add-remainder">Add Remainders</button>
    </div>
  </div>
</template>

<style scoped>
.right-panel {
  width: 21.75rem;
  background: #f4f4f4;
  display: flex;
  position: fixed;
  flex-direction: column;
  right: 0;
  top: 5.188rem;
  box-sizing: border-box;
}

.activity-bars {
  display: grid;
  height: 6.75rem;
  margin-top: 1rem;
  justify-content: center;
  justify-items: center;
  align-items: flex-end;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: 6.75rem 2.5rem;
}

.activity  {
  height: 11.688rem;
}

.bar {
  width: 3.125rem;
  height: 6.75rem;
  background: #D9D9D9;
  font-size: 12px;
  border-radius: 12px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.bar-label {
  text-align: center;
  font-size: 12px;
  margin-top: 5px;
}

.bar.active {
  background: #4DFF67;
}

/* Progress Circle */
.progress-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 10px solid #4DFF67;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  margin: 5px;
}

.card.progress {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.progress-content {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 2.5rem;
  margin-top: 1rem;
}


.view-tasks {
  width: 8.125rem;
  background: black;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
}

.view-tasks:hover {
  background: #2C2C2C;
}

/* Remainders */
.remainder {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #CCCCCC;
  border-radius: 5px;
  margin: 10px 0;
}

.remainders {
  height: calc(100vh - 11.688rem - 20.5rem);
  overflow-y: auto;
  padding: 1rem;
}

.priority {
  padding: 2px 5px;
  border-radius: 5px;
}

.priority.medium {
  background: purple;
  color: white;
}

.add-remainder {
  width: 100%;
  padding: 10px;
  background: black;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.add-remainder:hover {
  background: #2C2C2C;
}

.remainder-time {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.right-panel h3 {
  margin: 0;
  text-align: center;
}
</style>