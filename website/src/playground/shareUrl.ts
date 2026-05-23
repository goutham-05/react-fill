import type { BuilderState } from "./types";

type SharePayload = { fields: BuilderState["fields"]; columns: number };

export function encodeState(state: BuilderState): string {
  const payload: SharePayload = { fields: state.fields, columns: state.columns };
  return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
}

export function decodeState(encoded: string): SharePayload | null {
  try {
    const json = decodeURIComponent(escape(atob(encoded)));
    const payload = JSON.parse(json) as SharePayload;
    if (!Array.isArray(payload.fields)) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Parse the hash to extract a share token: "#playground:<token>" */
export function parseShareToken(hash: string): string | null {
  const match = hash.match(/^#playground:(.+)$/);
  return match ? match[1] : null;
}

export function buildShareUrl(state: BuilderState): string {
  return `${window.location.origin}${window.location.pathname}#playground:${encodeState(state)}`;
}
