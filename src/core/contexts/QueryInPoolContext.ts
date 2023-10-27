import { QueryContextInterface, QueryPlaceholder, QueryResponse } from '@/types';
import mysql2 from 'mysql2/promise';
import type PoolingMySQL from '@/core/PoolingMySQL';

/**
 * @file Query context to execute SQL instructions.
 * @copyright Piggly Lab 2023
 */
export default class QueryInPoolContext implements QueryContextInterface {
	/**
	 * Main pool.
	 *
	 * @type {PoolingMySQL}
	 * @protected
	 * @memberof QueryContext
	 * @since 1.0.0
	 * @author Caique Araujo <caique@piggly.com.br>
	 */
	protected _pool: PoolingMySQL;

	/**
	 * Create context.
	 *
	 * @param {PoolingMySQL} pool
	 * @public
	 * @constructor
	 * @memberof MySQL
	 * @since 1.0.0
	 * @author Caique Araujo <caique@piggly.com.br>
	 */
	constructor(pool: PoolingMySQL) {
		this._pool = pool;
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
			this._pool
				.connect()
				.then(connection => {
					connection
						.execute<any>(sql, values)
						.then(([rows]) => {
							if (Array.isArray(rows) === false) {
								resolve([rows] as T);
								return;
							}

							resolve(rows as T);
						})
						.catch(error => {
							reject(error);
						})
						.finally(() => {
							if (connection) connection.release();
						});
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
	): Promise<T> {
		return new Promise<T>((resolve, reject) => {
			this._pool
				.connect()
				.then(connection => {
					connection
						.execute<any>(options, values)
						.then(([rows]) => {
							if (Array.isArray(rows) === false) {
								resolve([rows] as T);
								return;
							}

							resolve(rows as T);
						})
						.catch(error => {
							reject(error);
						})
						.finally(() => {
							if (connection) connection.release();
						});
				})
				.catch(error => {
					reject(error);
				});
		});
	}
}
