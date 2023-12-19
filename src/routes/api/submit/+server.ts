import type { RequestHandler } from './$types';
import {json,error} from '@sveltejs/kit'
import { adminAuth, adminDB } from '$lib/server/admin';

let answers = [];
let order = [];
let snapshotSetup = false;


export const POST: RequestHandler = async ({
    request,
    cookies
}) => {
    return json({
        "result": "sus"
    });
    if (!snapshotSetup) {
        console.log('answers not loaded yet. loading....');
        const docRef = await adminDB.collection('index').doc('levels');
        const doc = await docRef.get();
        const data = doc.data();
        answers = data.answers;
        snapshotSetup = true;
        docRef.onSnapshot((doc) => {
            console.log('answers snapshot');
            const data = doc.data();
            console.log(data);
            if (data) {
                console.log('answers updated');
                answers = data.answers;
                order = data.order;
            }
        }
        );
    }
    const sessionCookie = cookies.get('__session');
    if (sessionCookie === undefined) throw error(401, 'Unauthorized');
    try {
        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);
        const userId = decodedClaims.uid;
        const answer = request.body.answer;
        
        await adminDB.runTransaction(async (t) => {
            const docRef = adminDB.collection('users').doc(userId);
            const doc =  t.get(docRef);
            const data = doc.data();
            if (data) {
                const level = data.level;
                const points = data.points;
                if (level) {
                    const questionId = order[level];
                    let expectedAnswer = null;
                    for (let i = 0; i < answers.length; i++) {
                        if (answers[i].id === questionId) {
                            expectedAnswer = answers[i].answer;
                            break;
                        }
                    }
                    if(expectedAnswer === null) throw error(500, 'Internal Server Error');
                    if (answer === expectedAnswer) {
                        await t.update(docRef, {
                            level: level + 1,
                            points: points + 100
                        });
                        return json({
                            'result': 'success'
                        });
                    } else {
                        return json({
                            'result': 'failed'
                        });
                    }
                } else {
                    return json({
                        level: level,
                        points: points
                    });
                }
            }
        });


    } catch (e) {
        console.log(e);
        throw error(500, 'Internal Server Error');
    }
};