import { applyParams, save, ActionOptions } from "gadget-server";

export const run: ActionRun = async ({ params, record, logger, api, connections }) => {
   // Apply incoming params to record
  applyParams(params, record);

  // Make sure the file is attached
  if (!record.file) {
    throw new Error("No file provided for upload.");
  }

  // Save the record first to upload the file to cloud storage
  await save(record);

  // After saving, populate metadata fields from the uploaded file
  if (record.file) {
    record.url = record.file.url;
    record.fileName = record.file.fileName;
    record.mimeType = record.file.mimeType;
    record.fileSize = record.file.byteSize;

    // Save the record again to store the populated metadata fields
    await save(record);

    // Log the successful upload with the URL
    logger.info({ url: record.url }, "File uploaded successfully");
  }

  return record;
};

export const options: ActionOptions = {
  actionType: "create",
};
