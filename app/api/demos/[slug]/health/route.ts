import { NextResponse } from 'next/server';
import { getDemoApiBaseUrl, getDemoConfig, joinApiUrl } from '@/lib/demos';

export const dynamic = 'force-dynamic';

interface ProbeAttempt {
  path: string;
  url: string;
  ok: boolean;
  status: number | null;
  statusText: string | null;
  contentType: string | null;
  bodySnippet: string | null;
  error: string | null;
}

async function probe(url: string, path: string): Promise<ProbeAttempt> {
  try {
    const response = await fetch(url, {
      cache: 'no-store',
      headers: { accept: 'application/json, text/plain;q=0.9, */*;q=0.1' },
      signal: AbortSignal.timeout(4500),
    });
    const contentType = response.headers.get('content-type');
    const body = await response.text();

    return {
      path,
      url,
      ok: response.ok,
      status: response.status,
      statusText: response.statusText || null,
      contentType,
      bodySnippet: body ? body.slice(0, 360) : null,
      error: null,
    };
  } catch (error) {
    return {
      path,
      url,
      ok: false,
      status: null,
      statusText: null,
      contentType: null,
      bodySnippet: null,
      error: error instanceof Error ? error.message : 'Unknown fetch error',
    };
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const config = getDemoConfig(slug);

  if (!config) {
    return NextResponse.json(
      {
        ok: false,
        slug,
        message: 'Unknown interactive demo.',
      },
      { status: 404 }
    );
  }

  const apiBaseUrl = getDemoApiBaseUrl(config);
  const checkedAt = new Date().toISOString();
  const attempts: ProbeAttempt[] = [];

  for (const path of config.healthPaths) {
    const attempt = await probe(joinApiUrl(apiBaseUrl, path), path);
    attempts.push(attempt);
    if (attempt.ok) {
      return NextResponse.json(
        {
          ok: true,
          slug: config.slug,
          name: config.name,
          apiBaseUrl,
          configuredBy: config.apiBaseEnv,
          endpoint: attempt.path,
          status: attempt.status,
          statusText: attempt.statusText,
          bodySnippet: attempt.bodySnippet,
          checkedAt,
          attempts,
          message: 'Backend staging origin is reachable.',
        },
        { headers: { 'cache-control': 'no-store' } }
      );
    }
  }

  return NextResponse.json(
    {
      ok: false,
      slug: config.slug,
      name: config.name,
      apiBaseUrl,
      configuredBy: config.apiBaseEnv,
      endpoint: null,
      status: attempts[0]?.status ?? null,
      statusText: attempts[0]?.statusText ?? null,
      bodySnippet: attempts[0]?.bodySnippet ?? null,
      checkedAt,
      attempts,
      message: 'Backend is sleeping or the Cloudflare Tunnel is not connected.',
    },
    { headers: { 'cache-control': 'no-store' } }
  );
}
