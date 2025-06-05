export namespace Unauthorized {
    export namespace MsgBoardDb {
        export namespace V1 {
            export const TOPIC = 'unauthorized.msg_board_db.v1';

            export interface CreateMsg {
                type: 'create';
                name: string;
                content: string;
                date: number;
            }

            export interface ReadMsg {
                type: 'read';
                quantity: number;
                page: number;
            }

            export interface UpdateMsg extends Omit<CreateMsg, 'type'> {
                type: 'update';
                id: string;
            }

            export interface DeleteMsg {
                type: 'delete';
                id: string;
            }

            export type Msg = CreateMsg | ReadMsg | UpdateMsg | DeleteMsg;
        }
    }
}
