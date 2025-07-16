# Bitespeed Identity Reconciliation Backend

This project implements the Bitespeed Backend Task for Identity Reconciliation using Node.js, TypeScript, Express, and TypeORM.

## Deployed URL

[https://bitespeed-assign-uocj.onrender.com](https://bitespeed-assign-uocj.onrender.com)

## API Endpoint

### POST /identify

Reconciles customer identities based on email and/or phone number.

#### Request Body
```
{
  "email": "user@example.com",   // optional
  "phoneNumber": "1234567890"    // optional
}
```
At least one of `email` or `phoneNumber` is required.

#### Response
```
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["user@example.com", ...],
    "phoneNumbers": ["1234567890", ...],
    "secondaryContactIds": [2, 3, ...]
  }
}
```

- `primaryContactId`: The id of the primary contact.
- `emails`: All unique emails linked to this identity.
- `phoneNumbers`: All unique phone numbers linked to this identity.
- `secondaryContactIds`: All secondary contact ids linked to the primary.

## Example

Request:
```
POST /identify
{
  "email": "george@hillvalley.edu",
  "phoneNumber": "717171"
}
```

Response:
```
{
  "contact": {
    "primaryContactId": 11,
    "emails": ["george@hillvalley.edu", "biffsucks@hillvalley.edu"],
    "phoneNumbers": ["919191", "717171"],
    "secondaryContactIds": [27]
  }
}
``` 