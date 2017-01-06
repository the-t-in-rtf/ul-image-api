# API Client components

The API client components provided in this package are written as [Fluid ViewComponent grades](http://docs.fluidproject.org/infusion/development/ViewAPI.html).

To use them, you will need to:
 
 1. Provide markup that will hold the component's content.
 2. Include Fluid and all client-side dependencies from this package.  See the tests for examples.
 3. Make the required templates available using the ["inline" template middleware provided by the `gpii-handlebars` package].
 4. Instantiate the component.

// TODO:  Flesh this out with practical examples, including details about working with templates.

# `gpii.ul.images.client.upload`

A component to upload a single file.

# `gpii.ul.images.client.metadata.edit`

A component to edit the metadata associated with a single image file.

# `gpii.ul.images.client.gallery`

A component to display a collection of images as thumbnails, with support for zooming in on individual images.

# `gpii.ul.images.client.gallery.edit`

A component to enable reviewers to choose which images (and in which order) to display in a gallery view.