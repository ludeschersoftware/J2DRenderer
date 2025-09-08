type ComparerType<T> = (a: T, b: T) => boolean;
type ItemCallbackType<T> = (item: T) => boolean;

class List<T> {
    private readonly m_items: T[];
    private readonly m_comparer: ComparerType<T>;

    constructor(collection?: T[], comparer?: ComparerType<T>) {
        this.m_items = collection ? [...collection] : [];
        this.m_comparer = comparer ?? ((a, b) => a === b);
    }

    // ------------------------
    // Properties
    // ------------------------
    public get Count(): number {
        return this.m_items.length;
    }

    public get IsEmpty(): boolean {
        return this.m_items.length === 0;
    }

    // ------------------------
    // Iteration
    // ------------------------
    public *Items(): Generator<T> {
        yield* this.m_items;
    }

    public [Symbol.iterator](): Iterator<T> {
        return this.Items();
    }

    // ------------------------
    // Modification
    // ------------------------
    public Add(item: T): this {
        this.m_items.push(item);

        return this;
    }

    public AddRange(items: T[]): this {
        this.m_items.push(...items);

        return this;
    }

    public Insert(index: number, item: T): this {
        if ((index < 0) || (index > this.m_items.length)) {
            throw new RangeError("Index out of range.");
        }

        this.m_items.splice(index, 0, item);

        return this;
    }

    public Remove(item: T): boolean {
        const INDEX: number = this.IndexOf(item);

        if (INDEX >= 0) {
            this.m_items.splice(INDEX, 1);

            return true;
        }

        return false;
    }

    public RemoveAll(callback: ItemCallbackType<T>): number {
        let removed_count = 0;

        for (let i = this.m_items.length - 1; i >= 0; i--) {
            if (callback(this.m_items[i])) {
                this.m_items.splice(i, 1);

                removed_count++;
            }
        }

        return removed_count;
    }

    public RemoveAt(index: number): this {
        if ((index < 0) || (index >= this.m_items.length)) {
            throw new RangeError("Index out of range.");
        }

        this.m_items.splice(index, 1);

        return this;
    }

    public Clear(): this {
        this.m_items.length = 0;

        return this;
    }

    public Reverse(): this {
        this.m_items.reverse();

        return this;
    }

    // ------------------------
    // Query
    // ------------------------
    public Contains(item: T): boolean {
        return this.m_items.some(x => this.m_comparer(x, item));
    }

    public IndexOf(item: T): number {
        return this.m_items.findIndex(x => this.m_comparer(x, item));
    }

    public Find(callback: ItemCallbackType<T>): T | undefined {
        return this.m_items.find(callback);
    }

    public FindIndex(callback: ItemCallbackType<T>): number {
        return this.m_items.findIndex(callback);
    }

    public Any(callback?: ItemCallbackType<T>): boolean {
        return callback ? this.m_items.some(callback) : this.m_items.length > 0;
    }

    public All(callback: ItemCallbackType<T>): boolean {
        return this.m_items.every(callback);
    }

    public First(callback?: ItemCallbackType<T>): T | undefined {
        return callback ? this.m_items.find(callback) : this.m_items[0];
    }

    public FirstOrDefault(callback?: ItemCallbackType<T>, defaultValue?: T): T | undefined {
        const FOUND: T | undefined = callback ? this.m_items.find(callback) : this.m_items[0];

        return FOUND === undefined ? defaultValue : FOUND;
    }

    public Last(callback?: ItemCallbackType<T>): T | undefined {
        if (callback) {
            for (let i = this.m_items.length - 1; i >= 0; i--) {
                if (callback(this.m_items[i])) {
                    return this.m_items[i];
                }
            }

            return undefined;
        }

        return this.m_items[this.m_items.length - 1];
    }

    public LastOrDefault(callback?: ItemCallbackType<T>, defaultValue?: T): T | undefined {
        const FOUND: T | undefined = this.Last(callback);

        return FOUND === undefined ? defaultValue : FOUND;
    }

    // ------------------------
    // Access
    // ------------------------
    public Get(index: number): T {
        if ((index < 0) || (index >= this.m_items.length)) {
            throw new RangeError("Index out of range.");
        }

        return this.m_items[index];
    }

    public Set(index: number, value: T): this {
        if ((index < 0) || (index >= this.m_items.length)) {
            throw new RangeError("Index out of range.");
        }

        this.m_items[index] = value;

        return this;
    }

    // ------------------------
    // Transformations
    // ------------------------
    public Where(callback: ItemCallbackType<T>): List<T> {
        return new List(this.m_items.filter(callback), this.m_comparer);
    }

    public Select<U>(selector: (item: T) => U, comparer?: ComparerType<U>): List<U> {
        return new List(this.m_items.map(selector), comparer);
    }

    public Distinct(): List<T> {
        const RESULT: T[] = [];

        // Try using Set for primitives
        if (this.m_items.every(item => typeof item === "string" || typeof item === "number" || typeof item === "boolean")) {
            const SEEN = new Set<T>();

            for (const item of this.m_items) {
                if (!SEEN.has(item)) {
                    SEEN.add(item);
                    RESULT.push(item);
                }
            }
        } else {
            // Fallback for objects or custom types using comparer
            for (const item of this.m_items) {
                if (!RESULT.some(x => this.m_comparer(x, item))) {
                    RESULT.push(item);
                }
            }
        }

        return new List(RESULT, this.m_comparer);
    }

    public Sort(comparer?: (a: T, b: T) => number): this {
        if (comparer) {
            this.m_items.sort(comparer);
        } else if (this.m_items.every(x => typeof x === "number")) {
            this.m_items.sort((a, b) => (a as unknown as number) - (b as unknown as number));
        } else if (this.m_items.every(x => typeof x === "string")) {
            this.m_items.sort((a, b) => String(a).localeCompare(String(b)));
        } else {
            throw new Error("Cannot sort items: provide a comparer for non-number/string types.");
        }

        return this;
    }

    public ForEach(callback: (item: T, index: number) => void): this {
        this.m_items.forEach(callback);

        return this;
    }

    public ToArray(): T[] {
        return [...this.m_items];
    }

    public Clone(): List<T> {
        return new List([...this.m_items], this.m_comparer);
    }
}

export default List;