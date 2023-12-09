<script lang="ts">
  import {Doc} from 'sveltefire';
  import {UserCircle,LucideSwords,CircleSlash} from 'lucide-svelte';
  let userCount = 0;
  let loading = true;
  
</script>
<div class="stats stats-vertical shadow">
  <Doc ref={`index/metrics`} let:data>
    
    <div class="stat">
      <div class="stat-figure text-accent">
        <UserCircle size="50" />
      </div>
      <div class="stat-title">Total Registrations</div>
      <div class="stat-value text-accent">
        {data.userCount}
      </div>
    </div>
    <div class="stat">
      <div class="stat-figure text-secondary">
        <LucideSwords size="50" />
      </div>
      <div class="stat-title">Total Levels</div>
      <div class="stat-value text-secondary">
        {data.levels}
      </div>
    </div>
    <div class="stat">
      <div class="stat-figure text-primary">
        <CircleSlash  size="50" />
      </div>
      <div class="stat-title">Banned Users</div>
      <div class="stat-value text-primary">
        {data.banned}
      </div>
    </div>
    
    
  

  </Doc>
</div>