import * as admin from 'firebase-admin';

export class FirebaseAdmin {
    admin = admin;
    auth: admin.auth.Auth;
    firestore: FirebaseFirestore.Firestore;

    init(path: string) {
        const serviceAccount = require(`${process.cwd()}/${path}`);

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });

        this.auth = admin.auth();

        this.firestore = admin.firestore() as FirebaseFirestore.Firestore;
        this.firestore.settings({timestampsInSnapshots: true});
    }
}
