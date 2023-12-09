<script lang="ts">
  import { SignedOut } from 'sveltefire';
import type {PageData} from './$types';
    export let data: PageData;
    import {Trophy,Medal} from 'lucide-svelte';
    
  let counter = 0;
</script>
<div class="max-w-screen">
  <center>
    <SignedOut>
      <span class="font-bold text-5xl">Leaderboard</span>
    </SignedOut>
<div class="lg:max-w-5xl mt-10">
  
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
            {#each data.leaderboard as userEntry, index}
      
            <tr class="text-md">
              <td class="flex max-w-fit">
                {#if index === 0 || index === 1 || index === 2}
                <Medal />
                {:else}
                <span class="text-lg">{index+1}</span>
                {/if}
              <td>{userEntry.username}</td>
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