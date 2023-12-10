<script lang="ts">
  import {Doc} from 'sveltefire';
  import {UserCircle,LucideSwords,CircleSlash, ChevronRight,MoveRight} from 'lucide-svelte';
  
</script>
<div class="stats stats-vertical shadow">
  <Doc ref={`index/metrics`} let:data>
    
    <div class="stat">
      <div class="stat-figure text-accent flex ">
        <UserCircle class="mr-5" size="50" />
        <a href="/admin/users">
          <button class="btn btn-accent btn-md">View <MoveRight/></button>
        </a>
      </div>
      <div class="stat-title">Total Users</div>
      <div class="stat-value text-accent">
        {data.userCount}
      </div>
    </div>
    <div class="stat">
      <div class="stat-figure text-secondary flex">
        <LucideSwords size="50" class="mr-5" />
        <a href="/admin/levels">
          <button class="btn btn-secondary btn-md">View <MoveRight/></button>
        </a>
      </div>
      <div class="stat-title">Total Levels</div>
      <div class="stat-value text-secondary">
        {data.levels}
      </div>
    </div>
    <div class="stat">
      <div class="stat-figure text-primary flex">
        <CircleSlash  size="50" class="mr-5" />
        <a href="/admin/levels">
          <button class="btn btn-primary btn-md">View <MoveRight/></button>
        </a>
      </div>
      <div class="stat-title">Banned Users</div>
      <div class="stat-value text-primary">
        {data.banned}
      </div>
    </div>
  </Doc>

    
    
</div>