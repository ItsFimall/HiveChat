import { useState, useCallback } from 'react';
import { message } from "antd";
import { useTranslations } from 'next-intl';

interface ImageData {
  url: string;
  file: File;
}

const useImageUpload = (maxImages: number = 5) => {
  const t = useTranslations('Chat');
  const [uploadedImages, setUploadedImages] = useState<ImageData[]>([]);

  const validateImage = useCallback((file: File): boolean => {
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      message.warning(t('imageSizeLimit'));
      return false;
    }
    if (!file.type.startsWith('image/')) {
      message.warning(t('mustBeImage'));
      return false;
    }
    return true;
  }, [t]);

  const handleImageUpload = useCallback(async (file?: File, url?: string) => {
    if (file && url) {
      if (!validateImage(file)) return;
      setUploadedImages(prev => [...prev, { url, file }]);
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.hidden = true;

    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) {
        input.remove();
        return;
      }

      const totalFiles = files.length + uploadedImages.length;
      if (totalFiles > maxImages) {
        message.warning(t('maxImageCount', { maxImages }));
        input.remove();
        return;
      }

      const validFiles = Array.from(files).filter(validateImage);
      if (validFiles.length === 0) {
        input.remove();
        return;
      }

      const newImages = validFiles.map(file => ({
        url: URL.createObjectURL(file),
        file
      }));

      setUploadedImages(prev => [...prev, ...newImages]);
      input.remove();
    };

    document.body.appendChild(input);
    input.click();
  }, [uploadedImages.length, maxImages, t, validateImage]);

  const removeImage = useCallback((index: number) => {
    setUploadedImages(prev => {
      const newImages = [...prev];
      const [removed] = newImages.splice(index, 1);
      if (removed?.url.startsWith('blob:')) {
        URL.revokeObjectURL(removed.url);
      }
      return newImages;
    });
  }, []);

  return { 
    uploadedImages,
    maxImages, // Keeping this as requested
    handleImageUpload, 
    removeImage, 
    setUploadedImages 
  };
};

export default useImageUpload;
