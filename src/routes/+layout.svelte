<script lang="ts">
  import { page } from "$app/stores";
    import "../app.css";
    import { SignedIn, SignedOut, FirebaseApp } from "sveltefire";
    import { auth, firestore, storage,  } from "$lib/firebase";
    import {signOut} from 'firebase/auth';
    import { redirect } from "@sveltejs/kit";
    async function signOutSSR(){
        const res = await fetch("/api/signin", {
          method: "DELETE",
        });
        await signOut(auth);
        redirect(301,"/");
      }
    import { Key, Trophy, CircleUser, ChevronRight, ShieldBan } from 'lucide-svelte';
	import { goto } from "$app/navigation";
	
</script>

<FirebaseApp {auth} {storage} {firestore}>
<div class="navbar">
    <div class="flex-1">
        <span class="text-2xl font-bold" id="event-logo-hero">
          Encryptid 2.0
          </span>
    </div>
    <div class="navbar-end">
        <SignedIn let:user>
            <button
        class="btn btn-primary text-xs btn-ghost"
        >{user.uid}</button>
        <button class="btn btn-secondary mr-4">
          <ShieldBan size="15px"/>
          Admin Panel
        </button>
        <button
        class="btn btn-error btn-outline text-lg"
         on:click={()=>signOutSSR()}>Log Out</button>
        </SignedIn>
        <SignedOut>
            <button class="btn btn-secondary text-lg" on:click={()=>goto('/registration')}>Start Decrypting</button>
            
        </SignedOut>
    </div>
</div>
<SignedIn>
    {#if $page.route.id?.match(/leaderboard|decrypt|profile/g)}
    <div class="flex w-screen justify-center">
      <ul class="menu bg-base-200 lg:menu-horizontal rounded-box">
          <li>
            <a href="/decrypt" class:active={$page.route.id?.match(/decrypt/g)}>
              <Key size="15px"/>
              Decrypt
              <span class="badge badge-sm badge-warning">LVL 11</span>
            </a>
          </li>
          <li>
            <a href="/leaderboard" class:active={$page.route.id?.match(/leaderboard/g)}>
              <Trophy size="15px"/>
              Leaderboard
              <span class="badge badge-sm badge-warning">120</span>
            </a>
          </li>
          <li>
            <a>
              <CircleUser size="15px"/>
              Profile
              
            </a>
          </li>
        </ul>
  </div>
    {/if}
</SignedIn>
<slot/>
</FirebaseApp>