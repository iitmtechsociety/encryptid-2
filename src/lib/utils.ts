import { toasts } from 'svelte-toasts';

export const sendErrorToast = (title: string, body:string) => { 
    toasts.add({
        title: title,
        description: body,
        duration: 10000,
        type: 'error',
        theme: 'dark',
        showProgress: true
    });
}


export const sendSuccessToast = (title: string, body:string) => { 
    toasts.add({
        title: title,
        description: body,
        duration: 3000,
        type: 'success',
        theme: 'dark',
        showProgress: true
    });
}

