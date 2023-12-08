<script lang="ts">
    import "../app.css";
    import { SignedIn, SignedOut, Doc, FirebaseApp } from "sveltefire";
    import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
    import { auth, firestore, storage } from "$lib/firebase";
    import { Key, Trophy, CircleUser } from 'lucide-svelte';
    async function signInWithGoogle() {
        const provider = new GoogleAuthProvider();
        
        const user = await signInWithPopup(auth, provider);
        user.user.providerData;
        //
    }
</script>

<FirebaseApp {auth} {storage} {firestore}>
<div class="navbar">
    <div class="flex-1">
        <span class="text-2xl font-bold">NCRYPTD <kbd class="kbd">/ en · krip · tid /</kbd></span>
    </div>
    <div class="navbar-end">
        <SignedIn let:user>
            <button
        class="btn btn-primary text-lg btn-ghost"
        >{user.uid}</button>
        <button
        class="btn btn-error btn-outline text-lg"
         on:click={()=>auth.signOut()}>Log Out</button>
        </SignedIn>
        <SignedOut>
            <button class="btn btn-secondary text-lg" on:click={()=>signInWithGoogle()}>Start Decrypting</button>
            
        </SignedOut>
    </div>
</div>
<SignedIn let:user>
    <div class="flex w-screen justify-center">
        <ul class="menu bg-base-200 lg:menu-horizontal rounded-box">
            <li>
              <a class="active">
                <Key size="15px"/>
                Decrypt
                <span class="badge badge-sm badge-warning">LVL 11</span>
              </a>
            </li>
            <li>
              <a>
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
</SignedIn>
<slot/>
</FirebaseApp>