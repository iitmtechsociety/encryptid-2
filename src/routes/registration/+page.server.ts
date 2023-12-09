import type {PageServerLoad} from './$types';
import {adminAuth} from '$lib/server/admin';

export const load = (async ({cookies}) => {
    const sessionCookie = cookies.get('__session');
    if(sessionCookie === undefined) {
        return {
            uid: null,
            status: 401,
        };
    }
    try {
        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie!);
        const uid = decodedClaims.uid;
        return {
            uid: uid,
            status: 200,
        };
        
    } catch (err) {
        console.error(err);

    }
    return {
        uid: null,
        status: 500,
    };
    
}) satisfies PageServerLoad;