import TimeSpan from "./TimeSpan";

class RenderTime {
    public TotalGameTime: TimeSpan;
    public ElapsedGameTime: TimeSpan;
    public IsRunningSlowly: boolean;

    public constructor();
    public constructor(totalGameTime: TimeSpan, elapsedGameTime: TimeSpan);
    public constructor(totalRealTime: TimeSpan, elapsedRealTime: TimeSpan, isRunningSlowly: boolean);

    public constructor(...args: Array<any>) {
        if (args.length === 0) {
            this.TotalGameTime = new TimeSpan(0);
            this.ElapsedGameTime = new TimeSpan(0);
            this.IsRunningSlowly = false;
        } else if (args.length === 2) {
            this.TotalGameTime = args[0];
            this.ElapsedGameTime = args[1];
            this.IsRunningSlowly = false;
        } else if (args.length === 3) {
            this.TotalGameTime = args[0];
            this.ElapsedGameTime = args[1];
            this.IsRunningSlowly = args[2];
        } else {
            throw new Error("Invalid constructor arguments for RenderTime");
        }
    }
}

export default RenderTime;