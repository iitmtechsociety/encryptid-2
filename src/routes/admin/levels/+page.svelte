<script lang="ts">
	import { PlusIcon, EyeOff, Eye, Pencil, Delete, Trash, List } from 'lucide-svelte';
	import { toasts } from 'svelte-toasts';
	import { Collection } from 'sveltefire';
	import { storage } from '$lib/firebase';
	import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
	let showAnswers = false;

	async function deleteQuestion(id: string) {
		const r = await fetch(`/api/levels/${id}`, {
			method: 'DELETE'
		});
		if (r.status == 200) {
			toasts.add({
				title: 'Success',
				description: 'Question deleted successfully',
				type: 'success'
			});
		} else {
			toasts.add({
				title: 'Error',
				description: 'Question could not be deleted',
				type: 'error'
			});
		}
	}

	let levelModalDataId = '';
	let levelModalDataTitle = '';
	let levelModalDataQuestion = '';
	let levelModalDataAnswer = '';
	let levelModalDataFiles = [];
	let levelModalDataImages = [];
	let levelModalDataCodeComment = '';

	async function updateCurrentQuestion() {
		const r = await fetch(`/api/question/${levelModalDataId}`, {
			method: 'PUT',
			body: JSON.stringify({
				title: levelModalDataTitle
			})
		});
		if (r.status == 200) {
			toasts.add({
				title: 'Success',
				description: 'Question updated successfully',
				type: 'success'
			});
		} else {
			toasts.add({
				title: 'Error',
				description: 'Question could not be updated',
				type: 'error'
			});
		}
	}

	async function createCurrentQuestion() {
		let fileIndex = 0;
		const files = [];
		files.forEach(async () => {
			let fileData = {};
			const file = files[fileIndex];
			fileData['index'] = fileIndex;
			const path = `levels/${docUUID}/files/${fileIndex}.${file.name.split('.')[-1]}`;
			fileData['path'] = path;
			const storageRef = ref(storage, path);

			try {
				await uploadBytes(storageRef, file);
				const dl_url = await getDownloadURL(storageRef);
				fileData['url'] = dl_url;
				files.push(fileData);
				fileIndex++;
			} catch (e) {
				console.log(e);
				return;
			}
		});
		let imageIndex = 0;
		const images = [];
		images.forEach(async () => {
			let imageData = {};
			const image = images[imageIndex];
			imageData['index'] = imageIndex;
			const path = `levels/${docUUID}/images/${imageIndex}`;
			imageData['path'] = path;
			const storageRef = ref(storage, path);

			try {
				await uploadBytes(storageRef, image);
				const dl_url = await getDownloadURL(storageRef);
				imageData['url'] = dl_url;
				images.push(imageData);
				imageIndex++;
			} catch (e) {
				console.log(e);
				return;
			}
		});
		const r = await fetch(`/api/levels`, {
			method: 'POST',
			body: JSON.stringify({
				answer: levelModalDataAnswer,
				code_comment: levelModalDataCodeComment,
				files: files,
				images: images,
				title: levelModalDataTitle,
				question: levelModalDataQuestion
			})
		});
		if (r.status == 200) {
			toasts.add({
				title: 'Success',
				description: 'Question created successfully',
				type: 'success'
			});
		} else {
			toasts.add({
				title: 'Error',
				description: 'Question could not be created',
				type: 'error'
			});
		}
	}
</script>

<button
	class="btn btn-secondary"
	on:click={() => {
		levelModalDataAnswer = '';
		levelModalDataCodeComment = '';
		levelModalDataFiles = [];
		levelModalDataImages = [];
		levelModalDataQuestion = '';
		levelModalDataTitle = '';
		document.getElementById('new_level_modal').showModal();
	}}
>
	<PlusIcon />
	Add New Level
</button>
<dialog id="new_level_modal" class="modal">
	<div class="modal-box">
		<h3 class="font-bold text-lg">New Level</h3>
		<label class="form-control w-full max-w-xs">
			<div class="label">
				<span class="label-text">Title</span>
			</div>
			<input
				type="text"
				bind:value={levelModalDataTitle}
				placeholder="Title"
				class="input input-bordered w-full max-w-xs"
			/>
			<div class="label">
				<span class="label-text">Prompt</span>
			</div>
			<input
				type="text"
				bind:value={levelModalDataQuestion}
				placeholder="Prompt"
				class="input input-bordered w-full max-w-xs"
			/>
			<!-- TODO  -->

			<div class="label">
				<span class="label-text">Choose Files</span>
			</div>
			<input
				type="file"
				class="file-input file-input-bordered w-full max-w-xs"
				multiple
				bind:files={levelModalDataFiles}
			/>
			<div class="label">
				<span class="label-text">Choose Images</span>
			</div>
			<input
				type="file"
				class="file-input file-input-bordered w-full max-w-xs"
				multiple
				bind:files={levelModalDataImages}
				accept="image/*"
			/>
			<div class="label">
				<span class="label-text">Answer</span>
			</div>
			<input
				type="text"
				bind:value={levelModalDataAnswer}
				placeholder="Answer"
				class="input input-bordered w-full max-w-xs"
			/>
			<div class="label">
				<span class="label-text">Code Comment</span>
			</div>
			<textarea class="textarea textarea-bordered" placeholder="Code Comment"></textarea>
			<div class="modal-action">
				<form method="dialog">
					<!-- if there is a button in form, it will close the modal -->
					<button class="btn">Cancel</button>
					<button class="btn btn-primary" on:click={createCurrentQuestion}>Create</button>
				</form>
			</div>
		</label>
	</div>
