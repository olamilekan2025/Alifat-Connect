import cloudinary from "@/lib/cloudinary";

export async function uploadKYCDocument(file: File, documentType: string) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `kyc-documents/${documentType}`,
        resource_type: "auto",
        allowed_formats: ["jpg", "jpeg", "png", "pdf"],
        max_file_size: 5000000, // 5MB max
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(buffer);
  });
}
