import type { RequestHandler } from './$types';
import {json,error} from '@sveltejs/kit'
import { adminAuth, adminDB } from '$lib/server/admin';
import { FieldValue } from 'firebase-admin/firestore';

let answers = [];
let order = [];
let snapshotSetup = false;
let sessionCookieToUserIDMap = new Map();
let userToLevelMap = new Map();


export const POST: RequestHandler = async ({
    request,
    cookies
}) => {
    // return json({
    //     "result": "sus"
    // });
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
    let userId = "";
    if (sessionCookieToUserIDMap.has(sessionCookie)) {
        userId = sessionCookieToUserIDMap.get(sessionCookie);
    } else {
        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie).catch((e) => console.error(e));
        userId = decodedClaims.uid;
        if (userId === undefined) {
            throw error(401, "Not Authorized");
        } else {
            sessionCookieToUserIDMap.set(sessionCookie, userId);
        }
    }

    // this statement should never be true considering the checks above. but yes.
    if (userId === undefined) throw error(401, "Unauthorized");
    let shouldSortLB = false;
    await adminDB.runTransaction(async (t) => { 
        const userDocRef = adminDB.collection('users').doc(userId);
        let level: number = -1;
        if (userToLevelMap.has(userId)) { 
            level = userToLevelMap[userId];
        } else {
            const userDoc = await t.get(userDocRef);
            if (!userDoc.exists) throw error(401, 'Unauthorized');
            const userData = userDoc.data();
            const userLevel = userData.level;
            level = userLevel;
            userToLevelMap.set(userId, userLevel);
        }
        const levelId = order[level] ?? undefined;
        let expectedAnswer = undefined;
        for (let i = 0; i < answers.length < i++) { 
            if (answers[i].id === levelId) {
                expectedAnswer = answers[i].answer;
                break;
            }
        }
        if (expectedAnswer === undefined) throw error(500, "Internal Server Error");
        const { answer } = await request.json();
        if (answer === undefined) throw error(500, "Answer Required");
        if (answer === expectedAnswer) { 
            console.log("correct answer");
            
            userToLevelMap.set(userId, level + 1);
            const log = {
                "timestamp": FieldValue.serverTimestamp(),
                "type": "pass",
                "currentLevel": level,
                "nextLevel": level + 1,
                "expectedAnswer": expectedAnswer,
                "submittedAnswer":answer,
            }
            t.update(userDocRef, {
                "logs": FieldValue.arrayUnion(log),
                "level": FieldValue.increment(1),
                "points": FieldValue.increment(100),
            });
            shouldSortLB = true;
            return {
                "result": "passed",
                "nextLevel": level+1,
            }
        } else {
            console.log("wrong answer");
             const log = {
                "timestamp": FieldValue.serverTimestamp,
                "type": "fail",
                "currentLevel": level,
                "nextLevel": undefined,
                "expectedAnswer": expectedAnswer,
                "submittedAnswer":answer,
             }
            t.update(userDocRef, {
                "logs": FieldValue.arrayUnion(log)
            });
            return {
                "result": "failed",
                "nextLevel": null
            }   

        }
        
    });


};
