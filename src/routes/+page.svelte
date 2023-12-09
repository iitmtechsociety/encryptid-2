<script lang="ts">
    import Countdown from 'svelte-countdown/src/index.js';
    import {SignedIn} from 'sveltefire';

</script>

<div class="hero h-screen">
    <div class="hero-content">
      <Countdown from="2024-01-01 09:30:00" dateFormat="YYYY-MM-DD H:m:s" zone="Asia/Kolkata" let:remaining>
        <div class="grid grid-flow-col gap-5 text-center auto-cols-max">

            <div class="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
              <span class="countdown font-mono text-9xl">
                <span style="--value:{remaining.days}"></span>
              </span>
              days
            </div> 
            <div class="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
              <span class="countdown font-mono text-9xl">
                <span style="--value:{remaining.hours};"></span>
              </span>
              hours
            </div> 
            <div class="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
              <span class="countdown font-mono text-9xl">
                <span style="--value:{remaining.minutes};"></span>
              </span>
              min
            </div> 
            <div class="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
              <span class="countdown font-mono text-9xl">
                <span style="--value:{remaining.seconds};"></span>
              </span>
              sec
            </div>
          </div>    
</Countdown>
    </div>
</div>
<SignedIn>
  <script>
    window.location.href = '/decrypt';
  </script>
</SignedIn>

