[![Build Status](https://travis-ci.com/telemark/minelev-my-students.svg?branch=master)](https://travis-ci.com/telemark/minelev-my-students)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

# minelev-my-students

Lambda for returning all your students

## API

All calls requires a valid bearer token from Azure

### ```GET /api/students```

Returns an array of students

### ```GET /api/students/:id```

Returns an object of given student with available documents

## Setup

You'll need an azure tenant and a jwt and endpoint url for your Buddy service.

Environment

```
BUDDY_SERVICE_URL=https://buddy.service.io
BUDDY_JWT_SECRET=Louie Louie, oh no, I got to go Louie Louie, oh no, I got to go
MOA_TENANT_ID=your-azure-tenant
```

## Related

- [minelev-buddy](https://github.com/telemark/minelev-buddy) - Buddy service for MinElev

## License

[MIT](LICENSE)
