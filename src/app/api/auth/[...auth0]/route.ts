import { handleAuth } from '@auth0/nextjs-auth0';

export const GET = async (request: Request, context: { params: Promise<{ auth0: string[] }> }) => {
  const { params } = context;
  const resolvedParams = await params;
  return handleAuth()(request, { params: resolvedParams });
};
