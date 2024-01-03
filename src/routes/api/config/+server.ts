import type { RequestHandler } from './$types';
import {  json } from '@sveltejs/kit';
import { adminDB } from '$lib/server/admin';

let config = {};
let snapshotSetup = false;

export const GET: RequestHandler = async ()=>{
    console.log("config");
    try{
        if(snapshotSetup) {
            console.log('config snapshot already setup');
            return json(config);
        }
        if(Object.keys(config).length === 0){
            console.log('config not loaded yet. loading....');
            const docRef = await adminDB.collection('index').doc('config');
            const doc = await docRef.get();
            const data = doc.data();
            if(!snapshotSetup){
                console.log('setting up config snapshot...');
                snapshotSetup = true;
                docRef.onSnapshot((doc) => {
                    console.log('config snapshot');
                    const data = doc.data();
                    console.log(data);
                    if(data){
                        console.log('config updated');
                        config = data;
                    }
                });
            }
            if(data){
                console.log('config loaded. updating....');
                config = data;
                return json(config);
            }
            
        }
    } catch (e) {
        console.error(e);
        return json({
            countdown_iso: "2024-01-04 00:42:00",
            questions_enabled: false,
            reg_enabled: false
        })
    }
    return json(config);

};