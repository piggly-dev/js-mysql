import mysql2 from 'mysql2/promise';
import { DatabaseContext } from '@piggly/ddd-toolkit';
import TransactionContext from '@/core/contexts/TransactionContext';
import QueryContext from '@/core/contexts/QueryContext';
import { ConnectionType, ContextType } from '@/types';

/**
 * @file MySQL Database Context for managing connection or pooling.
 * @copyright Piggly Lab 2023
 */
export default class MySQL<
	Connection extends mysql2.Connection,
	Options extends mysql2.ConnectionOptions
> extends DatabaseContext {
	/**
	 * Main connection.
	 *
	 * @type {Connection}
	 * @protected
	 * @memberof MySQL
	 * @since 1.0.0
	 * @author Caique Araujo <caique@piggly.com.br>
	 */
	protected _connection?: Connection;

	/**
	 * Options for connection.
	 *
	 * @type {object}
	 * @protected
	 * @memberof MySQL
	 * @since 1.0.0
	 * @author Caique Araujo <caique@piggly.com.br>
	 */
	protected _options: Options;

	/**
	 * Connection type.
	 *
	 * - connection (default)
	 * - pool
	 *
	 * @type {Options}
	 * @protected
	 * @memberof MySQL
	 * @since 1.0.0
	 * @author Caique Araujo <caique@piggly.com.br>
	 */
	protected _type: ConnectionType;

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
	constructor(options: Options) {
		super();
		this._options = options;
		this._type = 'connection';
	}

	/**
	 * Start a new connection or pool.
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
	public async connect(type: ConnectionType = 'connection'): Promise<void> {
		if (this._connection) {
			return;
		}

		switch (type) {
			case 'connection':
				this._connection = (await mysql2.createConnection(
					this._options
				)) as Connection;
				break;
			case 'pool':
				this._connection = mysql2.createPool(
					this._options
				) as unknown as Connection;
				break;
			default:
				throw new Error('Invalid connection type');
		}

		this._type = type;
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
	public context(type: 'transaction'): TransactionContext<Connection>;
	public context(type: 'query'): QueryContext<Connection>;
	public context(
		type: ContextType
	): TransactionContext<Connection> | QueryContext<Connection> {
		if (this._connection === undefined) {
			throw new Error('No connection');
		}

		switch (type) {
			case 'transaction':
				return new TransactionContext<Connection>(this._connection);
			case 'query':
				return new QueryContext<Connection>(this._connection);
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

		if (this._type === 'pool') {
			await this.close();
			return;
		}

		this._connection.destroy();
		this._connection = undefined;
	}

	/**
	 * Get connection type.
	 *
	 * @returns {string}
	 * @public
	 * @memberof MySQL
	 * @since 1.0.0
	 * @author Caique Araujo <caique@piggly.com.br>
	 */
	public get type(): ConnectionType {
		return this._type;
	}

	/**
	 * Get connection.
	 *
	 * @returns {(Connection|undefined)}
	 * @public
	 * @memberof MySQL
	 * @since 1.0.0
	 * @author Caique Araujo <caique@piggly.com.br>
	 */
	public get raw(): Connection | undefined {
		return this._connection;
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
