export type ContextType = 'transaction' | 'query';

export type ConnectionType = 'pool' | 'connection';

export type QueryPlaceholder = any | any[] | { [param: string]: any };

export type WritableQueryResponse = QueryResponse<{
	fieldCount: number;
	affectedRows: number;
	changedRows: number;
	insertId: number;
	serverStatus: number;
	warningCount: number;
	message: string;
	procotol41: boolean;
}>;

export type SelectableQueryResponse<T> = QueryResponse<T>;

export type QueryResponse<T> = T[];
