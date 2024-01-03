<script lang="ts">
	import { goto } from '$app/navigation';
	import { sendErrorToast, sendSuccessToast } from '$lib/utils.js';
	//@ts-ignore
	let innerWidth;
	export let data;
	import { Confetti } from "svelte-confetti"
	let showConfetti = false;
	let levelsCompleted = false;
	

	import { Download, MoveRight } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import Countdown from 'svelte-countdown/src/index.js';
	import src from 'svelte-time';
	import { DownloadURL } from 'sveltefire';
	let showCountdown = true;
	const countDownTime = '2024-01-04 00:42:00';
	let questionData = null;
	let answer = '';
	onMount(async () => {
		const src_hints = document.getElementById('pain');
		const r = await fetch('/api/config');
		let config = {questions_enabled: false};
		if(r.ok) config = await r.json();
		showCountdown = !config.questions_enabled;
		if(showCountdown || data.registration_state !== "completed") return;
		const r2 = await fetch('/api/level');
		questionData = await r2.json();
		console.log(questionData);
		if(questionData.result !== 'completed') {
			if(questionData.codeComment !== undefined && questionData.codeComment !== null && questionData.codeComment.length > 0){
				src_hints.appendChild(document.createComment(questionData.codeComment));
			}
		} else {
			levelsCompleted = true;
			showConfetti = true;
		}
	});

	const setAnswer = (e) => {
		answer = e.target.value.trim();
		e.target.value = answer;
	};
	let busy = false;
	const submitAnswer = async () => {
		busy = true;
		if (answer.length === 0) {
			sendErrorToast('Error', 'Please enter an answer');
			return;
		}
		const r = await fetch('/api/level', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ answer })
		});
		const data = await r.json();
		busy = false;
		console.log(data);
		if (data.result === 'passed') {
			sendSuccessToast('Correct Answer', `Advancing to level ${data.nextLevel}`);
			setTimeout(() => {
				window.location.reload();
			}, 3000);
		} else if(data.result === 'completed') {
			showConfetti = true;
			sendSuccessToast('Congratulations', `You have completed the challenge!`);
			setTimeout(() => {
				window.location.reload();
			}, 3000);
		}else {
			sendErrorToast('Wrong Answer', 'Please try again');
		}
		
	};
</script>
{#if showConfetti}
<div style="
 position: fixed;
 top: -50px;
 left: 0;
 height: 100vh;
 width: 100vw;
 display: flex;
 justify-content: center;
 overflow: hidden;
 pointer-events: none;">
 <Confetti x={[-5, 5]} y={[0, 0.1]} delay={[500, 2000]} infinite duration=5000 amount=200 fallDistance="100vh" />
</div>
{/if}
<svelte:window bind:innerWidth />
{#if showCountdown}
	<Countdown from={countDownTime} dateFormat="YYYY-MM-DD H:m:s" zone="Asia/Kolkata" let:remaining>
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
						<span class="countdown text-9xl">
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
							<span class="countdown text-9xl">
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
{:else if data.registration_state === "banned"}
<center>
    <span class="font-bold text-3xl">You Have Been</span><br/>
    <span class="text-error text-9xl" style="font-family: 'Rubik Glitch' !important;">BANNED</span><br/>
</center>
{:else if questionData == null}
	<span class="loading loading-bars loading-lg"></span>
{:else if questionData['result'] === 'completed'}
	<center>
		<span class="text-6xl" style="font-family: 'Rubik Glitch' !important;"
			>DECRYPTION<br />PROGRESS</span
		>
		<br />
		<span class="text-success text-9xl" style="font-family: 'Rubik Glitch' !important;">100%</span>
		<br/>
		<button class="btn btn-success" on:click={()=>goto('/leaderboard')}>
			View Leaderboard <MoveRight/>
		</button>
	</center>
{:else}	
	<span class="text-5xl font-bold">{questionData.title}</span>
	<br /><br />
	<span class="text-2xl"><i>{questionData.prompt}</i></span>
	<br /><br />
	{#if questionData.files.length > 0}
		<span class="text-1xl font-bold ml-2">Files</span>
		<br />
		{#each questionData.files as file, index}
			<DownloadURL ref={file.path} let:link>
				<a href={link} target="_blank" class="mr-2" class:ml-2={index === 0}>
					<button class="btn btn-outline">
						<Download />
						{file.name}
					</button>
				</a>
			</DownloadURL>
		{/each}
		<br />
	{/if}
	{#if questionData.images.length > 0}
		<span class="text-1xl font-bold ml-2" class:mt-5={questionData.files.length > 0}>Images</span>
		<br />
		<div class="flex">
			{#each questionData.images as image}
				<DownloadURL ref={image.path} let:link>
					<img
						src={link}
						style="object-fit: cover;height: 200px;width: 200px;"
						class="m-2 rounded-box"
					/>
				</DownloadURL>
			{/each}
		</div>
		<br />
	{/if}
	<span class="text-1xl font-bold ml-2">Answer</span>
	<br />
	<input
		type="text"
		placeholder="???"
		class="input input-bordered input-secondary w-full max-w-xs ml-2"
		on:input={setAnswer}
	/>
	<br />
	<button
		class="btn btn-secondary ml-2 mt-2"
		on:click={submitAnswer}
		disabled={answer.length === 0 || busy}
	>
		Submit
	</button>
{/if}

<div id="pain"></div>