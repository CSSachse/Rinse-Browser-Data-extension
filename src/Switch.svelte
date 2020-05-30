<script>
  export let disabled;
  export let frozen;
</script>

<style>
  .switchArea {
    width: 40px;
    height: 16px;
    border-radius: 2px;
    box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.4) inset;
    background-color: #20b960;
    display: flex;
    flex-direction: row;
    cursor: pointer;
  }
  .switchArea.disabled {
    background-color: #ff8e24;
  }
  .switchArea:focus-within .switchToggle {
    border: 1px solid #0075cc;
  }
  .switchToggle {
    border: 1px solid #dddddd;
    border-radius: 3px;
    background-color: white;
    margin-top: -2px;
    height: 18px;
    width: 18px;
  }
  .switchToggle:hover {
    border: 1px solid #cccccc;
  }
  .switchToggle input {
    opacity: 0;
    cursor: inherit;
  }
  .switchArea .togglePusher {
    transition: flex-grow 0.1s, background-color 0.1s;
    flex-grow: 0;
  }
  .switchArea.disabled .togglePusher {
    flex-grow: 1;
  }
  .switchArea.frozen {
    background-color: #999999;
  }
</style>

<label class="switchArea" class:disabled class:frozen>
  <div class="togglePusher" />
  <div class="switchToggle">
    <input type="checkbox" on:click />
  </div>
</label>