</dialog>

<button
	class="btn"
	class:btn-error={showAnswers}
	class:btn-secondary={!showAnswers}
	on:click={() => (showAnswers = !showAnswers)}
>
	{#if showAnswers}
		<Eye />
		<span>Answers Shown</span>
	{:else}
		<EyeOff />
		<span>Answers Hidden</span>
	{/if}
</button>

<button
	class="btn btn-outline btn-accent"
	on:click={() => {
		document.getElementById('reorder_modal').showModal();
	}}
>
	<List />
	Reorder Levels
</button>

<dialog class="modal" id="reorder_modal">
	<div class="modal-box">
		<h3 class="font-bold text-lg">Reorder Elements</h3>
		<p class="py-4">Press ESC key or click the button below to close</p>

		<div class="modal-action">
			<form method="dialog">
				<button class="btn"> Cancel </button>
				<button class="btn btn-primary"> Save </button>
			</form>
		</div>
	</div>
</dialog>

<br />

<Collection ref={'/levels'} let:data={levels}>
	<span class="text-4xl text-secondary"
		>{levels.length} {levels.length == 1 ? 'Level' : 'Levels'}</span
	>
	{#each levels as level, index}
		<div class="card w-96 bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title">
					{level.title}
					<!-- <div class="badge badge-secondary">NEW</div> -->
				</h2>
				<span class="badge badge-accent badge-outline font-bold">Prompt</span>
				<pre>{level.question}</pre>

				{#if level.files.length > 0}
					<span class="badge badge-primary badge-outline font-bold"
						>{level.files.length} {level.files.length == 1 ? 'File' : 'Files'}</span
					>
					{#each level.files as file}
						<div class="badge badge-secondary">{file.name}</div>
					{/each}
				{/if}

				{#if level.images.length > 0}
					<span class="badge badge-info badge-outline font-bold">
						{level.images.length}
						{level.images.length == 1 ? 'Image' : 'Images'}
					</span>

					{#each level.images as image}
						<div class="badge badge-secondary">{image.name}</div>
					{/each}
				{/if}

				{#if level.code_comment !== null}
					<h4 class="font-bold">Code Comments</h4>
					<div class="mockup-code">
						<pre data-prefix="$"><code>{level.code_comment}</code></pre>
					</div>
				{/if}

				{#if showAnswers}
					<span class="badge badge-error badge-outline font-bold"> Answer </span>
					<pre>{level.answer}</pre>
				{/if}
			</div>

			<div class="flex-1 ml-6">
				<button
					class="btn btn-secondary"
					on:click={() => document.getElementById(`edit_modal_${level.levelId}`).showModal()}
				>
					<Pencil />
					Edit
				</button>
				<button
					class="btn btn-error"
					on:click={() => document.getElementById(`delete_modal_${level.levelId}`).showModal()}
				>
					<Trash />
					Delete
				</button>
			</div>

			<dialog id={`edit_modal_${level.levelId}`} class="modal">
				<div class="modal-box">
					<h3 class="font-bold text-lg">Hello!</h3>
					<p class="py-4">Press ESC key or click the button below to close</p>
					<div class="modal-action">
						<form method="dialog">
							<!-- if there is a button in form, it will close the modal -->
							<button class="btn">Cancel</button>
							<button class="btn btn-secondary">Save</button>
						</form>
					</div>
				</div>
			</dialog>

			<dialog id={`delete_modal_${level.levelId}`} class="modal">
				<div class="modal-box">
					<h3 class="font-bold text-lg">Confirm Delete</h3>
					<p class="py-4">
						Are you sure you want to delete this level? This action cannot be undone.
					</p>
					<div class="modal-action">
						<form method="dialog">
							<!-- if there is a button in form, it will close the modal -->

							<button class="btn">Cancel</button>
							<button class="btn btn-error" on:click={() => deleteQuestion(level.levelId)}
								>Delete</button
							>
						</form>
					</div>
				</div>
			</dialog>
		</div>
	{/each}
</Collection>
