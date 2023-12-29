<script lang="ts">
	import { page } from '$app/stores';
	export let data;
	let innerWidth: number;
	import '../app.css';
	import { signOut } from 'firebase/auth';
	if (data.registration_state === 'expired') {
		signOutSSR();
	}
	enum UserStatus {
		none,
		username,
		done
	}
	const statusToEnumMap = {
		not_started: UserStatus.none,
		username_not_set: UserStatus.username,
		completed: UserStatus.done
	};
	async function signOutSSR() {
		console.log('signing out');
		await signOut(auth);
		userStatus = UserStatus.none;
		const res = await fetch('/api/signin', {
			method: 'DELETE'
		});
		if ($page.route.id === '/') {
			goto('/registration');
		} else {
			goto('/');
		}
	}

	let userStatus: UserStatus = statusToEnumMap[data.registration_state] ?? UserStatus.none;

	import { User, FirebaseApp, userStore, Doc } from 'sveltefire';
	import { auth, firestore, storage } from '$lib/firebase';

	import { goto } from '$app/navigation';
	import { FlatToast, ToastContainer } from 'svelte-toasts';

	import { Key, Trophy, ShieldBan, ArrowRight, MoveRight, Flame, Users } from 'lucide-svelte';
	if (data.registration_state === 'expired') {
		signOutSSR();
	}
</script>

<ToastContainer placement="top-right" let:data>
	<FlatToast {data} />
	<!-- Provider template for your toasts -->
</ToastContainer>

<svelte:window bind:innerWidth />

<FirebaseApp {auth} {storage} {firestore}>
	<div class="navbar">
		<div class="flex-1">
			<a href="/">
				<span class="text-2xl font-bold" id="event-logo-hero"> EncryptID 2.0 </span>
			</a>
		</div>
		<div class="navbar-end">
			{#if data.registration_state !== 'not_started' && data.registration_state !== 'expired'}
				<User let:user>
					{#if userStatus === UserStatus.done}
						<Doc ref={`users/${user.uid}`} let:data>
							<button
								class="btn btn-primary text-xs btn-ghost"
								on:click={() => {
									const modal = document.getElementById('profile_modal');
									//@ts-ignore
									modal.showModal();
								}}
							>
								<img
									class="mask mask-squircle"
									alt="Profile Photograph"
									src={user.photoURL ||
										'https://png.pngtree.com/png-clipart/20220904/ourmid/pngtree-human-profile-avatar-ui-button-3d-icon-render-png-image_6137257.png'}
									height="40px"
									width="40px"
								/>

								<span class="text-lg">{data.username}</span></button
							>
							<!-- You can open the modal using ID.showModal() method -->
							<dialog id="profile_modal" class="modal">
								<div class="modal-box">
									<form method="dialog">
										<button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button
										>
									</form>
									<center>
										<img
											class="mask mask-squircle"
											alt="Profile Photograph"
											src={user.photoURL ||
												'https://png.pngtree.com/png-clipart/20220904/ourmid/pngtree-human-profile-avatar-ui-button-3d-icon-render-png-image_6137257.png'}
											height="100px"
											width="100px"
										/>
										<label class="form-control w-full max-w-xs">
											<div class="label">
												<span class="label-text">Username</span>
											</div>
											<input
												type="text"
												value={data.username}
												class="input input-bordered w-full max-w-xs"
												disabled
											/>
											<div class="label">
												<span class="label-text">Email</span>
											</div>
											<input
												type="text"
												value={user.email}
												class="input input-bordered w-full max-w-xs"
												disabled
											/>
										</label>
										<button
											class="btn btn-error btn-outline text-lg mt-6"
											on:click={() => signOutSSR()}>Log Out</button
										>
									</center>
								</div>
							</dialog>

							<!-- {#if data.isAdmin === true && !$page.route.id?.match(/admin/g)}
						<button class="btn btn-secondary btn-outline mr-4" on:click={() => goto('/admin')}>
							<ShieldBan size="15px" />
							Admin Panel
						</button>
					{/if} -->
						</Doc>
					{:else}
						<button class="btn btn-primary text-xs btn-ghost">
							<img
								class="mask mask-squircle"
								alt="Profile Photograph"
								src={user.photoURL ||
									'https://png.pngtree.com/png-clipart/20220904/ourmid/pngtree-human-profile-avatar-ui-button-3d-icon-render-png-image_6137257.png'}
								height="40px"
								width="40px"
							/>

							<span class="text-lg">{user.email}</span></button
						>
					{/if}
				</User>
			{/if}
			<button
				class="btn text-lg mr-4"
				class:btn-accent={$page.route.id?.match(/leaderboard/g)}
				class:btn-ghost={!$page.route.id?.match(/leaderboard/g)}
				on:click={() => goto('/leaderboard')}
			>
				{#if innerWidth >= 600}
					Leaderboard
				{/if}

				<Trophy /></button
			>

			{#if userStatus !== UserStatus.done}
				{#if !$page.route.id?.match(/registration/g)}
					<button class="btn btn-primary text-lg" on:click={() => goto('/registration')}>
						{#if innerWidth >= 600}
							{#if userStatus === UserStatus.none}
								Get Started/Login
							{:else if userStatus === UserStatus.username}
								Complete Registration
							{/if}
						{/if}
						<MoveRight />
					</button>
				{/if}
			{/if}
		</div>
	</div>
	<slot />
</FirebaseApp>
