<script lang="ts">
	import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { sendErrorToast } from '$lib/utils';
	export let data: PageData;
	import { auth } from '$lib/firebase';
	import { SignedOut, SignedIn, userStore } from 'sveltefire';
	import { goto } from '$app/navigation';
	let noRedirections: Boolean = false;
	async function signInWithGoogle() {
		const provider = new GoogleAuthProvider();
		let credential;
		try {
			credential = await signInWithPopup(auth, provider);
		} catch (fbE: FirebaseError) {
			if (fbE.code === 'auth/internal-error') {
				sendErrorToast(
					'Registration Failed!',
					'Something went wrong. Are you using a valid IITM Email?'
				);
			}
			return;
		}
		console.log(credential);
		const idToken = await credential.user.getIdToken();
		const res = await fetch('/api/signin', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ idToken })
		});
		if (res.status !== 200) {
			sendErrorToast('Registration Failed!', 'Something went wrong. Please try again.');
		} else {
			redirectIfNeeded();
		}
	}

	async function redirectIfNeeded() {
		console.log(data);
		if (data.uid === undefined) goto('/registration');
		else {
			const r = await fetch('/api/user_exists', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ userId: data.uid })
			});
			if (r.status === 401) {
				goto('/registration?reg=complete');
				return;
			}
			const jsonData = await r.json();
			console.log(jsonData);
			if (jsonData.exists === true) {
				console.log('redirecting');
				goto('/');
			} else {
				noRedirections = true;
			}
		}
	}

	let username: String = '';
	let busy: Boolean = false;
	let errorMessage: String = '';
	const setUsername = (event) => {
		username = event.target.value
			.toLowerCase()
			.trim()
			.replace(/[^a-zA-Z0-9]/g, '')
			.replace(/\s+/g, '')
			.slice(0, 20);
		event.target.value = username;
		if (username.length < 3) errorMessage = 'Minimum 3 characters.';
		if (username.length >= 3 && username.length <= 20) errorMessage = '';
	};
	import { AlertTriangle } from 'lucide-svelte';
	import type { FirebaseError } from 'firebase/app';
	const completeRegistration = async () => {
		busy = true;
		const r = await fetch('/api/create_user', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ username })
		});
		if (r.status === 200) {
			goto('/?reg=complete');
		} else {
			console.log(r);
			busy = false;
			alert('Something went wrong. Please try again.');
		}

		// setTimeout(() => {
		//   busy = false;
		//   // window.location.href = `/onboarding/${username}/2`;
		// }, 5000);
	};
	onMount(() => {
		const user = userStore(auth);
		if (user !== null) {
			redirectIfNeeded();
		}
	});
</script>

<SignedIn>
	{#if noRedirections}
		<div class="w-screen">
			<center
				><h1 class="text-5xl font-bold mb-5">Choose a Username</h1>
				<div class="max-w-fit mb-10">
					<div role="alert" class="alert">
						<AlertTriangle size="20px" class="text-primary" />
						<span>This cannot be changed later.</span>
					</div>
				</div>
				<input
					type="text"
					placeholder="Username"
					class:disabled={busy}
					class:input-error={errorMessage !== ''}
					class="input input-bordered input-success w-full max-w-lg"
					on:input={setUsername}
				/>
				<br />
				<span class="mt-2">{errorMessage}</span>
				<div class="mb-5" />
				<button class="btn btn-primary" on:click={completeRegistration} class:disabled={busy}>
					{#if busy}
						<span class="loading loading-bars loading-xs"></span>
					{:else}
						Complete Registration
					{/if}
				</button>
			</center>
		</div>
	{/if}
</SignedIn>

<SignedOut>
	<div class="hero min-h-screen bg-base-200">
		<div class="hero-content flex-col lg:flex-row">
			<img
				src="https://img.freepik.com/premium-photo/bank-vault-door-generative-ai_717906-2642.jpg"
				class="max-w-sm rounded-lg shadow-2xl"
			/>
			<div>
				<h1 class="text-5xl font-bold">Register for Encryptid</h1>
				<p class="py-6">You'll want to use your <b>IITM Email</b> ID to sign up.</p>
				<p class="py-6">If you already have an account. Use your <b>IITM Email</b> ID to log in.</p>
				<button
					class="btn btn-primary btn-lg btn-wide"
					class:disabled={busy}
					on:click={() => signInWithGoogle()}
				>
					{#if busy}
						<span class="loading loading-bars loading-xs"></span>
					{:else}
						Register / Log In
					{/if}
				</button>
			</div>
		</div>
	</div>
</SignedOut>
