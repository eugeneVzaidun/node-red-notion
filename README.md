# Node-red-notion

A very new and very untested dependency-free node collection for Node-RED to call Notion APIs.

## Features
The following Notion API endpoints are supported:
#### Blocks
- Append block children
- Get block children
- Update block
- Delete block
#### Page
- Get page
- Update page
- Add page
- Get page property
#### Database
- Create database
- Get database (retrieves DB properties)
- Query database
#### Users
- List all users

#### Other
Overall, all nodes transparently (as in, you don't have to worry about) support:
- Retries due to e.g. network errors or rate limits (which are quite aggressive on Notion side if you're a heavy user)
- API pagination (you are supposed to always get all applicable query results, regardless of how many there are)

## Contributing
All contributions are more than welcome, just open a merge request.

## Changelog
- 1.1 Added support for Get Users and Update Block