import {FirebaseAdmin} from '../../firebase-admin';
import {Command} from '../command';

export class FirestoreGetCommand implements Command {
    static KEY = 'FIRESTORE.GET';
    format = `    { "action":"FIRESTORE.GET", "path": "colA/docB" }`;

    async execute(firebaseAdmin: FirebaseAdmin, params: any): Promise<any> {
        const snapshot = await firebaseAdmin.firestore.doc(params.path).get();
        const data = snapshot.data();
        return {success: true, data};
    }
}
