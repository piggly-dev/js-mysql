import mysql2 from 'mysql2/promise';
import { DatabaseContext } from '@piggly/ddd-toolkit';
import { ContextType } from '@/types';
import TransactionInPoolContext from './contexts/TransactionInPoolContext';
import QueryInPoolContext from './contexts/QueryInPoolContext';

/**
 * @file MySQL Database Context for managing connection or pooling.
 * @copyright Piggly Lab 2023
 */
export default class PoolingMySQL extends DatabaseContext {
	/**
	 * Pool.
	 *
	 * @type {Connection}
	 * @protected
	 * @memberof MySQL
	 * @since 1.0.0
	 * @author Caique Araujo <caique@piggly.com.br>
	 */
	protected _pool?: mysql2.Pool;

	/**
	 * Options for connection.
	 *
	 * @type {object}
	 * @protected
	 * @memberof MySQL
	 * @since 1.0.0
	 * @author Caique Araujo <caique@piggly.com.br>
	 */
	protected _options: mysql2.PoolOptions;

	/**
	 * Create a new MySQL Database Context.
	 *
	 * @param {object} options
	 * @public
	 * @constructor
	 * @memberof MySQL
	 * @since 1.0.0
	 * @author Caique Araujo <caique@piggly.com.br>
	 */
	constructor(options: mysql2.PoolOptions) {
		super();
		this._options = options;
	}

	/**
	 * Start a pool.
	 *
	 * @param {string} type connection or pool.
	 * @returns {Promise<void>}
	 * @public
	 * @async
	 * @throws {Error} If invalid type.
	 * @memberof MySQL
	 * @since 1.0.0
	 * @author Caique Araujo <caique@piggly.com.br>
	 */
	public async start(): Promise<void> {
		if (this._pool) {
			return;
		}

		this._pool = mysql2.createPool(this._options);
	}

	/**
	 * Open a new connection for pooling.
	 *
	 * @returns {Promise<mysql2.PoolConnection>}
	 * @public
	 * @async
	 * @throws {Error} If invalid type.
	 * @memberof MySQL
	 * @since 1.0.0
	 * @author Caique Araujo <caique@piggly.com.br>
	 */
	public async connect(): Promise<mysql2.PoolConnection> {
		if (this._pool === undefined) {
			throw new Error('You must start the pool first.');
		}

		return new Promise<mysql2.PoolConnection>((res, rej) => {
			this._pool
				?.getConnection()
				.then(connection => {
					res(connection);
				})
				.catch(error => {
					rej(error);
				});
		});
	}

	/**
	 * Get the query context.
	 *
	 * @param {string} type transaction or query.
	 * @returns {(TransactionInPoolContext|QueryInPoolContext)}
	 * @public
	 * @throws {Error} If no connection is available.
	 * @memberof MySQL
	 * @since 1.0.0
	 * @author Caique Araujo <caique@piggly.com.br>
	 */
	public context(type: 'transaction'): TransactionInPoolContext;
	public context(type: 'query'): QueryInPoolContext;
	public context(type: ContextType): TransactionInPoolContext | QueryInPoolContext {
		switch (type) {
			case 'transaction':
				return new TransactionInPoolContext(this);
			case 'query':
				return new QueryInPoolContext(this);
			default:
				throw new Error('Invalid context type');
		}
	}

	/**
	 * Close the pool.
	 *
	 * @returns {Promise<void>}
	 * @public
	 * @async
	 * @memberof MySQL
	 * @since 1.0.0
	 * @author Caique Araujo <caique@piggly.com.br>
	 */
	public async close(): Promise<void> {
		if (this._pool) {
			await this._pool.end();
			this._pool = undefined;
		}
	}

	/**
	 * Fully terminate the connection or pool.
	 *
	 * @returns {Promise<void>}
	 * @public
	 * @async
	 * @memberof MySQL
	 * @since 1.0.0
	 * @author Caique Araujo <caique@piggly.com.br>
	 */
	public async quit(): Promise<void> {
		if (this._pool) {
			await this._pool.end();
			this._pool.destroy();
			this._pool = undefined;
		}
	}

	/**
	 * Check if connection is active.
	 *
	 * @returns {boolean}
	 * @public
	 * @memberof MySQL
	 * @since 1.0.0
	 * @author Caique Araujo <caique@piggly.com.br>
	 */
	public isActive(): boolean {
		return !!this._pool;
	}
}
