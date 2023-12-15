import type { RequestHandler } from './$types';
import { adminDB, adminAuth } from '$lib/server/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { error, json } from '@sveltejs/kit'; ''

export const PUT: RequestHandler = async ({ request, params, cookies }) => {
    const sessionCookie = cookies.get('__session');
    if (sessionCookie === undefined) throw error(401, 'Unauthorized');
    try {
        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);
        const uid = decodedClaims.uid;
        const data = await request.json();
        adminDB.runTransaction(async (t) => {
            t.get(adminDB.collection('users').doc(uid)).then((doc) => {
                if (!doc.exists) throw error(401, 'Unauthorized');
                if (!doc.data()!.isAdmin) throw error(403, 'Forbidden');
            });
            try {
                const levelRef = adminDB.collection('levels').doc(params.id);
                t.update(levelRef, data);
                return json({ 'levelId': levelRef.id });
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

export const DELETE: RequestHandler = async ({ params, cookies }) => {
    const sessionCookie = cookies.get('__session');
    if (sessionCookie === undefined) throw error(401, 'Unauthorized');
    try {
        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);
        const uid = decodedClaims.uid;
        adminDB.runTransaction(async (t) => {
            t.get(adminDB.collection('users').doc(uid)).then((doc) => {
                if (!doc.exists) throw error(401, 'Unauthorized');
                if (!doc.data()!.isAdmin) throw error(403, 'Forbidden');
            });
            try {
                const levelRef = adminDB.collection('levels').doc(params.id);
                t.delete(levelRef);
                t.update(adminDB.collection('index').doc('metrics'), {
                    'levels': FieldValue.increment(-1),
                });
                return json({ 'levelId': levelRef.id });
            } catch (err) {
                console.log(err);
                throw error(500, 'Internal Server Error');
            }
        });
        return json({ 'levelId': params.id });
    } catch (err) {
        console.log(err);
        throw error(500, 'Internal Server Error');
    }
}