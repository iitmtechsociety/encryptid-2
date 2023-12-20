<script lang="ts">
	//@ts-ignore
	let innerWidth;
	import Countdown from 'svelte-countdown/src/index.js';
	import { userStore } from 'sveltefire';
	import { auth } from '$lib/firebase';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	onMount(() => {
		const user = userStore(auth);
		if (user === undefined) {
			goto('/registration');
		} 
		
	});
</script>
<svelte:window bind:innerWidth={innerWidth} />
<Countdown
			from="2024-01-04 00:42:00"
			dateFormat="YYYY-MM-DD H:m:s"
			zone="Asia/Kolkata"
			let:remaining
		>
<div class="hero h-screen">
	<div class="hero-content">
		{#if innerWidth >= 840}
		<div class="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
			<span class="countdown text-9xl">
				<span style="--value:{remaining.days}"></span>
			</span>
			days
		</div>
		
		<div class="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
			<span class="countdown  text-9xl">
				<span style="--value:{remaining.hours};"></span>
			</span>
			hours
		</div>
		
		<div class="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
			<span class="countdown text-9xl">
				<span style="--value:{remaining.minutes};"></span>
			</span>
			min
		</div>
		
		<div class="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
			<span class="countdown text-9xl">
				<span style="--value:{remaining.seconds};"></span>
			</span>
			sec
		</div>
		{:else}
		<div>
			<div class="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
				<span class="countdown text-9xl">
					<span style="--value:{remaining.days}"></span>
				</span>
				days
			</div>
			<div class="flex flex-col p-2 bg-neutral rounded-box text-neutral-content mt-4">
				<span class="countdown text-9xl">
					<span style="--value:{remaining.minutes};"></span>
				</span>
				min
			</div>
			
		</div>
		<div>
			<div class="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
				<span class="countdown  text-9xl">
					<span style="--value:{remaining.hours};"></span>
				</span>
				hours
			</div>
			
			
			<div class="flex flex-col p-2 bg-neutral rounded-box text-neutral-content mt-4">
				<span class="countdown text-9xl">
					<span style="--value:{remaining.seconds};"></span>
				</span>
				sec
			</div>
		</div>
		{/if}
		
	</div>
</div>
</Countdown>