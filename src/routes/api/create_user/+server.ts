import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import { adminAuth, adminDB } from '$lib/server/admin';
import { FieldValue } from 'firebase-admin/firestore'; 

let taken_usernames: string[] = [];
export const POST: RequestHandler = async ({ request, cookies }) => {
    console.log('create_user');
    const sessionCookie = cookies.get('__session');
    console.log('session cookie: ', sessionCookie !== undefined ? 'yes' : 'no');
    const {username} = await request.json();
    console.log('username: ', username);
    if(username.length <= 3 && username.length >= 20) throw error(400,'Username must be between 3 and 20 characters long');
    if(sessionCookie === undefined) throw error(401,'Unauthorized');
    try{
        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);
        const uid = decodedClaims.uid;
        console.log('uid: ', uid);
        await adminDB.runTransaction(async (t) => {
            const userDocRef = adminDB.collection('users').doc(uid);
            const userDoc = await t.get(userDocRef);
            if(userDoc.exists) throw error(409,'USER_ALREADY_EXISTS');
            if(taken_usernames.includes(username)) throw error(409,'USERNAME_ALREADY_TAKEN');
            const usernameIndexRef = adminDB.collection('index').doc('users');
            const usernameIndex = await t.get(usernameIndexRef);
            if (usernameIndex.data() !== undefined) {
                const usernames= usernameIndex.data()!['usernames'];
                taken_usernames = usernames;
                if(usernames.includes(username)) throw error(409,'USERNAME_ALREADY_TAKEN');
            }
            
            t.set(userDocRef, {
                userId: uid,
                username: username,
                email: decodedClaims.email,
                points: 0,
                leaderboardPosition: null,
                banned: false,
                accountCreated: FieldValue.serverTimestamp(),
                level: 1,
                isAdmin: false,
                logs: []
            });
            t.update(usernameIndexRef, {
                usernames: FieldValue.arrayUnion(username),
                userIds: FieldValue.arrayUnion(uid),
            });
            t.update(adminDB.collection('index').doc('metrics'),{
                "userCount": FieldValue.increment(1),
                "usersByLevel.1": FieldValue.increment(1),
            });
            t.update(adminDB.collection('index').doc('leaderboard'),{
                "leaderboard": FieldValue.arrayUnion({
                    level: 1,
                    points: 0,
                    userId: uid,
                    username: username,
                    admin_tag: false,
                }),
                last_updated: FieldValue.serverTimestamp(),
            });

        });
        
    
        return json({status: 'created'});
    } catch (err) {
        console.log(err);
        throw error(500,'Internal Server Error');
    }
};