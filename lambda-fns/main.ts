import Comment from './Comment'
import createComment from './createComment';
import deleteComment from './delete';
import getCommentById from './getCommentById';
import listComments from './listComments';
import updateComment from './updateComment';

type AppSyncEvent = {
    info:{
        fieldName: string
    },
    arguments:{
        commentId: string,
        comment: Comment
    }
}

exports.handler = async (event: AppSyncEvent) => {
    switch (event.info.fieldName) {
        case 'getCommentById':
            return await getCommentById(event.arguments.commentId);
        case 'createComment':
            return await createComment(event.arguments.comment);
        case 'listComments':
            return await listComments();
        case 'deleteComment':
            return await deleteComment(event.arguments.commentId);
        case 'updateComment':
            return await updateComment(event.arguments.comment);
        default:
            return null;
    }
}

