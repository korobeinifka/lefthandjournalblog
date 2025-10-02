import { readable } from 'svelte/store';

export const mdViewport = readable(false, (set) => {
    if (typeof window === 'undefined') {
        return () => {};
    }

    const query = window.matchMedia('(min-width: 768px)');
    const update = () => set(query.matches);

    update();

    const listener = (event: MediaQueryListEvent) => set(event.matches);

    if (typeof query.addEventListener === 'function') {
        query.addEventListener('change', listener);
    } else if (typeof query.addListener === 'function') {
        query.addListener(listener);
    }

    return () => {
        if (typeof query.removeEventListener === 'function') {
            query.removeEventListener('change', listener);
        } else if (typeof query.removeListener === 'function') {
            query.removeListener(listener);
        }
    };
});
