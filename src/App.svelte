<script>
  import Switch from "./Switch.svelte";
  import ContentRow from "./ContentRow.svelte";
  import { contentTypes, contentTypeNameMap } from "./contentTypes.js";
  import {
    contentTypeDisabledMap,
    contentTypeCountMap,
		getUrl,
		sendClearEvent,
		sendDisablementEvent,
  } from "./store.js";

  const handleClear = (url, contentType) => async () => {
		await sendClearEvent(url, contentType);
    contentTypeCountMap.refresh();
	};
	
	const handleToggle = (hostname, contentType ) => async () => {
		await sendDisablementEvent(hostname, contentType, $contentTypeDisabledMap, !!$contentTypeDisabledMap[contentType]);
		contentTypeDisabledMap.refresh();
	};

  const getUrlAndHostname = () => getUrl().then(url => [url, new URL(url).hostname]);
</script>

<style>
  .urlDisplay {
    padding: 10px;
    color: #777777;
    word-break: break-all;
  }
  .urlDisplay.frozen {
    text-align: center;
  }
</style>

{#await getUrlAndHostname()}
  ...
{:then [url, hostname]}
  <div class="urlDisplay">{hostname}</div>
  {#each contentTypes as contentType}
    <ContentRow
      name={contentTypeNameMap[contentType]}
      canClear={(contentType !== 'javascript' && $contentTypeCountMap[contentType] > 0) || contentType === 'cache'}
      counts={$contentTypeCountMap[contentType]}
      disabled={$contentTypeDisabledMap[contentType]}
      on:toggle={handleToggle(hostname, contentType)}
      on:clear={handleClear(url, contentType)} 
			frozen={false}/>
  {/each}
{:catch}
  <div class="urlDisplay frozen">—</div>
  {#each contentTypes as contentType}
    <ContentRow name={contentTypeNameMap[contentType]} frozen={true} />
  {/each}
{/await}
