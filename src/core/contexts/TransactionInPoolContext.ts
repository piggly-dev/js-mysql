import mysql2 from 'mysql2/promise';
import {
	QueryPlaceholder,
	QueryResponse,
	TransactionContextInterface,
} from '@/types';
import type PoolingMySQL from '@/core/PoolingMySQL';

/**
 * @file Transaction context to execute SQL instructions.
 * @copyright Piggly Lab 2023
 */
export default class TransactionInPoolContext
	implements TransactionContextInterface
{
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
	 * Transaction connection.
	 *
	 * @type {mysql2.PoolConnection|undefined}
	 * @protected
	 * @memberof TransactionContext
	 * @since 1.0.0
	 * @author Caique Araujo <caique@piggly.com.br>
	 */
	protected _connection?: mysql2.PoolConnection = undefined;

	/**
	 * Begin a transaction.
	 *
	 * @returns {Promise<void>}
	 * @public
	 * @async
	 * @memberof TransactionContext
	 * @since 1.0.0
	 * @author Caique Araujo <caique@piggly.com.br>
	 */
	public async begin(): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			this._pool.connect().then(connection => {
				this._connection = connection;

				connection
					.beginTransaction()
					.then(() => {
						this._connection = connection;
						resolve();
					})
					.catch(error => {
						this.rollback()
							.then(() => {
								reject(error);
							})
							.catch(() => {
								this._connection = undefined;
								reject(error);
							});
					});
			});
		});
	}

	/**
	 * Commit a transaction.
	 *
	 * @returns {Promise<void>}
	 * @public
	 * @async
	 * @memberof TransactionContext
	 * @since 1.0.0
	 * @author Caique Araujo <caique@piggly.com.br>
	 */
	public async commit(): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			if (this._connection === undefined) {
				reject(
					new Error(
						'No transaction started, you must use begin() method before commit().'
					)
				);
				return;
			}

			this._connection
				.commit()
				.then(() => {
					resolve();
				})
				.catch(error => {
					reject(error);
				})
				.finally(() => {
					this._connection?.release();
					this._connection = undefined;
				});
		});
	}

	/**
	 * Rollback a transaction.
	 *
	 * @returns {Promise<void>}
	 * @public
	 * @async
	 * @memberof TransactionContext
	 * @since 1.0.0
	 * @author Caique Araujo <caique@piggly.com.br>
	 */
	public async rollback(): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			if (this._connection === undefined) {
				reject(
					new Error(
						'No transaction started, you must use begin() method before rollback().'
					)
				);
				return;
			}

			this._connection
				.rollback()
				.then(() => {
					resolve();
				})
				.catch(error => {
					reject(error);
				})
				.finally(() => {
					this._connection?.release();
					this._connection = undefined;
				});
		});
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
			if (this._connection === undefined) {
				reject(
					new Error(
						'No transaction started, you must use begin() method before query().'
					)
				);
				return;
			}

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
	): Promise<T> {
		return new Promise<T>((resolve, reject) => {
			if (this._connection === undefined) {
				reject(
					new Error(
						'No transaction started, you must use begin() method before queryWithOptions().'
					)
				);
				return;
			}

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
