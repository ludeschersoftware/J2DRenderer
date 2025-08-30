import LogType from "./Enum/LogType";
import TLoggerCallback from "./Types/TLoggerCallback";

class Logger {
    private m_callback: TLoggerCallback | undefined;

    public constructor(callback?: TLoggerCallback) {
        this.m_callback = callback;
    }

    public log<T>(message: T): void {
        if (this.m_callback === undefined) {
            console.log(message);
            return;
        }

        this.m_callback(LogType.Default, message);
    }

    public warn<T>(message: T): void {
        if (this.m_callback === undefined) {
            console.warn(message);
            return;
        }

        this.m_callback(LogType.Warning, message);
    }

    public error<T>(message: T): void {
        if (this.m_callback === undefined) {
            console.error(message);
            return;
        }

        this.m_callback(LogType.Error, message);
    }
}

export default Logger;