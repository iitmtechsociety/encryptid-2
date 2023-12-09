<script lang="ts">
      let username: String = "";
      let busy: Boolean = false;
      let errorMessage: String = "";
      
      const setUsername = (event) => {
        username = event.target.value.toLowerCase().trim().replace(/[^a-zA-Z0-9]/g, '').replace(/\s+/g, '');
        if(username.length <= 3) errorMessage =  "Minimum 3 characters.";
        
        if(username.length > 20) errorMessage = "Maximum 20 characters";
        }
      
      const completeRegistration = () => {
        busy = true;
        if (username.length < 3) {
          busy = false;
          return;
        }

        // setTimeout(() => {
        //   busy = false;
        //   // window.location.href = `/onboarding/${username}/2`;
        // }, 5000);
      }

      import {AlertTriangle} from 'lucide-svelte';
</script>
<div class="w-screen">
  <center><h1 class="text-5xl font-bold mb-5">Choose a Username</h1>
   <div class="max-w-fit mb-10">
    <div role="alert" class="alert">
      <AlertTriangle size="20px" class="text-primary"/>
      <span>This cannot be changed later.</span>
    </div>
   </div>
  <input type="text" placeholder="Username" class:disabled={busy} class:input-error = {errorMessage!==""} class="input input-bordered input-primary w-full max-w-lg" bind:value={username} on:input={setUsername}/>
  <span>{errorMessage}</span>
  <div class="mb-5"/>
  <button class="btn btn-primary" on:click={completeRegistration} class:disabled={busy}>
    {#if busy}
    <span class="loading loading-bars loading-xs"></span>
    {:else}
    Complete Registration
    {/if}
  </button>
</center>
</div>
