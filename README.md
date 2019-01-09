# minelev-my-students

Lambda for returning all your students

## API

All calls requires a valid bearer token from Azure

### ```GET /api/students```

Returns an array of students

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
