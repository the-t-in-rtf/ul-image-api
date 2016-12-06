# UL Image API

The [Unified Listing](http://ul.gpii.net) is a resource for people who want to find assistive technology solutions and
mainstream products with assistive features.  This package is used within the Unified Listing to allow:

1. Contributing images and image metadata associated with [Unified Listing](http://ul.gpii.net/) entries.
2. Reviewing and approving or rejecting contributions.
3. Allowing users to see the status of their contributions.
4. Viewing approved images as part of a product listing.

Anyone (even users who are not logged in) can view the images and galleries associated with the "unified" source.  This
is a curated data source created by reviewers based on imported data and user contributions.

By [signing up for a free account](/api/user/signup) and [logging in](/api/user/login), users gain the ability to
contribute updates to the data served by this API.

Users can contribute new images, which are only visible to the submitter and reviewers.  An image is approved or
rejected by a reviewer.

Users can submit metadata regarding an image (for example, to suggest a better description for a given image).
These suggestions are only visible to the submitter and reviewers.  Reviewers approve and reject contributed metadata.

To contribute image data to the live Unified Listing, please visit [http://ul.gpii.net].  To try out the software
locally, please read the "Developer Documentation" below.

# Developer Documentation

## The API

The API provides a series of REST inputs.  For details regarding the endpoints, their accepted input, and their return
values, see [docs/api-rest-docs.md](the API documentation).

The API is built as a series of [Fluid components](http://fluidproject.org/). For more information, see
[docs/api-component-docs.md](the API component documentation).  In addition, the API is built using the following key
libraries:

1. [Sharp](http://sharp.dimens.io/), for image resizing.
2. [multer](https://www.npmjs.com/package/multer), to handle incoming file uploads.

If you would like to develop and test your own components or integration work, this package is available for use in your
tests and demos as a development dependency.

## Try it Out Locally

To try out the interface with the demo data provided by this package, run `node launcher.js` from the command line.  You
can then open `http://localhost:3141/api/images/unified/sampleRecord` in your browser to see an example of the API in
action.

The demo includes the user management functions required, and two sample users:

1. `contributor` (password: `password`) - Can contribute images and metadata.
2. `reviewer` (password: `password`) - Can approve and reject contributions and edit galleries.

## Using the front-end widgets on your site

This package provides reference front-end components designed to work with the API.  The live API provides 
[CORS headers](https://www.w3.org/TR/cors/) that allow the API to be used from scripts running on third-party sites. 
So, you can use the components in this package on your own site.  See [docs/api-client-docs.md](the API client documentation)
for details.

