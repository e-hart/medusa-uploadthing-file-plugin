import { UTApi, UTFile } from "uploadthing/server";
import { AbstractFileProviderService, MedusaError } from "@medusajs/framework/utils";
import { Logger, FileTypes } from "@medusajs/framework/types";
import { ulid } from "ulid";
import path from "path";

type UploadFileResult =
  | {
      data: { url: string };
      error: null;
    }
  | {
      data: null;
      error: { message: string };
    };

type InjectedDependencies = {
  logger: Logger;
};

interface ModuleOptions {
  /**
   * UploadThing API key
   */
  token: string;

  /**
   * Set UploadThing log level. Defaults to "Info".
   */
  logLevel?: "Error" | "Warning" | "Info" | "Debug" | "Trace";

  /**
   * URL override for the API server. Defaults to 'https://api.uploadthing.com'
   * and should only be set for self-hosting or testing purposes.
   */
  apiUrl?: string;

  /**
   * URL override for the ingest server. The URL is derived from the token by default.
   * This should only be set for self-hosting or testing purposes.
   */
  ingestUrl?: string;

  /**
   * Adds a prefix to the uploaded file's name.
   */
  filePrefix?: string;
}

export class FileUploadThingService extends AbstractFileProviderService {
  static identifier = "uploadthing";
  protected config_: ModuleOptions;
  protected client_: UTApi;
  protected logger_: Logger;

  constructor({ logger }: InjectedDependencies, options: ModuleOptions) {
    super();

    if (!options.token) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "UploadThing token is required");
    }

    this.config_ = options;
    this.logger_ = logger;
    this.client_ = this.getClient();
  }

  protected getClient(): UTApi {
    return new UTApi({
      token: this.config_.token,
      logLevel: this.config_.logLevel,
      apiUrl: this.config_.apiUrl,
      ingestUrl: this.config_.ingestUrl,
    });
  }

  async upload(file: FileTypes.ProviderUploadFileDTO): Promise<FileTypes.ProviderFileResultDTO> {
    if (!file) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "File is required");
    }

    if (!file.filename) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Filename is required");
    }

    const acl = file.access === "public" ? "public-read" : "private";
    const prefix = this.config_.filePrefix ?? "";
    const parsedFilename = path.parse(file.filename);

    const fileKey = `${prefix}${parsedFilename.name}-${ulid()}${parsedFilename.ext}`;

    const fileBuffer = Buffer.from(file.content, "binary");

    const utFile = new UTFile([fileBuffer], fileKey, { type: file.mimeType });

    let uploadResult: UploadFileResult;

    try {
      uploadResult = await this.client_.uploadFiles(utFile, { acl });
    } catch (e) {
      this.logger_.error(e);
      throw e;
    }

    if (!uploadResult.data?.url) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "UploadThing returned an invalid response"
      );
    }

    return {
      url: uploadResult.data.url,
      key: fileKey,
    };
  }

  async delete(file: FileTypes.ProviderDeleteFileDTO): Promise<void> {
    try {
      const deleteResponse = await this.client_.deleteFiles([file.fileKey]);

      if (!deleteResponse.success) {
        this.logger_.error("Failed to delete file, it may have already been deleted.");
      }
    } catch (e) {
      this.logger_.error(e);
      throw e;
    }
  }

  async getPresignedDownloadUrl(fileData: FileTypes.ProviderGetFileDTO): Promise<string> {
    const { url } = await this.client_.getSignedURL(fileData.fileKey);
    return url;
  }
}
