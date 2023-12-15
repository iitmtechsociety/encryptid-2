import type { RequestHandler } from './$types';
import { adminDB } from '$lib/server/admin';

let adminIds = [];

export const GET: RequestHandler = async ({
    request,
    params,
    cookies
}) => {
    return new Response();
};