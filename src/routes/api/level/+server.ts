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
let completedUsers = [];

const cleanAnswer = (answer: string) => {
    let cleanedAnswer = answer.replace(/[^a-zA-Z0-9]/g, '');    
    return cleanedAnswer.toLowerCase();

}

export const GET: RequestHandler = async ({ cookies }) => {
    const sessionCookie = cookies.get('__session');
    if (sessionCookie === undefined) return redirect(306, '/registration');
    try {
        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie).catch((e) => { console.log(e); });
        const userId = decodedClaims.uid;
        if (userId === undefined) return redirect(306, '/registration');
        if (!snapshotSetup) {
            console.log('answers not loaded yet. loading....');
           const docRef = await adminDB.collection('index').doc('levels');
           const doc = await docRef.get();
           const data = doc.data();
           if (data !== undefined) {
           answers = data.answers;
               order = data.order;
               completedUsers = data.completed;
           }
           snapshotSetup = true;
           docRef.onSnapshot((doc) => {
               console.log('answers snapshot');
               const data = doc.data();
               if (data !== undefined) {
                   console.log('answers updated');
                   answers = data.answers;
                   order = data.order;
                   completedUsers = data.completed;
               }
       });
       }
        if (completedUsers.includes(userId)) return json({
            "result": "completed",
            "nextLevel": null
        });

        const docRef = adminDB.collection('users').doc(userId);
        const doc = await docRef.get();
        const data = doc.data();
        const levelId = order[data.level - 1];

        const docRef2 = await adminDB.collection('levels').doc(levelId);
        const doc2 = await docRef2.get();
        const data2 = doc2.data();

        delete data2.answer;
        return json(data2);
        
    } catch (e) {
        console.log(e);
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
    let nextLevel = null;

    if (!snapshotSetup) {
        console.log('answers not loaded yet. loading....');
        const docRef = await adminDB.collection('index').doc('levels');
        const doc = await docRef.get();
        const data = doc.data();
        answers = data.answers;
        order = data.order;
        completedUsers = data.completed;
        snapshotSetup = true;
        docRef.onSnapshot((doc) => {
            console.log('answers snapshot');
            const data = doc.data();
            console.log(data);
            if (data) {
                console.log('answers updated');
                answers = data.answers;
                order = data.order;
                completedUsers = data.completed;
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
    let levelPassedWithCompletion = false;
    await adminDB.runTransaction(async (t) => { 
        console.log("transaction started");
        const userDocRef = await adminDB.collection('users').doc(userId).get();
        let level: number = 1;
        const userData = userDocRef.data();
        // console.log(userData);
        if (!userDocRef.exists) throw error(401, 'Unauthorized');
        
        level = userData.level;
        let expectedAnswer = answers[level-1] ?? undefined;
        if (expectedAnswer === undefined) {
            console.log("answer not found");
            throw error(500, "Internal Server Error")   
        }
        const { answer } = await request.json();
        console.log("answer: " + answer);
        if (answer === undefined) throw error(500, "Answer Required");
        console.log("expected answer: " + expectedAnswer);
        if (cleanAnswer(answer) === cleanAnswer(expectedAnswer)) { 
            console.log("correct answer");
            let didComplete = false;
            if (level === order.length) {
                console.log("completed");
                didComplete = true;
                levelPassedWithCompletion = true;
            }
            console.log("level: " + level);
            console.log("next level: " + (level+1));
            nextLevel = level+1;
            const log = {
                "timestamp": Date.now(),
                "type": didComplete ? "completed" : "pass",
                "currentLevel": level,
                "nextLevel": level+1,
                "expectedAnswer": expectedAnswer,
                "submittedAnswer":answer,
            }
            const leaderboardJobDef = {
                "timestamp": Date.now(),
                "newLevel": level+1,
                "newPoints": level*100,
                userId,
            };
            if (didComplete) {
                t.update(adminDB.collection('users').doc(userId), {
                    "logs": FieldValue.arrayUnion(log),
                    "completed": true,
                    "level":  level+1,
                    "points": level*100,
            });
            } else {
                t.update(adminDB.collection('users').doc(userId), {
                "logs": FieldValue.arrayUnion(log),
                "level": level+1,
                "points": level*100,
            }); 
            }
            if(didComplete){
                completedUsers.push(userId);
                t.update(adminDB.collection('index').doc('users'), {
                    'completed': FieldValue.arrayUnion(userId),
                });
                t.update(adminDB.collection('index').doc('levels'), {
                    'completed': FieldValue.arrayUnion(userId),
                });
            }
            t.update(adminDB.collection('index').doc('leaderboard_task_queue'),{
                jobs: FieldValue.arrayUnion(leaderboardJobDef)
            });
            const metricsDocRef = adminDB.collection('index').doc('metrics');
            if (didComplete) {
                const key1 = "usersByLevel." + (level + 1);
                const key2 = "usersByLevel." + level;
                t.update(metricsDocRef, {
                    "completed": FieldValue.increment(1),
                    [key1]: FieldValue.increment(1),
                    [key2]: FieldValue.increment(-1),
                });
            } else {
                const key1 = "usersByLevel." + (level + 1);
                const key2 = "usersByLevel." + level;
                t.update(metricsDocRef, {
                [key1]: FieldValue.increment(1),
                [key2]: FieldValue.increment(-1),
                });
            }
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
            t.update(adminDB.collection('users').doc(userId), {
                "logs": FieldValue.arrayUnion(log)
            });
        } 
    });
    console.log("transaction complete");
    if (levelPassed) {
        if (levelPassedWithCompletion) {
            return json({
                "result": "completed",
                "nextLevel": nextLevel
            });
        } else {
            return json({
            "result": "passed",
            "nextLevel": nextLevel
        });
        }

    }
    return json({
        "result": "failed",
        "nextLevel": null
    });
};
