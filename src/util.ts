export async function asyncForEach<T>(array: T[], callback: (t: T, index: number, array: T[]) => any) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

export async function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

export function getInformedPath(path: string): {col?: string; doc?: string; root: boolean} {
    let cleanPath = path;
    if (path.indexOf('/') === 0) {
        cleanPath = path.substring(1);
    }

    if (cleanPath === '__ROOT__') {
        return {root: true};
    }

    const parts = cleanPath.split('/').length;
    const isDoc = parts % 2 === 0;
    if (isDoc) {
        return {doc: cleanPath, root: false};
    } else {
        return {col: cleanPath, root: false};
    }
}

export function constructRef(
    firestore: FirebaseFirestore.Firestore,
    path: string
): FirebaseFirestore.Firestore | FirebaseFirestore.DocumentReference | FirebaseFirestore.CollectionReference {
    const informedPath = getInformedPath(path);

    if (informedPath.root) {
        return firestore;
    } else if (informedPath.col) {
        return firestore.collection(informedPath.col);
    } else {
        return firestore.doc(informedPath.doc);
    }
}
