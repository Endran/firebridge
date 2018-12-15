import {FirebaseAdmin} from '../../firebase-admin';
import {asyncForEach, getInformedPath} from '../../util';
import {Command} from '../command';

export class FirestoreClearCommand implements Command {
    static KEY = 'FIRESTORE.CLEAR';
    format = `  { "action":"FIRESTORE.CLEAR", "path": "__ROOT__" | "colA" | "colA/docB" }`;

    async execute(firebaseAdmin: FirebaseAdmin, params: any): Promise<any> {
        const informedPath = getInformedPath(params.path);
        if (informedPath.col) {
            const collectionReference = firebaseAdmin.firestore.collection(informedPath.col);
            await this.clear([collectionReference]);
        } else if (informedPath.doc) {
            firebaseAdmin.firestore.doc(informedPath.doc).delete();
        } else if (informedPath.root) {
            const collectionReferences = await firebaseAdmin.firestore.listCollections();
            await this.clear(collectionReferences);
        }

        return {
            success: true
        };
    }

    async clear(collectionReferences: FirebaseFirestore.CollectionReference[]): Promise<void> {
        await asyncForEach(collectionReferences, async collection => this.recursiveDelete(collection));
    }

    private async recursiveDelete(cRef: FirebaseFirestore.CollectionReference) {
        const documents = await cRef.listDocuments();
        asyncForEach(documents, async dRef => {
            const subCollections = dRef.listCollections();
            await asyncForEach(await subCollections, async scRef => await this.recursiveDelete(scRef));
        });
        await Promise.all(
            documents.map(dRef => {
                return dRef.delete();
            })
        );
    }
}
