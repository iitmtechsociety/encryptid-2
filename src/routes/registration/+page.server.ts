import type {PageServerLoad} from './$types';
import {adminAuth,adminDB} from '$lib/server/admin';

export const load = (async ({cookies}) => {
    const sessionCookie = cookies.get('__session');
    if(sessionCookie === undefined) {
        return {
            userId: null,
            registration_state: "not_started",
        };
    }
    try {
        console.log("Verifying Session Cookie");
        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie!).catch((error) => { console.log(error) });
        const userId = decodedClaims.uid;
        if (userId === undefined) return {
            userId: null,
            registration_state: "expired",
        }
        const userDoc = await adminDB.collection('users').doc(userId).get();
        if (userDoc.exists) {
            return {
                userId: userId,
                registration_state: "completed",
            };
        } else {
            return {
                userId: userId,
                registration_state: "username_not_set",
            }
        }
        
        
    } catch (err) {
       return {
        userId: null,
        registration_state: "not_started",
    };        
    }
    
    
}) satisfies PageServerLoad;