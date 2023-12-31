import type { RequestHandler } from './$types';
import {json,error, redirect} from '@sveltejs/kit'
import { adminAuth, adminDB } from '$lib/server/admin';
import { FieldValue } from 'firebase-admin/firestore';

let answers = [];
let order = [];
let snapshotSetup = false;
const sessionCookieToUserIDMap = new Map();
const userToLevelMap = new Map();
const questionDataMap = new Map();


export const GET: RequestHandler = async ({ cookies }) => {
    const sessionCookie = cookies.get('__session');
    if (sessionCookie === undefined) return redirect(306, '/registration');
    try {
        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie).catch((e) => { console.log(e); });
        const userId = decodedClaims.uid;
        if(userId === undefined) return redirect(306, '/registration');
        if (!userToLevelMap.has(userId)) {
            const docRef = await adminDB.collection('users').doc(userId);
            const doc = await docRef.get();
            const data = doc.data();
            if (data === undefined) userToLevelMap.set(userId, 1);
            else userToLevelMap.set(userId, data.level ?? 1);
        }
        if (!snapshotSetup) {
             console.log('answers not loaded yet. loading....');
            const docRef = await adminDB.collection('index').doc('levels');
            const doc = await docRef.get();
            const data = doc.data();
            if (data !== undefined) {
            answers = data.answers;
            order = data.order;
            }
            snapshotSetup = true;
            docRef.onSnapshot((doc) => {
                console.log('answers snapshot');
                const data = doc.data();
                if (data !== undefined) {
                    console.log('answers updated');
                    answers = data.answers;
                    order = data.order;
                }
        });
        }
        const levelId = order[userToLevelMap.get(userId) - 1];
        if (questionDataMap.has(levelId)) {
            const levelData = questionDataMap.get(levelId);
            delete levelData.answer;
            return json(levelData);
        } else {
            const docRef = await adminDB.collection('levels').doc(levelId);
            const doc = await docRef.get();
            const data = doc.data();
            if (data === undefined) throw error(500, 'Internal Server Error');
            questionDataMap.set(levelId, data);
            adminDB.collection('levels').doc(levelId).onSnapshot((doc) => {
                const data = doc.data();
                if (data !== undefined) {
                    questionDataMap.set(levelId, data);
                }
            });
            delete data.answer;
            return json(data);
        }
        
    } catch (e) {
        throw error(500, 'Something Went Wrong');
    }
 };

export const POST: RequestHandler = async ({
    request,
    cookies
}) => {
    // return json({
    //     "result": "sus"
    // });
    console.log('POST /api/level');
    if (!snapshotSetup) {
        console.log('answers not loaded yet. loading....');
        const docRef = await adminDB.collection('index').doc('levels');
        const doc = await docRef.get();
        const data = doc.data();
        answers = data.answers;
        order = data.order;
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
    console.log(userId);
    let levelPassed = false;
    await adminDB.runTransaction(async (t) => { 
        const userDocRef = adminDB.collection('users').doc(userId);
        let level: number = -1;
        if (userToLevelMap.has(userId)) { 
            level = userToLevelMap.get(userId);
        } else {
            const userDoc = await t.get(userDocRef);
            if (!userDoc.exists) throw error(401, 'Unauthorized');
            const userData = userDoc.data();
            const userLevel = userData.level;
            level = userLevel;
            userToLevelMap.set(userId, userLevel);
        }
        // const levelId = order[level-1] ?? undefined;
        let expectedAnswer = answers[level-1] ?? undefined;
        // for (let i = 0; i < answers.length; i++) { 
        //     if (answers[i].id === levelId) {
        //         expectedAnswer = answers[i].answer;
        //         break;
        //     }
        // }
        if (expectedAnswer === undefined) {
            console.log("answer not found");
            throw error(500, "Internal Server Error")
            
        }
        const { answer } = await request.json();
        if (answer === undefined) throw error(500, "Answer Required");
        if (answer === expectedAnswer) { 
            console.log("correct answer");
            
            userToLevelMap.set(userId, level + 1);
            const log = {
                "timestamp": Date.now(),
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
            levelPassed = true;
             
        } else {
            console.log("wrong answer");
             const log = {
                "timestamp": Date.now(),
                "type": "fail",
                "currentLevel": level,
                "nextLevel": null,
                "expectedAnswer": expectedAnswer,
                "submittedAnswer":answer,
             }
            t.update(userDocRef, {
                "logs": FieldValue.arrayUnion(log)
            });

        } 
    });
    console.log("transaction complete");
    if (levelPassed) {
        return json({
            "result": "passed",
            "nextLevel": userToLevelMap.get(userId)
        });
    }
    return json({
        "result": "failed",
        "nextLevel": null
    });
};
