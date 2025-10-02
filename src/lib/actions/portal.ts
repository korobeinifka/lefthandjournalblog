export type PortalTarget = HTMLElement | string;

/**
 * Svelte action: moves the node to a target container (default: document.body).
 * Keeps Svelte reactivity/events intact. On destroy, removes the node.
 */
export function portal(node: HTMLElement, target: PortalTarget = 'body') {
  if (typeof document === 'undefined') return;

  const resolveTarget = (t: PortalTarget): HTMLElement | null =>
    typeof t === 'string' ? (document.querySelector(t) as HTMLElement | null) : t;

  const host = resolveTarget(target) ?? document.body;
  host.appendChild(node);

  return {
    destroy() {
      if (node.parentNode === host) host.removeChild(node);
    },
  };
}

