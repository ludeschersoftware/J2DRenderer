export async function ResolveAsync<T>(promise: Promise<T>): Promise<any[] | (T | null)[]> {
    return await promise
        .then((data) => {
            return [data, null];
        })
        .catch((error) => {
            return [null, error];
        });
};