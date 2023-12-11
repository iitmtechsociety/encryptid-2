<script lang="ts">
	import { PlusIcon } from 'lucide-svelte';
	import { Collection } from 'sveltefire';
</script>

<button class="btn btn-secondary">
	<PlusIcon />
	Add New Level
</button>
<br />

<span class="text-5xl text-secondary"> Levels List </span>
<Collection ref={'/levels'} let:data={levels}>
	{#each levels as level}
		<div class="card">
			<div class="card-body">
				<h5 class="card-title">{level.question}</h5>
				<p class="card-text">{level.answer}</p>
				<a href="/admin/levels/{level.levelId}" class="btn btn-primary">Edit</a>
			</div>
		</div>
	{/each}
</Collection>
