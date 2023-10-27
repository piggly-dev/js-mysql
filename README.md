# MySQL Wrapper

![Typescript](https://img.shields.io/badge/language-typescript-blue?style=for-the-badge) ![NPM](https://img.shields.io/npm/v/@piggly/mysql?style=for-the-badge) [![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=for-the-badge)](LICENSE)

An ESM/CommonJS library following Oriented-Object Programming pattern to manager a MySQL connection.

## Usage

This package is only a wrapper. Applying the `@piggly/ddd-toolkit` behavior to `mysql2` library. May not be for every project or everyone. See unit testing for examples.

## Changelog

See the [CHANGELOG](CHANGELOG.md) file for information about all code changes.

## Testing the code

This library uses the **Jest**. Tests are made of integrations test. We carry out tests of all the main features of this application.

> ⚠️ You must install (https://github.com/datacharmer/test_db)[https://github.com/datacharmer/test_db] database on your MySQL instance.

```bash
cross-env JEST_MYSQL_USER=root JEST_MYSQL_PASSWORD=pass npm run test:once
```

## Contributions

See the [CONTRIBUTING](CONTRIBUTING.md) file for information before submitting your contribution.

## Credits

- [Caique Araujo](https://github.com/caiquearaujo)
- [All contributors](../../contributors)

## License

MIT License (MIT). See [LICENSE](LICENSE).
