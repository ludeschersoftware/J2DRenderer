class List<T> {
    private m_index: number;
    private m_data: Map<number, T>;
    private m_lookup: Map<T, number>;
    // private m_data_key_lookup: Map<number, number>;

    public constructor(items?: T[]) {
        this.m_index = 0;
        this.m_data = new Map();
        this.m_lookup = new Map();

        if (items) {
            for (const item of items) {
                this.Add(item);
            }
        }
    }

    public get Count(): number {
        return this.m_data.size;
    }

    public *Items(): Generator<T> {
        for (const item of this.m_data.values()) {
            yield item;
        }
    }

    public Add(item: T): typeof this {
        this.m_data.set(this.m_index, item);
        this.m_lookup.set(item, this.m_index++);

        return this;
    }

    public AddRange(...collection: T[]): typeof this {
        for (const item of collection) {
            this.Add(item);
        }

        return this;
    }

    public Insert(index: number, item: T): typeof this {
        const EXISTING: T | undefined = this.m_data.get(index);

        if (EXISTING !== undefined) {
            this.m_lookup.delete(EXISTING);
        }

        this.m_data.set(index, item);
        this.m_lookup.set(item, index);

        if (index >= this.m_index) {
            this.m_index = index + 1;
        }

        return this;
    }

    public Remove(item: T): boolean {
        const INDEX: number | undefined = this.m_lookup.get(item);

        if (INDEX === undefined) {
            return false;
        }

        this.m_lookup.delete(item);

        return this.m_data.delete(INDEX);
    }

    public RemoveAt(index: number): boolean {
        const ITEM: T | undefined = this.m_data.get(index);

        if (ITEM !== undefined) {
            this.m_lookup.delete(ITEM);
        }

        return this.m_data.delete(index);
    }

    public Clear(): typeof this {
        this.m_data.clear();
        this.m_lookup.clear();
        this.m_index = 0;

        return this;
    }

    public Contains(item: T): boolean {
        return this.m_lookup.has(item);
    }

    public IndexOf(item: T): number {
        return this.m_lookup.get(item) ?? -1;
    }

    public Sort(callback?: (a: T, b: T) => number): typeof this {
        const TEMP = this.ToArray().sort(callback);

        this.Clear();

        for (const item of TEMP) {
            this.Add(item);
        }

        return this;
    }

    public Reverse(): typeof this {
        const TEMP = this.ToArray().reverse();

        this.Clear();

        for (const item of TEMP) {
            this.Add(item);
        }

        return this;
    }

    public ToArray(): T[] {
        return Array.from(this.m_data.values());
    }

    public Find(callback: (item: T) => boolean): T | undefined {
        for (const item of this.m_data.values()) {
            if (callback(item)) {
                return item;
            }
        }

        return undefined;
    }

    public Filter(callback: (item: T) => boolean): List<T> {
        const RESULT: List<T> = new List<T>();

        for (const item of this.m_data.values()) {
            if (callback(item)) {
                RESULT.Add(item);
            }
        }

        return RESULT;
    }

    public Map<U>(callback: (item: T) => U): List<U> {
        const RESULT: List<U> = new List<U>();

        for (const item of this.m_data.values()) {
            RESULT.Add(callback(item));
        }

        return RESULT;
    }

    public Clone(): List<T> {
        return new List<T>(this.ToArray());
    }

    public First(): T | undefined {
        for (const item of this.m_data.values()) {
            return item;
        }

        return undefined;
    }

    public Last(): T | undefined {
        const VALUES: T[] = Array.from(this.m_data.values());

        return VALUES.length > 0 ? VALUES[VALUES.length - 1] : undefined;
    }

    public Any(callback?: (item: T) => boolean): boolean {
        if (!callback) {
            return this.Count > 0;
        }

        for (const item of this.m_data.values()) {
            if (callback(item)) {
                return true;
            }
        }

        return false;
    }

    public All(callback: (item: T) => boolean): boolean {
        for (const item of this.m_data.values()) {
            if (!callback(item)) {
                return false;
            }
        }

        return true;
    }

    public Distinct(): List<T> {
        const SEEN = new Set<T>();
        const RESULT = new List<T>();

        for (const item of this.m_data.values()) {
            if (!SEEN.has(item)) {
                SEEN.add(item);
                RESULT.Add(item);
            }
        }

        return RESULT;
    }

    public ToJSON(): string {
        return JSON.stringify(this.ToArray());
    }

    public static FromJSON<U>(json: string, parser?: (raw: any) => U): List<U> {
        const RAW: any = JSON.parse(json);
        const ITEMS: U[] = parser ? RAW.map(parser) : RAW;

        return new List<U>(ITEMS);
    }

    public ForEach(callback: (item: T, index: number) => void): typeof this {
        for (const [index, item] of this.m_data.entries()) {
            callback(item, index);
        }

        return this;
    }

    public IsEmpty(): boolean {
        return this.Count === 0;
    }

    public [Symbol.iterator](): Iterator<T> {
        return this.Items();
    }
}

export default List;