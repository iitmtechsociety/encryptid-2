import type { RequestHandler } from './$types';
import { adminAuth, adminDB } from '$lib/server/admin';
import { error, json } from '@sveltejs/kit';
let existingUserIds: string[] = [];

export const POST: RequestHandler = async ({ request, cookies }) => {
    const sessionCookie = cookies.get('__session');
    if(sessionCookie === undefined) return json({
        exists: false
    })
   
   
    console.log('user_exists');
    try{
        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);
        const uid = decodedClaims.uid;
         if(existingUserIds.includes(uid)){
        console.log('user exists in cache');
        return json({exists: true});
    
    };
        console.log('uid: ', uid);
        const userIndexDoc = await adminDB.collection('index').doc('users').get();
        if(userIndexDoc.data() !== undefined) {
            console.log('user index doc exists');
            const userIds = userIndexDoc.data()!['userIds'];
            console.log('userIds: ', userIds);
            existingUserIds = userIds;
            if(userIds.includes(uid)) {
                console.log('user exists');
                return json({exists: true})
            };
        } else {
            console.log('user index doc does not exist');
            return json({exists: false});
        }
    } catch (err) {
        console.log(err);
        return json({exists: false});
        
    }
    console.log('user does not exist');
    return json({exists: false});


};