import type { PageServerLoad } from "./$types";
import { adminAuth,adminDB } from "$lib/server/admin";
import { redirect } from "@sveltejs/kit";

export const load = (async ({cookies}) => {
    const sessionCookie = cookies.get('__session');
    try {
        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);
        const userId = decodedClaims.uid;
        const userDoc = await adminDB.collection('users').doc(userId).get();
        if(userDoc.exists){
              const userData = userDoc.data();
              userData.isAdmin = userData.isAdmin || false;
              if(userData.isAdmin || false){
                return {
                    userID: decodedClaims.uid
                
                }
              } else {
                redirect(301,'/onboarding');
              }
        } else {
            redirect(301,'/onboarding');
        }
       
    } catch (err) {
        console.error(err);
        redirect(301,'/registration');
    }
}) satisfies PageServerLoad;