import mysql2 from 'mysql2/promise';

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

export interface QueryContextInterface {
	query<T extends QueryResponse<any>>(
		sql: string,
		values?: QueryPlaceholder
	): Promise<T>;
	queryWithOptions<T extends QueryResponse<any>>(
		options: mysql2.QueryOptions,
		values?: QueryPlaceholder
	): Promise<T>;
}

export interface TransactionContextInterface extends QueryContextInterface {
	begin(): Promise<void>;
	commit(): Promise<void>;
	rollback(): Promise<void>;
}

export type MySQLContext = QueryContextInterface | TransactionContextInterface;
