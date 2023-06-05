import { QueryPlaceholder, QueryResponse } from '@/types';
import mysql2 from 'mysql2/promise';

export default class QueryContext<Connection extends mysql2.Connection> {
	protected _connection: Connection;

	constructor(connection: Connection) {
		this._connection = connection;
	}

	public async query<T extends QueryResponse<any>>(
		sql: string,
		values?: QueryPlaceholder
	) {
		return new Promise<T>((resolve, reject) => {
			this._connection
				.execute<any>(sql, values)
				.then(([rows]) => {
					if (Array.isArray(rows) === false) {
						resolve([rows] as T);
						return;
					}

					resolve(rows);
				})
				.catch(error => {
					reject(error);
				});
		});
	}

	public async queryWithOptions<T extends QueryResponse<any>>(
		options: mysql2.QueryOptions,
		values?: QueryPlaceholder
	) {
		return new Promise<T>((resolve, reject) => {
			this._connection
				.execute<any>(options, values)
				.then(([rows]) => {
					if (Array.isArray(rows) === false) {
						resolve([rows] as T);
						return;
					}

					resolve(rows);
				})
				.catch(error => {
					reject(error);
				});
		});
	}
}
