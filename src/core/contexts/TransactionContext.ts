import mysql2 from 'mysql2/promise';
import QueryContext from './QueryContext';

/**
 * @file Transaction context to execute SQL instructions.
 * @copyright Piggly Lab 2023
 */
export default class TransactionContext<
	Connection extends mysql2.Connection
> extends QueryContext<Connection> {
	/**
	 * Transaction state.
	 *
	 * @type {boolean}
	 * @protected
	 * @memberof TransactionContext
	 * @since 1.0.0
	 * @author Caique Araujo <caique@piggly.com.br>
	 */
	protected _started = false;

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
			this._connection
				.beginTransaction()
				.then(() => {
					resolve();
					this._started = true;
				})
				.catch(error => {
					reject(error);
					this._started = false;
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
			if (this._started === false) {
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
					this._started = false;
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
			if (this._started === false) {
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
					this._started = false;
				});
		});
	}
}
