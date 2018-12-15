import {Command} from '../command';
import {FirebaseAdmin} from '../../firebase-admin';
import {sleep} from '../../util';

export class AuthDeleteCommand implements Command {
    static KEY = 'AUTH.DELETE';
    format = `      { "action":"AUTH.DELETE", "remove?": ".*@remove.com", "keep?": ".*@keep.com" }`;

    public async execute(firebaseAdmin: FirebaseAdmin, params: any): Promise<any> {
        const req = await firebaseAdmin.auth.listUsers();

        let keepRegex: RegExp;
        if (params.keep) {
            keepRegex = new RegExp(params.keep);
        }
        let removeRegex: RegExp;
        if (params.remove) {
            removeRegex = new RegExp(params.remove);
        }

        const users = req.users
            .filter(user => keepRegex === undefined || !keepRegex.test(user.email))
            .filter(user => removeRegex === undefined || removeRegex.test(user.email));

        while (users.length > 0) {
            Math.min(users.length, 10);
            const splicedUsers = users.splice(0, 10);
            await Promise.all(splicedUsers.map(user => firebaseAdmin.auth.deleteUser(user.uid)));
            if (users.length > 10) {
                await sleep(2000); // Delete quota is 10 per second
            }
        }

        return {
            success: true
        };
    }
}
