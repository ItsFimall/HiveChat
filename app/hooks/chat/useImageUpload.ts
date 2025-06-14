import { useState, useCallback } from 'react';
import { message } from "antd";
import { useTranslations } from 'next-intl';

const useImageUpload = (maxImages: number = 5) => {
  const t = useTranslations('Chat');
  const [uploadedImages, setUploadedImages] = useState<Array<{ url: string; file: File }>>([]);

  const handleImageUpload = useCallback(async (file?: File, url?: string) => {
    // Direct handling for pre-existing file/url (e.g., from drag-and-drop or clipboard)
    if (file && url) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        message.warning(t('imageSizeLimit'));
        return;
      }
      if (!file.type.startsWith('image/')) {
        message.warning(t('mustBeImage'));
        return;
      }

      setUploadedImages(prev => {
        // Check if adding this image exceeds maxImages before updating
        if (prev.length >= maxImages) {
          message.warning(t('maxImageCount', { maxImages }));
          return prev; // Do not update state if limit reached
        }
        return [...prev, { url, file }];
      });
      return;
    }

    // Original file selection logic via input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;

    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;

      const fileArray = Array.from(files);
      let newImages: { url: string; file: File }[] = [];
      let hasError = false;

      // First pass: Validate files and create URLs
      for (const file of fileArray) {
        if (file.size > 5 * 1024 * 1024) { // 5MB
          message.warning(t('imageSizeLimit'));
          hasError = true;
          break; // Stop processing on first error
        }
        if (!file.type.startsWith('image/')) {
          message.warning(t('mustBeImage'));
          hasError = true;
          break; // Stop processing on first error
        }
        newImages.push({
          url: URL.createObjectURL(file),
          file
        });
      }

      if (hasError) {
        // Revoke URLs if an error occurred during processing to prevent memory leaks
        newImages.forEach(img => URL.revokeObjectURL(img.url));
        return;
      }

      // Second pass: Update state once after all validations and URL creations
      setUploadedImages(prev => {
        if (prev.length + newImages.length > maxImages) {
          message.warning(t('maxImageCount', { maxImages }));
          // Revoke URLs of new images if they push over the limit
          newImages.forEach(img => URL.revokeObjectURL(img.url));
          return prev; // Do not update state
        }
        return [...prev, ...newImages];
      });
    };
    input.click();
  }, [maxImages, t]); // Removed uploadedImages.length from dependencies

  const removeImage = useCallback((index: number) => {
    setUploadedImages(prev => {
      const imgToRemove = prev[index];
      // Revoke object URL only if it was created by us (starts with 'blob:')
      if (imgToRemove && imgToRemove.url.startsWith('blob:')) {
        URL.revokeObjectURL(imgToRemove.url);
      }
      return prev.filter((_, i) => i !== index);
    });
  }, []); // Dependencies are stable

  // A cleanup useEffect to revoke all remaining object URLs when the component unmounts
  // or maxImages changes, just in case
  useEffect(() => {
    return () => {
      uploadedImages.forEach(img => {
        if (img.url.startsWith('blob:')) {
          URL.revokeObjectURL(img.url);
        }
      });
    };
  }, [uploadedImages]); // This effect depends on uploadedImages to clean up when they change

  return { uploadedImages, maxImages, handleImageUpload, removeImage, setUploadedImages };
};

export default useImageUpload;
