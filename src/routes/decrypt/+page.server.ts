export const prerender = false;
export const csr = false;
import {adminAuth,adminDB} from '$lib/server/admin';
import { redirect } from '@sveltejs/kit';

let snapshotSetup = false;
let indexedIDS = [];

export const load = (async ({cookies}) => {

     if(snapshotSetup === false) {
          console.log("setting up snapshot");
            const snap = await adminDB.collection('index').doc('levels').get();
            indexedIDS = snap.data()['order']
            console.log(indexedIDS);
            adminDB.collection('index').doc('levels').onSnapshot((snap) => {
                    console.log("updating snapshot");
                    indexedIDS = snap.data()['order']
               });
            snapshotSetup = true;
     }

   const sessionCookie = cookies.get('__session');
   if(sessionCookie === undefined) return redirect(306,'/registration');
   try {
        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);
        const uid = decodedClaims.uid;
        const userRef = await adminDB.collection('users').doc(uid);
        const userDoc = await userRef.get();
        const userData = userDoc.data();
        if(userData === undefined) return redirect(306,'/registration');
        console.log(userData);
        return {
            level: indexedIDS[userData.level-1],
        }

   } catch (err) {
        console.error(err);
        return redirect(306,'/registration');
   }
});
