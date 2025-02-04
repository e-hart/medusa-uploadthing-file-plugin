<p align="center">
  <a href="https://www.medusajs.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/59018053/229103275-b5e482bb-4601-46e6-8142-244f531cebdb.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg">
    <img alt="Medusa logo" src="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg">
    </picture>
  </a>
</p>
<h1 align="center">
  Medusa UploadThing File Plugin
</h1>
<p align="center">
<a href="https://github.com/e-hart/medusa-uploadthing-file-plugin">GitHub</a> | <a href="https://www.medusajs.com">Medusa</a> | MIT License
<br>
Author: <a href="https://evanh.art">Evan Hart</a>
</p>

This plugin allows you to use UploadThing as a file provider in your Medusa application. Under the hood, it uses UploadThing's [UTApi](https://docs.uploadthing.com/api-reference/ut-api) SDK to upload files and retrieve presigned URLs.

Private ACL requires a paid UploadThing account, and the feature must be enabled in your UploadThing app settings.

## Compatibility

This plugin is compatible with versions >= 2.4.0 of `@medusajs/medusa`.

## Important note

This plugin is meant to be resolved within the `@medusajs/medusa/file` module in the `modules` array of your `medusa-config.ts` file. It is not meant to be resolved in the `plugins` array. As of version 2.4.0, Medusa does not support configuring providers within plugins.

## Installation

To install the plugin, run the following command in your Medusa project directory:

```bash
npm install medusa-uploadthing-file-plugin
```

Or if you're using Yarn:

```bash
yarn add medusa-uploadthing-file-plugin
```

## Configuration

To configure the plugin, first add your UploadThing API key to your `.env` file:

```bash
UPLOADTHING_TOKEN=your-uploadthing-api-key
```

Then add the following to your `medusa-config.ts` file:

```ts
import { defineConfig } from "@medusajs/medusa/config";

export default defineConfig({
  modules: [
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "medusa-uploadthing-file-plugin",
            options: {
              token: process.env.UPLOADTHING_TOKEN,
            },
          },
        ],
      },
    },
  ],
});
```

There are a few additional options you can configure in the provider's options:

```ts
...
  options: {
    token: string
    filePrefix?: string;
    logLevel?: "Error" | "Warning" | "Info" | "Debug" | "Trace";
    apiUrl?: string;
    ingestUrl?: string;
  }
```

`logLevel` sets UploadThing's log level. It defaults to "Info".

`apiUrl` and `ingestUrl` are optional and can be used to override the default UploadThing API and ingest URLs. This can be useful for self-hosting or testing purposes.

`filePrefix` is an optional string that can be used to add a prefix to the uploaded file's name.

And that's it! You're ready to start using the UploadThing file provider in your Medusa application.
