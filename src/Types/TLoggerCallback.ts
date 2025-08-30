import LogType from "../Enum/LogType";

type TLoggerCallback = (type: LogType, message: any) => void;

export default TLoggerCallback;