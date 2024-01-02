import {adminDB} from '$lib/server/admin';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

let leaderboard: [] = [];
let snapshotSetup = false;
let last_updated = 0;

export const GET: RequestHandler = async ()=>{
    console.log('leaderboard');
   try {
    console.log('leaderboard try');
    if(snapshotSetup) {
        console.log('leaderboard snapshot already setup');
        return json({
            leaderboard: leaderboard,
            last_updated: last_updated,
        });
    }
    if(!snapshotSetup){
        console.log('leaderboard not loaded yet. loading....');
        const docRef = await adminDB.collection('index').doc('leaderboard');
        const doc = await docRef.get();
        const data = doc.data();
        if(!snapshotSetup){
            console.log('setting up leaderboard snapshot...');
            snapshotSetup = true;
            docRef.onSnapshot((doc) => {
                console.log('leaderboard snapshot');
                const data = doc.data();
                console.log(data);
                if(data){
                    console.log('leaderboard updated');
                    leaderboard = data.leaderboard;
                    last_updated = data.last_updated.toDate();
                }
            });
        }
        if(data){
            console.log('leaderboard loaded. updating....');
            leaderboard = data.leaderboard;
            last_updated = data.last_updated.toDate();
            return json({
                leaderboard: leaderboard,
                last_updated: last_updated,
            });
            
        }
        
    } 
   } catch (e) {
        console.error(e);
        throw error(500, 'Internal Server Error');
    }
    return json({
        leaderboard: leaderboard,
    });
};