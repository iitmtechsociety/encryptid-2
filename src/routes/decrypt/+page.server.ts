import type { PageServerLoad } from "./$types";
import { adminAuth,adminDB } from "$lib/server/admin";
import { redirect } from "@sveltejs/kit";

export const load = (async ({cookies}) => {
    const sessionCookie = cookies.get('__session');
    try {
        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);
        const userDoc = await adminDB.collection('users').doc(decodedClaims.uid).get();
        if(!userDoc.exists) {
            redirect(301,'/onboarding');
        }  else {
            return {
            
                userID: decodedClaims.uid
            
        };
        }
        
    } catch (err) {
        console.error(err);
        redirect(301,'/registration');
    }
}) satisfies PageServerLoad;