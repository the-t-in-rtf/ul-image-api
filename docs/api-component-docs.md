# API  Component Documentation.

This page documents the back-end components that power the UL Image API.

# `gpii.ul.images.middleware.api`

A rollup grade that wires together all parts of the API.  There is no unique code here, this is merely a [`gpii.express.router`](https://github.com/GPII/gpii-express/blob/master/docs/router.md)
grade with particular components and options.

# `gpii.ul.images.middleware.api.metadata`

This [`gpii.express.middleware`](https://github.com/GPII/gpii-express/blob/master/docs/middleware.md) handles the 
following endpoints:

* `POST /api/images/metadata/:uid/:source`
* `GET /api/images/metadata/:uid/:source/:image_id`
* `PUT /api/images/metadata/:uid/:source/:image_id`
* `DELETE /api/images/metadata/:uid/:source/:image_id`

Each of these is handled by a separate

# `gpii.ul.images.middleware.api.files`

This [`gpii.express.middleware`](https://github.com/GPII/gpii-express/blob/master/docs/middleware.md) handles the 
following endpoints:

* `POST /api/images/file/:uid/:source`
* `GET /api/images/file/:uid/:source/:image_id{?height&width}`
* `HEAD /api/images/file/:uid/:source/:image_id{?height&width}`
* `PUT /api/images/file/:uid/:source/:image_id`
* `DELETE /api/images/file/:uid/:source/:image_id`

# `gpii.ul.images.middleware.api.images`

This [`gpii.express.middleware`](https://github.com/GPII/gpii-express/blob/master/docs/middleware.md) handles the 
following endpoints:

* `GET /api/images/:source`
* `GET /api/images/:source/:uid`

# `gpii.ul.images.middleware.api.gallery`

This [`gpii.express.middleware`](https://github.com/GPII/gpii-express/blob/master/docs/middleware.md) handles the
following endpoints:

* `GET /api/images/gallery/:uid`
* `PUT /api/images/gallery/:uid`
* `DELETE /api/images/gallery/:uid`



TODO:  Write "approve" REST docs and then create a skeleton here.