import { MySQL } from '@/core';
import { WritableQueryResponse } from '@/types';

describe('integration -> MySQL', () => {
	const connection = new MySQL({
		host: process.env.JEST_MYSQL_HOST,
		port: parseInt(process.env.JEST_MYSQL_PORT ?? '3306', 10),
		user: process.env.JEST_MYSQL_USER,
		password: process.env.JEST_MYSQL_PASSWORD,
		database: process.env.JEST_MYSQL_DB,
		timezone: 'Z',
	});

	beforeAll(async () => {
		await connection.connect();
	});

	afterAll(async () => {
		await connection.quit();
	});

	it('should be able to query -> first record', async () => {
		const context = connection.context('query');

		const result = await context.query<
			{
				emp_no: number;
				birth_date: string;
				first_name: string;
				last_name: string;
				gender: string;
				hire_date: string;
			}[]
		>('SELECT * FROM `employees` LIMIT 1');

		expect(result).toHaveLength(1);

		expect(result[0]).toHaveProperty('emp_no');
		expect(result[0]).toHaveProperty('birth_date');
		expect(result[0]).toHaveProperty('first_name');
		expect(result[0]).toHaveProperty('last_name');
		expect(result[0]).toHaveProperty('gender');
		expect(result[0]).toHaveProperty('hire_date');
	});

	it('should not be able to query -> any record', async () => {
		const context = connection.context('query');

		expect(
			context.query('SELECT * FROM `employees_invalid` LIMIT 1')
		).rejects.toThrow();
	});

	it('should be able to query -> first ten records', async () => {
		const context = connection.context('query');

		const result = await context.query<
			{
				emp_no: number;
				birth_date: string;
				first_name: string;
				last_name: string;
				gender: string;
				hire_date: string;
			}[]
		>('SELECT * FROM `employees` LIMIT 10');

		expect(result).toHaveLength(10);

		expect(result[0]).toHaveProperty('emp_no');
		expect(result[0]).toHaveProperty('birth_date');
		expect(result[0]).toHaveProperty('first_name');
		expect(result[0]).toHaveProperty('last_name');
		expect(result[0]).toHaveProperty('gender');
		expect(result[0]).toHaveProperty('hire_date');
	});

	it('should be able to query -> by emp_no', async () => {
		const context = connection.context('query');

		const result = await context.query<
			{
				emp_no: number;
				birth_date: string;
				first_name: string;
				last_name: string;
				gender: string;
				hire_date: string;
			}[]
		>('SELECT * FROM `employees` WHERE `emp_no` = ? LIMIT 1', [10069]);

		expect(result).toHaveLength(1);

		expect(result[0]).toStrictEqual({
			emp_no: 10069,
			birth_date: new Date('1960-09-06T00:00:00.000Z'),
			first_name: 'Margareta',
			last_name: 'Bierman',
			gender: 'F',
			hire_date: new Date('1989-11-05T00:00:00.000Z'),
		});
	});

	it('should be able to query with options -> by emp_no', async () => {
		const context = connection.context('query');

		const result = await context.queryWithOptions<
			{
				emp_no: number;
				birth_date: string;
				first_name: string;
				last_name: string;
				gender: string;
				hire_date: string;
			}[]
		>({
			sql: 'SELECT * FROM `employees` WHERE `emp_no` = ? LIMIT 1',
			values: [10069],
		});

		expect(result).toHaveLength(1);

		expect(result[0]).toHaveProperty('emp_no');
		expect(result[0]).toHaveProperty('birth_date');
		expect(result[0]).toHaveProperty('first_name');
		expect(result[0]).toHaveProperty('last_name');
		expect(result[0]).toHaveProperty('gender');
		expect(result[0]).toHaveProperty('hire_date');
	});

	it('should be able to insert / update / select / delete -> single record', async () => {
		const context = connection.context('query');

		const inserted = await context.query<WritableQueryResponse[]>(
			'INSERT INTO `employees` (`emp_no`, `birth_date`, `first_name`, `last_name`, `gender`, `hire_date`) VALUES (?, ?, ?, ?, ?, ?)',
			[500000, '1969-09-06', 'Bruce', 'Wayne', 'M', '1989-11-05']
		);

		expect(inserted).toHaveLength(1);

		expect(inserted[0]).toHaveProperty('fieldCount');
		expect(inserted[0]).toHaveProperty('affectedRows');
		expect(inserted[0]).toHaveProperty('insertId');
		expect(inserted[0]).toHaveProperty('info');
		expect(inserted[0]).toHaveProperty('serverStatus');
		expect(inserted[0]).toHaveProperty('warningStatus');

		const updated = await context.query<WritableQueryResponse[]>(
			'UPDATE `employees` SET `first_name` = ? WHERE `emp_no` = ?',
			['Bruce (Batman)', 500000]
		);

		expect(updated).toHaveLength(1);

		expect(updated[0]).toHaveProperty('fieldCount');
		expect(updated[0]).toHaveProperty('affectedRows');
		expect(updated[0]).toHaveProperty('insertId');
		expect(updated[0]).toHaveProperty('info');
		expect(updated[0]).toHaveProperty('serverStatus');
		expect(updated[0]).toHaveProperty('warningStatus');
		expect(updated[0]).toHaveProperty('changedRows');

		const selected = await context.query<
			{
				emp_no: number;
				birth_date: string;
				first_name: string;
				last_name: string;
				gender: string;
				hire_date: string;
			}[]
		>('SELECT * FROM `employees` WHERE `emp_no` = ? LIMIT 1', [500000]);

		expect(selected).toHaveLength(1);

		expect(selected[0]).toStrictEqual({
			emp_no: 500000,
			birth_date: new Date('1969-09-06T00:00:00.000Z'),
			first_name: 'Bruce (Batman)',
			last_name: 'Wayne',
			gender: 'M',
			hire_date: new Date('1989-11-05T00:00:00.000Z'),
		});

		const deleted = await context.query<WritableQueryResponse[]>(
			'DELETE FROM `employees` WHERE `emp_no` = ?',
			[500000]
		);

		expect(deleted).toHaveLength(1);

		expect(deleted[0]).toHaveProperty('fieldCount');
		expect(deleted[0]).toHaveProperty('affectedRows');
		expect(deleted[0]).toHaveProperty('insertId');
		expect(deleted[0]).toHaveProperty('info');
		expect(deleted[0]).toHaveProperty('serverStatus');
		expect(deleted[0]).toHaveProperty('warningStatus');
	});

	it('should be able to do a transaction -> commit', async () => {
		const context = connection.context('transaction');

		await context.begin();

		await context.query<WritableQueryResponse[]>(
			'INSERT INTO `employees` (`emp_no`, `birth_date`, `first_name`, `last_name`, `gender`, `hire_date`) VALUES (?, ?, ?, ?, ?, ?)',
			[500000, '1969-09-06', 'Bruce', 'Wayne', 'M', '1989-11-05']
		);

		await context.query<WritableQueryResponse[]>(
			'INSERT INTO `titles` (`emp_no`, `title`, `from_date`, `to_date`) VALUES (?, ?, ?, ?)',
			[500000, 'CEO', '1989-11-05', '1999-11-05']
		);

		await context.commit();

		const employee = await context.query<
			{
				emp_no: number;
				birth_date: string;
				first_name: string;
				last_name: string;
				gender: string;
				hire_date: string;
			}[]
		>('SELECT * FROM `employees` WHERE `emp_no` = ? LIMIT 1', [500000]);

		expect(employee).toHaveLength(1);

		expect(employee[0]).toStrictEqual({
			emp_no: 500000,
			birth_date: new Date('1969-09-06T00:00:00.000Z'),
			first_name: 'Bruce',
			last_name: 'Wayne',
			gender: 'M',
			hire_date: new Date('1989-11-05T00:00:00.000Z'),
		});

		const title = await context.query<
			{
				emp_no: number;
				title: string;
				from_date: Date;
				to_date: Date;
			}[]
		>('SELECT * FROM `titles` WHERE `emp_no` = ? LIMIT 1', [500000]);

		expect(title).toHaveLength(1);

		expect(title[0]).toStrictEqual({
			emp_no: 500000,
			title: 'CEO',
			from_date: new Date('1989-11-05T00:00:00.000Z'),
			to_date: new Date('1999-11-05T00:00:00.000Z'),
		});

		await context.query<WritableQueryResponse[]>(
			'DELETE FROM `employees` WHERE `emp_no` = ?',
			[500000]
		);

		await context.query<WritableQueryResponse[]>(
			'DELETE FROM `titles` WHERE `emp_no` = ?',
			[500000]
		);
	});

	it('should be able to do a transaction -> rollback', async () => {
		const context = connection.context('transaction');

		await context.begin();

		await context.query<WritableQueryResponse[]>(
			'INSERT INTO `employees` (`emp_no`, `birth_date`, `first_name`, `last_name`, `gender`, `hire_date`) VALUES (?, ?, ?, ?, ?, ?)',
			[500000, '1969-09-06', 'Bruce', 'Wayne', 'M', '1989-11-05']
		);

		await context.query<WritableQueryResponse[]>(
			'INSERT INTO `titles` (`emp_no`, `title`, `from_date`, `to_date`) VALUES (?, ?, ?, ?)',
			[500000, 'CEO', '1989-11-05', '1999-11-05']
		);

		await context.rollback();

		const employee = await context.query<
			{
				emp_no: number;
				birth_date: string;
				first_name: string;
				last_name: string;
				gender: string;
				hire_date: string;
			}[]
		>('SELECT * FROM `employees` WHERE `emp_no` = ? LIMIT 1', [500000]);

		expect(employee).toHaveLength(0);

		const title = await context.query<
			{
				emp_no: number;
				title: string;
				from_date: Date;
				to_date: Date;
			}[]
		>('SELECT * FROM `titles` WHERE `emp_no` = ? LIMIT 1', [500000]);

		expect(title).toHaveLength(0);
	});
});
