// Type declarations for Redux libraries
declare module 'react-redux' {
  import type { ComponentType, Context } from 'react';
  import type { Store, Action, AnyAction, Dispatch } from 'redux';

  export interface DispatchProp<A extends Action = AnyAction> {
    dispatch: Dispatch<A>;
  }

  export type ProviderProps<A extends Action = AnyAction> = {
    store: Store<any, A>;
    context?: Context<ReactReduxContextValue>;
    children: React.ReactNode;
  };

  export function Provider<A extends Action = AnyAction>(props: ProviderProps<A>): JSX.Element;

  export type ReactReduxContextValue = {
    store: Store<any, any>;
    storeState: any;
  };

  export function createDispatchHook<S = any, A extends Action = AnyAction>(
    context?: Context<ReactReduxContextValue>
  ): () => Dispatch<A>;

  export function createSelectorHook<TState = any, TSelected = any>(
    context?: Context<ReactReduxContextValue>
  ): <Selected extends TSelected>(
    selector: (state: TState) => Selected,
    equalityFn?: (a: Selected, b: Selected) => boolean
  ) => Selected;

  export function useDispatch<AppDispatch = Dispatch<any>>(): AppDispatch;
  export function useSelector<TState = any, TSelected = any>(
    selector: (state: TState) => TSelected,
    equalityFn?: (left: TSelected, right: TSelected) => boolean
  ): TSelected;

  export type TypedUseSelectorHook<TState> = <TSelected>(
    selector: (state: TState) => TSelected,
    equalityFn?: (left: TSelected, right: TSelected) => boolean
  ) => TSelected;
}

declare module '@reduxjs/toolkit' {
  import { Action, AnyAction, Middleware, Reducer, Store, StoreEnhancer } from 'redux';
  
  export interface PayloadAction<P = void, T extends string = string, M = never, E = never>
    extends Action<T> {
    payload: P;
    meta: M;
    error: E;
  }
  
  export function createAction<P = void, T extends string = string>(
    type: T
  ): {
    (...args: P extends void ? [] : [payload: P]): PayloadAction<P, T>;
    type: T;
  };
  
  export interface ActionReducerMapBuilder<State> {
    addCase<ActionCreator extends ActionCreatorWithPreparedPayload<any, any, any, any> | ActionCreatorWithoutPayload<any>>(
      actionCreator: ActionCreator,
      reducer: (state: Draft<State>, action: ReturnType<ActionCreator>) => State | void
    ): ActionReducerMapBuilder<State>;
    addMatcher<A extends AnyAction>(
      matcher: (action: AnyAction) => action is A,
      reducer: (state: Draft<State>, action: A) => State | void
    ): ActionReducerMapBuilder<State>;
    addDefaultCase(
      reducer: (state: Draft<State>, action: AnyAction) => State | void
    ): ActionReducerMapBuilder<State>;
  }

  export interface SliceCaseReducers<State> {
    [key: string]: (state: State, action: PayloadAction<any>) => State | void;
  }

  export interface CreateSliceOptions<
    State = any,
    CR extends SliceCaseReducers<State> = SliceCaseReducers<State>,
    Name extends string = string
  > {
    name: Name;
    initialState: State;
    reducers: CR;
    extraReducers?: ((builder: ActionReducerMapBuilder<State>) => void) | Record<string, any>;
  }

  export function createSlice<State, CaseReducers extends SliceCaseReducers<State>, Name extends string = string>(
    options: CreateSliceOptions<State, CaseReducers, Name>
  ): Slice<State, CaseReducers, Name>;

  export interface Slice<State = any, CaseReducers extends SliceCaseReducers<State> = any, Name extends string = string> {
    name: Name;
    reducer: Reducer<State>;
    actions: { [K in keyof CaseReducers]: PayloadActionCreator };
    caseReducers: CaseReducers;
    getInitialState: () => State;
  }

  export interface PayloadActionCreator<P = any, T extends string = string> {
    (...args: any[]): PayloadAction<P, T>;
    type: T;
  }

  export interface ActionCreatorWithoutPayload<T extends string = string> {
    (): PayloadAction<undefined, T>;
    type: T;
  }

  export interface ActionCreatorWithPreparedPayload<Args extends any[], P, T extends string = string, M = never, E = never> {
    (...args: Args): PayloadAction<P, T, M, E>;
    type: T;
  }

  export function configureStore<S = any, A extends Action = AnyAction>(options: {
    reducer: Reducer<S, A> | { [K in keyof S]: Reducer<S[K], A> };
    middleware?: ((getDefaultMiddleware: any) => Middleware<{}, S>[]) | Middleware<{}, S>[];
    devTools?: boolean | DevToolsOptions;
    preloadedState?: DeepPartial<S>;
    enhancers?: StoreEnhancer[] | ((defaultEnhancers: StoreEnhancer[]) => StoreEnhancer[]);
  }): Store<S, A>;

