package com.example.OneNightProject.product.service;

import java.util.Map;
import org.springframework.web.multipart.MultipartFile;


public interface CloudinaryService {

    Map upload(MultipartFile file);

    void delete(String publicId);
}
