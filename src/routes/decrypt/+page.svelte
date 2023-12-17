<script lang="ts">
	import { SignedIn } from "sveltefire";
    export const prerender = false;
    export const csr = false;
    /** @type {import('./$types').PageData} */
    export let data;
    let questionData = {};
    import { onMount } from "svelte";
    let currentAnswer = "";
    onMount(async () => {
        console.log(data.level);
        questionData = await (await fetch(`/api/levels/${data.level}`)).json();
        console.log(questionData);
    });
</script>

<SignedIn>
    <span class="font-bold text-5xl">
        <pre>{questionData['title']}</pre>
    </span>
    <span class="font text-3xl">
        <pre>{questionData['question']}</pre>
    </span>
    <!-- each -->
    {#each questionData['images'] as imgUrl}
        <img src={imgUrl} alt="image" height="300px" width="300px"  />

    {/each}
    <input type="text" bind:value={currentAnswer} />
</SignedIn>