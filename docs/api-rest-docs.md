# The UL Image REST API

This package provides a [REST API](https://en.wikipedia.org/wiki/Representational_state_transfer) that can be accessed
using server-side scripts or client-side components.  Read the full documentation below for more details about the
available endpoints, their accepted input, and their return values.

# Source Permissions

To add content using the image API, you must have an account in the Unified Listing.  You can create an account yourself,
see the [user management documentation](https://ul.gpii.net/api/user/) for details.

Individual contributors are expected to contribute new image data to their own "source", which consists of a tilde (~)
followed by their username, as in `~username`.  Reviewers and moderators review incoming images, and make them visible
via the "unified" data source.

# Error Messages

If there is a problem encountered in processing your request, you will receive a JSON error message with detailed
feedback.  At a minimum, the error response will contain an `isError` variable, and a `message` variable describing the
error, as in:

```
{
  "isError": true,
  "message": "You must be logged in to submit a new image."
}
```

In addition to checking HTTP status codes, you can use the `isError` property to determine if a response was successful.

# `POST /api/images/file/:uid/:source`

+ URL Parameters
    + `uid` (required) ... The unique ID of the Unified Listing entry associated with this image.
    + `source` (required) ... The data source (see "Source Permissions" above) to associate this image with.

Add a single image file that is associated with the Unified Listing with the unique identifier `uid`, and with a given
 data source (see above).  You must be logged in and have permission to write `s:ource` (see "Source Permissions" above).

When uploading a file, the payload must be transmitted using [multipart/form-data](https://www.w3.org/TR/html401/interact/forms.html#h-17.13.4.2)
encoding.  You are expected to provide file content in a variable named `file`.  The file must be a JPEG, PNG, GIF or
SVG image which is 2.5Mb or smaller.

The payload should look something like:

```
   Content-Type: multipart/form-data; boundary=AaB03x

   --AaB03x
   Content-Disposition: form-data; name="file"
   Content-Type: multipart/mixed; boundary=BbC04y

   --BbC04y
   Content-Disposition: file; filename="filename1.jpg"
   Content-Type: image/jpeg

   ... contents of filename1.jpg ...
   --BbC04y
   --AaB03x--
```

If your submission is accepted, you will receive a JSON response that looks something like:

```
{
  "message": "You have successfully submitted an image",
  "source":  "~username",
  "image_id": "12345"
}
```

The response includes the `image_id` of the new image, which you can use with the `GET /api/images/file/:uid/:source/:image_id`
endpoint (see below).

# `GET /api/images/:source`

+ HTTP Headers
    + `Accept` ... What type of content (`application/json` or `text/html`) to return.

+ URL Parameters
    + `source` (required) ... The data source (see "Source Permissions" above) to retrieve.

Retrieve all image metadata (including URLs that can be used to retrieve file content) for a given `:source`.  You must
have permission to view records associated with `:source` (see "Source Permissions" above).  If the HTTP `Accept` header
is set to `application/json`, a JSON record will be returned.  Otherwise, a rendered HTML page will be returned.  If the
user is logged in and has permission to write to `:source`, this page will contain controls to add or delete images.

# `GET /api/images/:source/:uid`

+ HTTP Headers
    + `Accept` ... What type of content (`application/json` or `text/html`) to return.

+ URL Parameters
    + `uid` (required) ... The unique ID of a Unified Listing entry.
    + `source` (required) ... The data source (see "Source Permissions" above) to retrieve.

Retrieve all image metadata (including URLs that can be used to retrieve file content) for `:source` and `:uid`.  You
must have permission to view records associated with `:source` (see "Source Permissions" above).  If the HTTP `Accept`
header is set to `application/json`, a JSON record will be returned.  Otherwise, a rendered HTML page will be returned.
If the user is logged in, this page will include controls to contribute metadata and new images.  If the user has
permission to write to `:source`, contributions will be made to `:source` directly.  Otherwise, the user will save
contributions to their own data source, e. g. `~username`.

# `GET /api/images/file/:uid/:source/:image_id{?height&width}`

Retrieve a single image file.  You must have permission to view records associated with `:source` (see "Source Permissions" above).

+ URL Parameters
    + `uid` (required) ... The unique ID of the Unified Listing entry associated with this image.
    + `source` (required) ... The data source (see "Source Permissions" above) to associate this image with.
    + `image_id` (required) .. The ID of this image, as returned by `GET /api/images/file/gallery` (see below) or `POST /api/images/file/:uid` (see above).

+ Query Parameters
    + `height` (optional, number) ... The desired height of the image.  If `height` is supplied and ``width` is omitted, the width will be determined using the aspect ratio of the original image.
    + `width` (optional, number) ... The desired width of the image.  If `width` is supplied and `height` is omitted, the height will be determined using the aspect ratio of the original image.

If both `height` and `width` are specified, the image will be scaled proportionately and mounted on a background with that
exact size.  See [the Sharp documentation](http://sharp.dimens.io/en/stable/api/#embed) for details.

# `HEAD /api/images/file/:uid/:source/:image_id{?height&width}`

Returns just the HTTP request headers for a given image, including:

This endpoint is intended to allow browsers to compare an image to their cache, to avoid downloading the same image
repeatedly.  Accepts the same URL and query parameters as `GET /api/images/file/:uid/:image_id` (see above).

# `PUT /api/images/file/:uid/:source/:image_id`

Update an existing image file and/or its associated metadata.  Allows the same inputs as a `POST` operation.

# `DELETE /api/images/file/:uid/:source/:image_id`

Remove a single existing image file.  You must have permission to write to `:source` (see "Source Permissions" above) to
use this endpoint.

# `POST /api/images/metadata/:uid/:source`

+ URL Parameters
    + `uid` (required) ... The unique ID of the Unified Listing entry associated with this image.
    + `source` (required) ... The data source (see "Source Permissions" above) to associate this image with.

Add new metadata for an existing image file, including copyright information and descriptions.  You are expected to submit a
JSON payload, the following fields are supported:

| Field                    | Type       | Description |
| ------------------------ | ---------- | ----------- |
| `source` (required)      | `{String}` | The data source for this image description. For individual users, this will typically be `~username`. |
| `description` (required) | `{String}` | A description of the image.  Will be used to provide alternate text for screen readers. |
| `copyright` (required)   | `{String}` | The copyright information for this image, which should ideally provide details about the copyright own, the date of the copyright, and the terms of use. |
| `filename`               | `{String}` | The name of this file.  When uploading files, this must exactly match the filename of the corresponding file in the `files` variable. |
| `uri`                    | `{URI}`    | The URI where the original image is hosted.  This is optional when uploading a file, but required when adding an image using a remote URI. |

# `GET /api/images/metadata/:uid/:source/:image_id`

+ URL Parameters
    + `uid` (required) ... The unique ID of the Unified Listing entry associated with this image.
    + `source` (required) ... The data source (see "Source Permissions" above) to associate this image with.
    + `image_id` (required) ... The unique ID of the image.

Retrieve the metadata associated with a single image file and source.

# `PUT /api/images/metadata/:uid/:source/:image_id`

+ URL Parameters
    + `uid` (required) ... The unique ID of the Unified Listing entry associated with this image.
    + `source` (required) ... The data source (see "Source Permissions" above) to associate this image with.
    + `image_id` (required) ... The unique ID of the image.

Update existing metadata associated with a single image file and source.

# `DELETE /api/images/metadata/:uid/:source/:image_id`

+ URL Parameters
    + `uid` (required) ... The unique ID of the Unified Listing entry associated with this image.
    + `source` (required) ... The data source (see "Source Permissions" above) to associate this image with.
    + `image_id` (required) ... The unique ID of the image.

Delete the metadata associated with a single image file and source.

# `GET /api/images/gallery/:uid`

+ HTTP Headers
    + `Accept` ... What type of content (`application/json` or `text/html`) to return.

+ URL Parameters
    + `uid` (required) ... The unique ID of the Unified Listing entry associated with this image.

Get a "gallery" of images associated with `uid`.  Returns a JSON document that represents "unified" images for a
given `uid` along with their metadata.  If a gallery has not been created for a given `uid`, the output will be
identical to `GET /api/images/unified/:uid` (see above).

If the HTTP `Accept` header is set to `application/json`, a JSON record like the following will be returned:

```
[
  {
    "source": "unified",
    "image_id": "12345",
    "description": "A picture that no one can object to.",
    "copyright": "(c) 2016 Jane P. Hoto, Licensed under Creative Commons Attribution 4.0 International",
    "filename": "totally-fine.jpg",
    "uri": "http://server.name/api/images/file/unified/12345"
  },
  {
    "source": "unified",
    "image_id": "12346",
    "description": "Another picture that no one can object to.",
    "copyright": "(c) 2016 Jane P. Hoto, Licensed under Creative Commons Attribution 4.0 International",
    "filename": "also-fine.jpg",
    "uri": "http://server.name/api/images/file/unified/12346"
  }
]
```
Otherwise, a rendered HTML page will be returned.  If the user is logged in, this page will include controls to
contribute metadata and new images.   If the user is a reviewer, this page will include controls to change which
images are displayed, and the order in which they are displayed.

# `PUT /api/images/gallery/:uid`

Update the gallery for a particular `uid`.  Used by reviewers to control which images appear, and in what order.
Accepts a JSON payload that consists of an array of image ids, as in:

```
["12346", "12345"]
```

These must correspond to images that exist, and that have metadata associated with the "unified" source.

# `DELETE /api/images/gallery/:uid`

+ URL Parameters
    + `uid` (required) ... The unique ID of the Unified Listing entry associated with this image.

Delete a custom "gallery" definition.  This will reset the output of `GET /api/images/gallery/:uid` to the defaults
(see above).

# `PUT /api/images/approve`

+ JSON Body Parameters
    + `uid` (required) ... The unique ID of the Unified Listing entry associated with this image.
    + `source` (required) ... The data source (see "Source Permissions" above) to associate this image with.
    + `image_id` (required) ... The unique ID of the image.

Approve a contributed image file and/or metadata and copy it to the "unified" data source.  This endpoint can only be
accessed by reviewers.

# `PUT /api/images/reject`

+ JSON Body Parameters
    + `uid` (required) ... The unique ID of the Unified Listing entry associated with this image.
    + `source` (required) ... The data source (see "Source Permissions" above) to associate this image with.
    + `image_id` (required) ... The unique ID of the image.

Reject a contributed image file and/or metadata.  This will take it out of the list of records to be reviewed, and will
make it clear to the contributor that their submission has been rejected.  This endpoint can only be accessed by reviewers.

# `GET /api/images/reports`

Displays a rendered HTML page with links to all available reports.

# `GET /api/images/reports/contributions`

+ HTTP Headers
    + `Accept` ... What type of content (`application/json` or `text/html`) to return.

Retrieve the list of images and metadata contributed by the currently logged in user.  If the HTTP `Accept` header is
set to `application/json`, a JSON payload listing the contributions will be returned.  Otherwise, a rendered HTML page
will be returned.

# `GET /api/images/reports/reviewers{?includeReviewed}`

+ Query Parameters
    + `includeReviewed` (optional, boolean) ... Whether or not to include images that have already been reviewed (`false` by default).

+ HTTP Headers
    + `Accept` ... What type of content (`application/json` or `text/html`) to return.

Retrieve the list of contributions waiting to be reviewed (i.e. those that have not been approved).  If the HTTP
`Accept` header is set to `application/json`, a JSON payload listing the contributions will be returned.  Otherwise, a
rendered HTML page will be returned.