  export interface DevToolsOptions {
    name?: string;
    actionCreators?: ActionCreator<any>[] | { [key: string]: ActionCreator<any> };
    latency?: number;
    maxAge?: number;
    serialize?: boolean | SerializeOptions;
    trace?: boolean | TracingOptions;
    traceLimit?: number;
    shouldCatchErrors?: boolean;
    shouldHotReload?: boolean;
    shouldRecordChanges?: boolean;
    pauseActionType?: string;
    autoPause?: boolean;
    shouldStartLocked?: boolean;
    predicate?: (state: any, action: any) => boolean;
    actionSanitizer?: (action: any, id: number) => any;
    stateSanitizer?: (state: any, index: number) => any;
    actionsBlacklist?: string | string[];
    actionsWhitelist?: string | string[];
    actionsDenylist?: string | string[];
    actionsAllowlist?: string | string[];
    predicate?: (state: any, action: any) => boolean;
    shouldRecordChanges?: boolean;
    pauseActionType?: string;
    lock?: boolean;
    disabled?: boolean;
  }

  export interface SerializeOptions {
    options?: boolean | { date?: boolean; regex?: boolean; undefined?: boolean; error?: boolean; symbol?: boolean; map?: boolean; set?: boolean; function?: boolean | Function };
    replacer?: (key: string, value: any) => any;
    reviver?: (key: string, value: any) => any;
    immutable?: any;
    refs?: any[];
  }

  export interface TracingOptions {
    ignore?: string[];
  }

  export type ActionCreator<P> = (...args: any[]) => { type: string; payload?: P };
  
  export type Draft<T> = T;
  
  export type DeepPartial<T> = T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;

  export function createAsyncThunk<Returned, ThunkArg = void, ThunkApiConfig = {}>(
    typePrefix: string,
    payloadCreator: (
      arg: ThunkArg,
      thunkAPI: ThunkAPI<ThunkApiConfig>
    ) => Promise<Returned> | Returned,
    options?: AsyncThunkOptions<ThunkArg, ThunkApiConfig>
  ): AsyncThunk<Returned, ThunkArg, ThunkApiConfig>;

  export interface AsyncThunk<Returned, ThunkArg, ThunkApiConfig> {
    (arg: ThunkArg): AsyncThunkAction<Returned, ThunkArg, ThunkApiConfig>;
    pending: ActionCreatorWithPreparedPayload<[string, ThunkArg?], undefined, string, never, never>;
    rejected: ActionCreatorWithPreparedPayload<[Error | null, string, ThunkArg?], any, string, SerializedError, never>;
    fulfilled: ActionCreatorWithPreparedPayload<[Returned, string, ThunkArg?], Returned, string, never, never>;
    typePrefix: string;
  }

  export interface AsyncThunkAction<Returned, ThunkArg, ThunkApiConfig> extends Action {
    payload: ThunkArg;
    meta: {
      requestId: string;
      arg: ThunkArg;
    };
  }

  export interface SerializedError {
    name?: string;
    message?: string;
    stack?: string;
    code?: string;
  }

  export interface ThunkAPI<ThunkApiConfig> {
    dispatch: ThunkApiConfig extends { dispatch: infer Dispatch } ? Dispatch : Dispatch<any>;
    getState: ThunkApiConfig extends { state: infer State } ? () => State : () => any;
    extra: ThunkApiConfig extends { extra: infer Extra } ? Extra : any;
    requestId: string;
    signal: AbortSignal;
    rejectWithValue: <Rejected>(value: Rejected) => RejectWithValue<Rejected>;
    fulfillWithValue: <Fulfilled>(value: Fulfilled) => FulfillWithValue<Fulfilled>;
  }

  export interface RejectWithValue<Rejected> {
    readonly _type: 'RejectWithValue';
    readonly payload: Rejected;
  }

  export interface FulfillWithValue<Fulfilled> {
    readonly _type: 'FulfillWithValue';
    readonly payload: Fulfilled;
  }

  export interface AsyncThunkOptions<ThunkArg, ThunkApiConfig> {
    condition?: (arg: ThunkArg, api: Pick<ThunkAPI<ThunkApiConfig>, 'getState' | 'extra'>) => boolean | undefined;
    dispatchConditionRejection?: boolean;
    serializeError?: (err: unknown) => SerializedError;
    idGenerator?: (thunkAPI: Pick<ThunkAPI<ThunkApiConfig>, never>) => string;
  }
}
