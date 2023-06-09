import mysql2 from 'mysql2/promise';
import { DatabaseContext } from '@piggly/ddd-toolkit';
import TransactionContext from '@/core/contexts/TransactionContext';
import QueryContext from '@/core/contexts/QueryContext';
import { ContextType } from '@/types';

/**
 * @file MySQL Database Context for managing connection or pooling.
 * @copyright Piggly Lab 2023
 */
export default class MySQL extends DatabaseContext {
	/**
	 * Main connection.
	 *
	 * @type {Connection}
	 * @protected
	 * @memberof MySQL
	 * @since 1.0.0
	 * @author Caique Araujo <caique@piggly.com.br>
	 */
	protected _connection?: mysql2.Connection;

	/**
	 * Options for connection.
	 *
	 * @type {object}
	 * @protected
	 * @memberof MySQL
	 * @since 1.0.0
	 * @author Caique Araujo <caique@piggly.com.br>
	 */
	protected _options: mysql2.ConnectionOptions;

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
	constructor(options: mysql2.ConnectionOptions) {
		super();
		this._options = options;
	}

	/**
	 * Start a new connection or pool.
	 *
	 * @returns {Promise<void>}
	 * @public
	 * @async
	 * @throws {Error} If invalid type.
	 * @memberof MySQL
	 * @since 1.0.0
	 * @author Caique Araujo <caique@piggly.com.br>
	 */
	public async connect(): Promise<void> {
		if (this._connection) {
			return;
		}

		this._connection = await mysql2.createConnection(this._options);
	}

	/**
	 * Get the query context.
	 *
	 * @param {string} type transaction or query.
	 * @returns {(TransactionContext|QueryContext)}
	 * @public
	 * @throws {Error} If no connection is available.
	 * @memberof MySQL
	 * @since 1.0.0
	 * @author Caique Araujo <caique@piggly.com.br>
	 */
	public context(type: 'transaction'): TransactionContext;
	public context(type: 'query'): QueryContext;
	public context(type: ContextType): TransactionContext | QueryContext {
		if (this._connection === undefined) {
			throw new Error('No connection');
		}

		switch (type) {
			case 'transaction':
				return new TransactionContext(this._connection);
			case 'query':
				return new QueryContext(this._connection);
			default:
				throw new Error('Invalid context type');
		}
	}

	/**
	 * Close the connection or pool.
	 *
	 * @returns {Promise<void>}
	 * @public
	 * @async
	 * @memberof MySQL
	 * @since 1.0.0
	 * @author Caique Araujo <caique@piggly.com.br>
	 */
	public async close(): Promise<void> {
		if (!this._connection) {
			return;
		}

		await this._connection.end();
		this._connection = undefined;
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
		if (!this._connection) {
			return;
		}

		this._connection.destroy();
		this._connection = undefined;
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
		return !!this._connection;
	}
}
