<script lang="ts">
  import { SignedOut,SignedIn,Doc,userStore } from 'sveltefire';
  import { auth } from '$lib/firebase';
  let lb: any[] = [];
  let last_update = undefined;
  onMount
  import {Trophy,Medal, Info} from 'lucide-svelte';
	import { onMount } from 'svelte';
  import Time from 'svelte-time';
  onMount(async () => {
    const res = await fetch(`/api/leaderboard/`);
    const {leaderboard,last_updated} = await res.json();
    lb = leaderboard;
    last_update = last_updated;
  });
  let user = userStore(auth);
</script>
<div class="max-w-screen">
  <center>
      
      <span class="font-bold text-5xl">Leaderboard</span><br>
      
    <SignedIn let:user={user2}>
      <Doc ref={`users/${user2.uid}`} let:data>
        {#if data.leaderboardPosition !== null}
        <span class="text-5xl"
            class:font-bold={data.leaderboardPosition <= 3}
            class:text-warning={data.leaderboardPosition === 1}
            class:text-accent={data.leaderboardPosition === 2}
            class:text-primary={data.leaderboardPosition === 3}
        >#{data.leaderboardPosition}</span>
        {/if}
      </Doc>
      </SignedIn>
<div class="lg:max-w-5xl mt-10">
  <span class="text-gray-900 flex ml-4"><div class="tooltip text-accent" data-tip="Leaderboard data is updated about every minute or so."><Info class="mr-2"/></div> <span class="text-accent">Last Updated:</span> {#if last_update === undefined}<span class="ml-2 text-accent loading loading-ring loading-md" />{:else} &nbsp; <Time timestamp={last_update} format={"MMMM DD, YYYY @ hh:mm A IST"} live={1 * 1_000} relative></Time>{/if}</span>
      <table class="table table-lg">
        <!-- head -->
        <thead>
          <tr>
            <th>Position</th>
            <th>Username</th>
            <th>Points</th>
            <th>Level</th>
          </tr>
        </thead>
        <tbody>
            {#each lb as userEntry, index}
      
            <tr class="text-md" class:active={userEntry['userId'] === $user?.uid}>
              <td class="flex max-w-fit">
                <span class="text-lg" class:font-bold={index <= 2} class:text-warning={index===0} class:text-accent={index===1} class:text-primary={index===2}>#{index+1}</span>
                <!-- {#if index === 0 || index === 2}
                <Medal />
                {:else if index === 1}
                <span class="text-lg text-silver">#{index+1}</span>
                {:else}
                <span class="text-lg">#{index+1}</span>
                {/if} -->
              <td>{userEntry.username} 
              {#if userEntry.admin_tag === true}
               <div class="badge badge-error badge-outline">ORGANIZER</div>
              {/if}
              </td>
              <td>{userEntry.points}</td>
              <td>{userEntry.level}</td>
            </tr>
            {/each}
          
        
        </tbody>
        
      </table>
    
</center>
  

    <!-- <Doc ref={'index/index'} let:data>
        data.leaderboard
        <div class="flex flex-col gap-4 w-52">
            <div class="flex gap-4 items-center">
              <div class="skeleton w-16 h-16 rounded-full shrink-0"></div>
              <div class="flex flex-col gap-4">
                <div class="skeleton h-4 w-20"></div>
                <div class="skeleton h-4 w-28"></div>
              </div>
            </div>
            <div class="skeleton h-32 w-full"></div>
          </div>
          <span slot="loading" class="loading loading-bars loading-lg"></span>
    </Doc> -->
  </div>