import { adminDB, adminAuth } from '$lib/server/admin'

export const load = async ({ cookies }) => {
    console.log("Loading Layout Data");
    const session = cookies.get('__session');
    if (session === undefined) return {
        userId: null,
        registration_state: "not_started"
    };
    
    try {
        console.log("Verifying Session Cookie");
        const decodedClaims = await adminAuth.verifySessionCookie(session).catch((error) => { console.log(error); })
        console.log("Session Cookie Verified");
        const userId = decodedClaims.uid;
        console.log("User ID: " + userId);
        if (userId === undefined) return {
            userId: null,
            registration_state: "expired"
        }
        
        const userDoc = await adminDB.collection('users').doc(userId).get();
        console.log("User Doc Exist: " + userDoc.exists);
        if (userDoc.exists) {
            return {
                userId: userId,
                registration_state: "completed"
            };
        } else {
            return {
                "userId": userId,
                registration_state: "username_not_set"
            };
        }


    } catch (e) {
        console.log("Session Cookie Verification Failed");
        return {
            "userId": null,
            "registration_state": "not_started"
        };
    }
};