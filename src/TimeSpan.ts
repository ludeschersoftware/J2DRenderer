class TimeSpan {
    private m_milliseconds: number;

    constructor(milliseconds: number = 0) {
        this.m_milliseconds = milliseconds;
    }

    public static FROM_SECONDS(seconds: number): TimeSpan {
        return new TimeSpan(seconds * 1000);
    }

    public static FROM_MINUTES(minutes: number): TimeSpan {
        return new TimeSpan(minutes * 60 * 1000);
    }

    public static FROM_HOURS(hours: number): TimeSpan {
        return new TimeSpan(hours * 60 * 60 * 1000);
    }

    public static FROM_DAYS(days: number): TimeSpan {
        return new TimeSpan(days * 24 * 60 * 60 * 1000);
    }

    public get TotalMilliseconds(): number {
        return this.m_milliseconds;
    }

    public get TotalSeconds(): number {
        return this.m_milliseconds / 1000;
    }

    public get TotalMinutes(): number {
        return this.m_milliseconds / (60 * 1000);
    }

    public get TotalHours(): number {
        return this.m_milliseconds / (60 * 60 * 1000);
    }

    public get TotalDays(): number {
        return this.m_milliseconds / (24 * 60 * 60 * 1000);
    }

    public Add(other: TimeSpan): TimeSpan {
        return new TimeSpan(this.m_milliseconds + other.m_milliseconds);
    }

    public Subtract(other: TimeSpan): TimeSpan {
        return new TimeSpan(this.m_milliseconds - other.m_milliseconds);
    }
}

export default TimeSpan;