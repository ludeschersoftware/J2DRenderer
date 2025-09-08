type ComparerType<T> = (a: T, b: T) => boolean;
type ItemCallbackType<T> = (item: T) => boolean;

class List<T> {
    private m_items: T[];
    private m_comparer: ComparerType<T>;

    constructor(collection?: T[], comparer?: ComparerType<T>) {
        this.m_items = collection ? [...collection] : [];
        this.m_comparer = comparer ?? ((a, b) => a === b);
    }

    public get Count(): number {
        return this.m_items.length;
    }

    public *Items(): Generator<T> {
        yield* this.m_items;
    }

    public Add(item: T): this {
        this.m_items.push(item);

        return this;
    }

    public AddRange(collection: T[]): this {
        this.m_items.push(...collection);

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

    public RemoveAt(index: number): this {
        if ((index < 0) || (index >= this.m_items.length)) {
            throw new RangeError("Index out of range.");
        }

        this.m_items.splice(index, 1);

        return this;
    }

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

    public Clear(): this {
        this.m_items = [];

        return this;
    }

    public Sort(comparer?: (a: T, b: T) => number): this {
        this.m_items.sort(comparer);

        return this;
    }

    public ToArray(): T[] {
        return [...this.m_items];
    }

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

    public Clone(): List<T> {
        return new List([...this.m_items], this.m_comparer);
    }

    public IsEmpty(): boolean {
        return this.Count === 0;
    }

    public [Symbol.iterator](): Iterator<T> {
        return this.Items();
    }

    public Where(callback: ItemCallbackType<T>): List<T> {
        return new List(this.m_items.filter(callback), this.m_comparer);
    }

    public Select<U>(selector: (item: T) => U): List<U> {
        return new List(this.m_items.map(selector));
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
}

export default List;