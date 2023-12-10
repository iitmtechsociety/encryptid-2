<script lang="ts">
  import { page } from "$app/stores";
    import "../app.css";
    import { SignedIn, SignedOut, FirebaseApp , Doc} from "sveltefire";
    import { auth, firestore, storage,  } from "$lib/firebase";
    import {signOut} from 'firebase/auth';
    import {goto} from "$app/navigation";
    import {FlatToast, ToastContainer} from 'svelte-toasts';
    async function signOutSSR(){
        const res = await fetch("/api/signin", {
          method: "DELETE",
        });
        await signOut(auth);
        goto('/');
      }
    import { Key, Trophy, CircleUser, ChevronRight, ShieldBan } from 'lucide-svelte';
	
</script>
<ToastContainer placement="top-left" let:data={data}>
  <FlatToast {data} /> <!-- Provider template for your toasts -->
</ToastContainer>
<FirebaseApp {auth} {storage} {firestore}>
<div class="navbar">
    <div class="flex-1">
        <span class="text-2xl font-bold" id="event-logo-hero">
          Encryptid 2.0
          </span>
    </div>
    <div class="navbar-end">
        <SignedIn let:user>
          <Doc ref={`users/${user.uid}`} let:data>
            <button
            
        class="btn btn-primary text-xs btn-ghost"
        on:click={() => {
          const modal = document.getElementById("profile_modal");
          //@ts-ignore
          modal.showModal();
        }}
        >
        <img class="mask mask-squircle" alt ="Profile Photograph" src={ user.photoURL || "https://png.pngtree.com/png-clipart/20220904/ourmid/pngtree-human-profile-avatar-ui-button-3d-icon-render-png-image_6137257.png"} height="30px" width="30px"/>
        
        {data.username}</button>
        <!-- You can open the modal using ID.showModal() method -->
        <dialog id="profile_modal" class="modal">
          <div class="modal-box">
            <form method="dialog">
              <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <center>
              <img class="mask mask-squircle" alt ="Profile Photograph" src={ user.photoURL || "https://png.pngtree.com/png-clipart/20220904/ourmid/pngtree-human-profile-avatar-ui-button-3d-icon-render-png-image_6137257.png"} height="100px" width="100px"/>
              <label class="form-control w-full max-w-xs">
                <div class="label">
                  <span class="label-text">Username</span>
                </div>
                <input type="text" value={data.username} class="input input-bordered w-full max-w-xs" disabled/>
                <div class="label">
                  <span class="label-text">Email</span>
                </div>
                <input type="text" value={user.email} class="input input-bordered w-full max-w-xs" disabled/>
              </label>
              <button
               class="btn btn-error btn-outline text-lg mt-6"
                    on:click={()=>signOutSSR()}>Log Out</button>
            </center>
          </div>
        </dialog>
        
        {#if data.isAdmin === true && !$page.route.id?.match(/admin/g)}
        <button class="btn btn-secondary btn-outline mr-4" on:click={()=>goto('/admin')}>
          <ShieldBan size="15px"/>
          Admin Panel
        </button>
        {/if}
      </Doc>
        
        </SignedIn>
        <SignedOut>
            {#if !$page.route.id?.match(/registration/g)}
            <button class="btn btn-secondary text-lg" on:click={()=>goto('/registration')}>Start Decrypting</button>
            {/if}
        </SignedOut>
    </div>
</div>
<SignedIn let:user>
    {#if $page.route.id?.match(/leaderboard|decrypt|profile/g)}
      <Doc ref={`users/${user.uid}`} let:data>
        <div class="flex w-screen justify-center">
          <ul class="menu bg-base-200 lg:menu-horizontal rounded-box">
              <li>
                <a href="/decrypt" class:active={$page.route.id?.match(/decrypt/g)}>
                  <Key size="15px"/>
                  Decrypt
                  <span class="badge badge-sm badge-warning">{data.points} PTS</span>
                </a>
              </li>
              <li>
                <a href="/leaderboard" class:active={$page.route.id?.match(/leaderboard/g)} data-sveltekit-preload-data="hover">
                  <Trophy size="15px"/>
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
</SignedIn>
<slot/>
</FirebaseApp>