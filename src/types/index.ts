export type ContextType = 'transaction' | 'query';

export type ConnectionType = 'pool' | 'connection';

export type QueryPlaceholder = any | any[] | { [param: string]: any };

export type WritableQueryResponse = QueryResponse<{
	fieldCount: number;
	affectedRows: number;
	changedRows?: number;
	insertId: number;
	info: string;
	serverStatus: number;
	warningStatus: number;
	warningCount?: number;
}>;

export type SelectableQueryResponse<T> = QueryResponse<T>;

export type QueryResponse<T> = T[];

export interface QueryError extends Error {
	code: string;
	errno: number;
	sqlMessage: string;
	sqlState: string;
	sql: string;
}
