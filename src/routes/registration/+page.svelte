<script lang="ts">
      import { GoogleAuthProvider, signInWithPopup} from "firebase/auth";
      import { auth } from "$lib/firebase";
	import { SignedOut,SignedIn } from "sveltefire";
	import { redirect } from "@sveltejs/kit";
      async function signInWithGoogle() {
        const provider = new GoogleAuthProvider();
        const credential = await signInWithPopup(auth, provider);
        const idToken = await credential.user.getIdToken();
        const res = await fetch("/api/signin",{
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({idToken}),
        });
        if(res.status === 200){
          redirect(301,"/onboarding");
        } else {
          alert("Something went wrong. Please try again.");
        }
        // redirect(301,"/onboarding");
      }



</script>
<div class="hero bg-base-200">
  <SignedIn>
    <script lang="ts">
      window.location.href = "/onboarding";  
    </script>
  </SignedIn>
  <SignedOut>
    <button class="btn btn-primary" on:click={()=>signInWithGoogle()}>Login</button>
  </SignedOut>
</div>