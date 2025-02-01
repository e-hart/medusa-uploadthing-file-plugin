import { ModuleProvider } from "@medusajs/framework/utils";
import { FileUploadThingService } from "./service";

export const FILE_UPLOADTHING_MODULE = "file-uploadthing";

export default ModuleProvider(FILE_UPLOADTHING_MODULE, {
  services: [FileUploadThingService],
});
