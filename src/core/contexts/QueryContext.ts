import { QueryPlaceholder, QueryResponse } from '@/types';
import mysql2 from 'mysql2/promise';

/**
 * @file Query context to execute SQL instructions.
 * @copyright Piggly Lab 2023
 */
export default class QueryContext<Connection extends mysql2.Connection> {
	/**
	 * Main connection.
	 *
	 * @type {Connection}
	 * @protected
	 * @memberof QueryContext
	 * @since 1.0.0
	 * @author Caique Araujo <caique@piggly.com.br>
	 */
	protected _connection: Connection;

	/**
	 * Create context.
	 *
	 * @param {Connection} connection
	 * @public
	 * @constructor
	 * @memberof MySQL
	 * @since 1.0.0
	 * @author Caique Araujo <caique@piggly.com.br>
	 */
	constructor(connection: Connection) {
		this._connection = connection;
	}

	/**
	 * Execute a query.
	 *
	 * @param {string} sql
	 * @param {QueryPlaceholder} [values]
	 * @returns {Promise<T>}
	 * @public
	 * @async
	 * @memberof QueryContext
	 * @since 1.0.0
	 * @author Caique Araujo <caique@piggly.com.br>
	 */
	public async query<T extends QueryResponse<any>>(
		sql: string,
		values?: QueryPlaceholder
	): Promise<T> {
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

	/**
	 * Execute a query with options.
	 *
	 * @param {mysql2.QueryOptions} options
	 * @param {QueryPlaceholder} [values]
	 * @returns {Promise<T>}
	 * @public
	 * @async
	 * @memberof QueryContext
	 * @since 1.0.0
	 * @author Caique Araujo <caique@piggly.com.br>
	 */
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
