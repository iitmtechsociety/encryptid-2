import type {PageServerLoad} from './$types';
import type { Timestamp } from 'firebase-admin/firestore';
import {adminDB} from '$lib/server/admin';
export const load = (async () => {
    const indexDoc = await adminDB.collection('index').doc('leaderboard').get();
    const indexData = indexDoc.data();
    const ts = indexData?.last_updated as Timestamp;
    if(!indexData){
        return {
            leaderboard: [],
            last_updated: undefined
        }
    }
    return {
        leaderboard: indexData.leaderboard,
        last_updated: ts.seconds
    };
}) satisfies PageServerLoad;