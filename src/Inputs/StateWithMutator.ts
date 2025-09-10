class StateWithMutator<TState, TMutator> {
    private readonly m_state: TState & TMutator;
    private readonly m_mutatorSymbol: symbol;

    constructor(state: TState & TMutator, mutatorSymbol: symbol) {
        this.m_state = state;
        this.m_mutatorSymbol = mutatorSymbol;
    }

    public get public(): TState {
        return this.m_state;
    }

    public getMutator(symbol: symbol): TMutator | undefined {
        return symbol === this.m_mutatorSymbol ? this.m_state : undefined;
    }
}

export default StateWithMutator;