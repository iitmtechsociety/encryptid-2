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
        const data = await request.json();
        data['levelIndex'] = nextIndex;
        adminDB.runTransaction(async (t) => {
            if (nextIndex === -1) nextIndex = (await adminDB.collection('levels').count().get()).data().count;
            t.get(adminDB.collection('users').doc(uid)).then((doc) => {
                if (!doc.exists) throw error(401, 'Unauthorized');
                if (!doc.data()!.isAdmin) throw error(403, 'Forbidden');
            });
            try {
                const newLevelRef = adminDB.collection('levels').doc();
                data['levelId'] = newLevelRef.id;
                t.create(newLevelRef, data);
                nextIndex++;
                t.update(adminDB.collection('index').doc('metrics'), {
                    'questionCount': FieldValue.increment(1),
                });
                t.update(adminDB.collection('index').doc('levels'), {
                    'order': FieldValue.arrayUnion(newLevelRef.id),
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