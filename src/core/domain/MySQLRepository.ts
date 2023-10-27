import { Entity as BaseEntity, BaseSQLRepository } from '@piggly/ddd-toolkit';
import {
	MySQLContext,
	QueryError,
	WritableQueryResponse as Writable,
} from '@/types';

/**
 * @file MySQL base repository structure.
 * @copyright Piggly Lab 2023
 */
export default abstract class MySQLRepository<
	Entity extends BaseEntity<any, any>,
	PersistenceRecord extends Record<string, any>
> extends BaseSQLRepository<Entity, PersistenceRecord, MySQLContext, QueryError> {
	/**
	 * Return writable (insert/update/delete) response for a SQL.
	 *
	 * @param {string} sql
	 * @param {any[]} [values]
	 * @protected
	 * @abstract
	 * @memberof BaseRepository
	 * @since 1.2.0
	 * @author Caique Araujo <caique@piggly.com.br>
	 */
	protected async write<WritableQueryResponse = Writable>(
		sql: string,
		values?: any[]
	): Promise<WritableQueryResponse[] | undefined> {
		return this.raw<WritableQueryResponse[]>(sql, values);
	}

	/**
	 * Implementation to run a SQL.
	 *
	 * @param {string} sql
	 * @param {any[]} [values]
	 * @returns {Promise<T | undefined>}
	 * @protected
	 * @abstract
	 * @memberof BaseRepository
	 * @since 1.2.0
	 * @author Caique Araujo <caique@piggly.com.br>
	 */
	protected run<T extends Array<any>>(
		sql: string,
		values?: any[]
	): Promise<T | undefined> {
		return this._database.query<T>(sql, values);
	}
}
