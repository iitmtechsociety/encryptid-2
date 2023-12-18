<script lang="ts">
	import { SignedIn, Doc } from "sveltefire";
  
    
    /** @type {import('./$types').PageData} */
    export let data;
    let questionData = {};
    import { onMount, } from "svelte";
    import {sendErrorToast , sendSuccessToast } from "$lib/utils";
    let currentAnswer = "";
    onMount(async () => {
        console.log(data.level);
        questionData = await (await fetch(`/api/levels/${data.level}`)).json();
        console.log(questionData);
    });

    const setCurrentAnswer = (event) => {
        
        currentAnswer = event.target.value
			.trim()
			.replace(/[^a-zA-Z0-9]/g, '')
			.replace(/\s+/g, '');
            event.target.value = currentAnswer;
        
    }

    const submitAnswer = async ()=>{
        const r = await fetch(`api/submit`,{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                answer: currentAnswer,
            })
        });
        if(r.status === 200){
            const {result} = await r.json();
            if(result === 'success'){
                sendSuccessToast("Correct Answer","Progressing to next level in 3 seconds");
                setTimeout(() => {
                    window.location.href = '/';
                }, 3000);
            } else {
                sendErrorToast("Wrong Answer","Try again");
            }
            
            
        }else{
            sendErrorToast("Something went wrong","Try again");
        }
    }
    
</script>

<SignedIn>
    <Doc ref={`levels/${data.level}`} let:data>
        <span class="loading loading-bars loading-lg" slot="loading"></span>
        <span class="font-bold text-5xl">
            <pre>{data['title']}</pre>
        </span>
        <span class="font text-3xl">
            <pre>{data['question']}</pre>
        </span>
        <!-- each -->
        {#each data['images'] as imgUrl}
            <img src={imgUrl} alt="im age" height="300px" width="300px"  />

        {/each}
        <input type="text" placeholder="Answer" class="input input-bordered input-primary w-full max-w-md" on:input={setCurrentAnswer}/>
        <button class="btn btn-primary btn-wide" on:click={submitAnswer}>Submit</button>
        </Doc>
   
</SignedIn>