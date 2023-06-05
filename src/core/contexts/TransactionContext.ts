import mysql2 from 'mysql2/promise';
import QueryContext from './QueryContext';

export default class TransactionContext<
	Connection extends mysql2.Connection
> extends QueryContext<Connection> {
	public async begin() {
		return new Promise<void>((resolve, reject) => {
			this._connection
				.beginTransaction()
				.then(() => {
					resolve();
				})
				.catch(error => {
					reject(error);
				});
		});
	}

	public async commit() {
		return new Promise<void>((resolve, reject) => {
			this._connection
				.commit()
				.then(() => {
					resolve();
				})
				.catch(error => {
					reject(error);
				});
		});
	}

	public async rollback() {
		return new Promise<void>((resolve, reject) => {
			this._connection
				.rollback()
				.then(() => {
					resolve();
				})
				.catch(error => {
					reject(error);
				});
		});
	}
}
