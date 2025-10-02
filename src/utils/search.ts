export type SearchEntry = {
    title: string;
    description: string;
    category: string;
    url: string;
    excerpt: string;
    pubDate: string;
    searchField: string;
};

let cachedEntries: SearchEntry[] | null = null;
let pendingRequest: Promise<SearchEntry[]> | null = null;

export const fetchSearchEntries = async (): Promise<SearchEntry[]> => {
    if (cachedEntries) {
        return cachedEntries;
    }

    if (pendingRequest) {
        return pendingRequest;
    }

    pendingRequest = fetch('/search.json', {
        headers: {
            Accept: 'application/json',
        },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Unable to fetch search index');
            }
            return response.json() as Promise<SearchEntry[]>;
        })
        .then((data) => {
            cachedEntries = data;
            return data;
        })
        .finally(() => {
            pendingRequest = null;
        });

    return pendingRequest;
};

export const filterSearchEntries = (
    entries: SearchEntry[],
    query: string,
    options: { limitWithQuery?: number; limitWithoutQuery?: number } = {}
) => {
    const { limitWithQuery = 12, limitWithoutQuery = 6 } = options;
    const trimmedQuery = query.trim().toLowerCase();

    if (!trimmedQuery) {
        return entries.slice(0, limitWithoutQuery);
    }

    return entries
        .filter((entry) => entry.searchField.includes(trimmedQuery))
        .slice(0, limitWithQuery);
};

export const formatSearchDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) {
        return '';
    }

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};
