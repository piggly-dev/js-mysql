import mysql2 from 'mysql2/promise';
import { DatabaseContext } from '@piggly/ddd-toolkit';
import TransactionContext from '@/core/contexts/TransactionContext';
import QueryContext from '@/core/contexts/QueryContext';
import { ConnectionType, ContextType } from '@/types';

export default class MySQL<
	Connection extends mysql2.Connection,
	Options extends mysql2.ConnectionOptions
> extends DatabaseContext {
	protected _connection?: Connection;

	protected _options: Options;

	protected _type: ConnectionType;

	constructor(options: Options) {
		super();
		this._options = options;
		this._type = 'connection';
	}

	public async connect(type: ConnectionType = 'connection') {
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

	public async close() {
		if (!this._connection) {
			return;
		}

		await this._connection.end();
		this._connection = undefined;
	}

	public async quit() {
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

	public get type(): ConnectionType {
		return this._type;
	}

	public get raw(): Connection | undefined {
		return this._connection;
	}

	public isActive(): boolean {
		return !!this._connection;
	}
}
