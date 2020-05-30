<script>
  import Switch from "./Switch.svelte";
  import { createEventDispatcher } from "svelte";
  export let name; // string
  export let counts; // number
  export let canClear; // boolean
  export let disabled; // boolean
  export let frozen; // boolean

  const dispatch = createEventDispatcher();
  const clear = () => dispatch("clear");
  const toggleDisablement = disabled => dispatch("toggle", disabled);
</script>

<style>
  .row {
    display: flex;
    flex-direction: row;
    border-top: 1px solid #dddddd;
    padding: 3px 10px;
    color: #333333;
    align-items: center;
  }
  .row:hover {
    background-color: #eeeeee;
  }
  .clearButton {
    border: none;
    padding: 0;
    margin: 0;
    margin-right: 10px;
    background-color: transparent;
    color: #0075cc;
    cursor: pointer;
  }
  .contentLabel {
    flex-grow: 1;
  }
</style>

<div class="row">
  <div class="contentLabel">
    {name}
    {#if counts > 0}({counts}){/if}
  </div>
  {#if canClear}
    <button on:click={clear} class="clearButton">
      {window.browser.i18n.getMessage('ClearButton_Clear')}
    </button>
  {/if}

  <div class="switchDiv">
    <Switch {disabled} {frozen} on:click={toggleDisablement} />
  </div>
</div>
