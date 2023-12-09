import type {PageServerLoad} from './$types';
import {adminDB} from '$lib/server/admin';
export const load = (async () => {
    const indexDoc = await adminDB.collection('index').doc('index').get();
    const indexData = indexDoc.data();
    if(!indexData){
        return {
            leaderboard: [],
            lastUpdated: 0
        }
    }
    return {
        leaderboard: indexData.leaderboard,
        lastUpdated: indexData.leaderboardLastUpdated
    };
}) satisfies PageServerLoad;