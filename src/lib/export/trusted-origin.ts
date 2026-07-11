import { isSafeImageSource } from "@/lib/engine/slot-schema";

type OriginEnvironment = {
  NODE_ENV?: string;
  SATGAT_APP_ORIGIN?: string;
  VERCEL_URL?: string;
};

type TrustedOriginOptions = {
  env: OriginEnvironment;
  requestUrl?: string;
};

function validatedConfiguredOrigin(value: string, allowLocalHttp: boolean): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch (error) {
    throw new Error("Invalid trusted application origin", { cause: error });
  }
  const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  const validScheme = url.protocol === "https:" || (allowLocalHttp && local && url.protocol === "http:");
  if (
    !validScheme ||
    url.username !== "" ||
    url.password !== "" ||
    url.pathname !== "/" ||
    url.search !== "" ||
    url.hash !== ""
  ) {
    throw new Error("Invalid trusted application origin");
  }
  return url.origin;
}

export function resolveTrustedPdfOrigin({ env, requestUrl }: TrustedOriginOptions): string {
  const development = env.NODE_ENV === "development";
  if (env.SATGAT_APP_ORIGIN) {
    return validatedConfiguredOrigin(env.SATGAT_APP_ORIGIN, development);
  }

  if (env.NODE_ENV === "production" && env.VERCEL_URL) {
    if (!/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+vercel\.app$/i.test(env.VERCEL_URL)) {
      throw new Error("Invalid trusted application origin");
    }
    return validatedConfiguredOrigin(`https://${env.VERCEL_URL}`, false);
  }

  if (development && requestUrl) {
    const request = new URL(requestUrl);
    const local = request.hostname === "localhost" || request.hostname === "127.0.0.1";
    if (local) return validatedConfiguredOrigin(request.origin, true);
  }

  throw new Error("Missing trusted application origin");
}

export function isTrustedPdfRequestUrl(requestUrl: string, trustedOrigin: string): boolean {
  try {
    const request = new URL(requestUrl);
    if (request.protocol === "data:") return isSafeImageSource(requestUrl);
    return (
      (request.protocol === "http:" || request.protocol === "https:") &&
      request.origin === trustedOrigin
    );
  } catch {
    return false;
  }
}

export function assertTrustedNavigation(actualUrl: string, trustedOrigin: string): void {
  let actual: URL;
  try {
    actual = new URL(actualUrl);
  } catch (error) {
    throw new Error("Preview navigation produced an invalid URL", { cause: error });
  }
  if (actual.origin !== trustedOrigin) {
    throw new Error("Preview navigation followed a cross-origin redirect");
  }
}
