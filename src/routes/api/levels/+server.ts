import { adminDB, adminAuth } from '$lib/server/admin';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { FieldValue } from 'firebase-admin/firestore';

let nextIndex = -1;

export const POST: RequestHandler = async ({ request, cookies }) => { 
    console.log("question creation");
    const sessionCookie = cookies.get('__session');
    if (sessionCookie === undefined) throw error(401, 'Unauthorized');
    try {
        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);
        const uid = decodedClaims.uid;
        const userRef = await adminDB.collection('users').doc(uid);
        const userDoc = await userRef.get();
        const userData = userDoc.data();
        if (userData === undefined) throw error(401, 'Unauthorized');
        if (userData.isAmin !== true) throw error(403, 'Forbidden');
        const data = await request.json();
        data['levelIndex'] = nextIndex;

        await adminDB.runTransaction(async (t) => {
            if (nextIndex === -1) nextIndex = (await adminDB.collection('levels').count().get()).data().count;          
            try {
                const newLevelRef = adminDB.collection('levels').doc(data.id);
                data['levelId'] = newLevelRef.id;
                t.create(newLevelRef, data);
                nextIndex++;
                t.update(adminDB.collection('index').doc('metrics'), {
                    'levels': FieldValue.increment(1),
                });
                t.update(adminDB.collection('index').doc('levels'), {
                    'order': FieldValue.arrayUnion(newLevelRef.id),
                    'answers': FieldValue.arrayUnion({
                        'id': newLevelRef.id,
                        'answer': data.answer,
                    }),
                });
                return json({ 'levelId': newLevelRef.id });
                
            } catch (err) {
                console.log(err);
                throw error(500, 'Internal Server Error');
            }
        });

    } catch (err) {
        console.log(err);
        throw error(500, 'Internal Server Error');
    }
    
}