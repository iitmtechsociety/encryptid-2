<script lang="ts">
	import { page } from '$app/stores';
	let innerWidth;
	import '../app.css';
	import { SignedIn, User, FirebaseApp, userStore, Doc } from 'sveltefire';
	import { auth, firestore, storage } from '$lib/firebase';
	import { signOut } from 'firebase/auth';

	import { goto } from '$app/navigation';
	import { FlatToast, ToastContainer } from 'svelte-toasts';
	async function signOutSSR() {
		console.log('signing out');
		await signOut(auth);
		userStatus = UserStatus.none;
		const res = await fetch('/api/signin', {
			method: 'DELETE'
		});
		goto('/');
	}
	import { Key, Trophy, ShieldBan, ArrowRight, MoveRight, Flame, Users } from 'lucide-svelte';
	enum UserStatus {
		none,
		username,
		done
	}
	let userStatus: UserStatus = UserStatus.none;
	import { onMount } from 'svelte';
	userStore(auth).subscribe(
		async (user) => {
			if(user === null) return;
			if(user!.uid === undefined){
				userStatus = UserStatus.none;
			}
			else {
				const r = await fetch('/api/user_exists',{
					method: 'POST',
							});
				if(r.ok){
					const {exists} = await r.json();
					if(exists === true){
						userStatus = UserStatus.done;
					} else {
						userStatus = UserStatus.username;
					}
				}
						}
		}
	);
</script>

<ToastContainer placement="top-right" let:data>
	<FlatToast {data} />
	<!-- Provider template for your toasts -->
</ToastContainer>
<svelte:window bind:innerWidth={innerWidth} />
<FirebaseApp {auth} {storage} {firestore}>
	
	<div class="navbar">
		<div class="flex-1">
			<a href="/">
				<span class="text-2xl font-bold" id="event-logo-hero"> EncryptID 2.0 </span>
			</a>
		</div>
		<div class="navbar-end">
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
									<button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
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

			<button
				class="btn text-lg mr-4"
				class:btn-accent={$page.route.id?.match(/leaderboard/g)}
				class:btn-ghost={!$page.route.id?.match(/leaderboard/g)}
				on:click={() => goto('/leaderboard')}>
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
							Get Started
						{:else if userStatus === UserStatus.username}
							Complete Registration
						{/if}
						{/if}
						<MoveRight /></button
					>
				{/if}
			{/if}
		</div>
	</div>
	<!-- <SignedIn let:user>x`x`
		{#if $page.route.id?.match(/decrypt|profile/g)}
			<Doc ref={`users/${user.uid}`} let:data>
				<div class="flex w-screen justify-center">
					<ul class="menu bg-base-200 lg:menu-horizontal rounded-box">
						<li>
							<a href="/decrypt" class:active={$page.route.id?.match(/decrypt/g)}>
								<Key size="15px" />
								Decrypt
								<span class="badge badge-sm badge-warning">{data.points} PTS</span>
							</a>
						</li>
						<li>
							<a
								href="/leaderboard"
								class:active={$page.route.id?.match(/leaderboard/g)}
								data-sveltekit-preload-data="hover"
							>
								<Trophy size="15px" />
								Leaderboard
								{#if data.leaderboardPosition !== null}
									<span class="badge badge-sm badge-warning"># {data.leaderboardPosition}</span>
								{/if}
							</a>
						</li>
					</ul>
				</div>
			</Doc>
		{/if}
	</SignedIn> -->
	<slot />
</FirebaseApp>
