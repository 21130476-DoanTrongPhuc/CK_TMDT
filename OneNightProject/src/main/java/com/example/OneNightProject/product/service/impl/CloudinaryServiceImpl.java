package com.example.OneNightProject.product.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.OneNightProject.product.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryServiceImpl implements CloudinaryService {

    private final Cloudinary cloudinary;

    @Override
    public Map upload(MultipartFile file) {

        try {
            return cloudinary.uploader()
                    .upload(
                            file.getBytes(),
                            ObjectUtils.emptyMap()
                    );
        } catch (Exception e) {
            throw new RuntimeException("Upload failed");
        }
    }

    @Override
    public void delete(String publicId) {

        try {
            cloudinary.uploader()
                    .destroy(
                            publicId,
                            ObjectUtils.emptyMap()
                    );
        } catch (Exception e) {
            throw new RuntimeException("Delete failed");
        }
    }
}
