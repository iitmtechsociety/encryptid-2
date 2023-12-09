import type { PageServerLoad } from "./$types";
import { adminAuth,adminDB } from "$lib/server/admin";
import { goto } from "$app/navigation";

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
                goto('/registration');
              }
        } else {
            goto('/registration');
        }
       
    } catch (err) {
        console.error(err);
        goto('/registration');
    }
}) satisfies PageServerLoad;