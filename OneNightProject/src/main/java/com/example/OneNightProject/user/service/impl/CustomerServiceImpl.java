package com.example.OneNightProject.user.service.impl;

import com.example.OneNightProject.common.api.ApiResponse;
import com.example.OneNightProject.user.dto.request.ChangePassword;
import com.example.OneNightProject.user.dto.request.CustomerRequest;
import com.example.OneNightProject.user.dto.request.ResetPasswordRequest;
import com.example.OneNightProject.user.dto.response.CustomerResponse;
import com.example.OneNightProject.user.dto.response.ResponsePasswordReset;
import com.example.OneNightProject.user.entity.Users;
import com.example.OneNightProject.user.entity.VerificationToken;
import com.example.OneNightProject.user.enums.CustomerEnum;
import com.example.OneNightProject.user.enums.CustomerStatusEnum;
import com.example.OneNightProject.user.mapper.CustomerMapper;
import com.example.OneNightProject.user.repository.CustomerRepository;
import com.example.OneNightProject.user.repository.ShippingAddressRepository;
import com.example.OneNightProject.user.repository.VerificationTokenRepository;
import com.example.OneNightProject.user.service.CustomerService;
import jakarta.mail.internet.MimeMessage;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {
    @Autowired
    private CustomerMapper customerMapper;
    @Autowired
    private CustomerRepository customerRepository;
    @Autowired
    private VerificationTokenRepository tokenRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JavaMailSender mailSender;
    @Override
    public CustomerResponse register(CustomerRequest request) {

        if(customerRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException(
                    "EMAIL_ALREADY_EXISTS"
            );
        }

        String password = request.getPassword();
        Users users = customerMapper.toEntityCustomerRequest(request);
        users.setPassword(new BCryptPasswordEncoder().encode(password));
        users.setStatus(CustomerStatusEnum.INACTIVE);
        users.setRole(CustomerEnum.USER);
        customerMapper.toCustomerResposne(customerRepository.save(users));

        String token = UUID.randomUUID().toString();

        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setToken(token);
        verificationToken.setUser(users);
        verificationToken.setExpiryDate(LocalDateTime.now().plusHours(24));

        tokenRepository.save(verificationToken);

        sendVerificationEmail(users.getEmail(), token);

        return customerMapper.toCustomerResposne(customerRepository.save(users));
    }

    public void sendVerificationEmail(String toEmail, String token) {

        String subject = "Xác nhận tài khoản";

        String verificationUrl =
                "http://localhost:8081/api/v1/auth/verify?token=" + token;

        String content =
                "<h3>Nhấn vào link bên dưới để xác nhận tài khoản:</h3>"
                        + "<a href=\"" + verificationUrl + "\">Xác nhận tài khoản</a>";

        MimeMessage message = mailSender.createMimeMessage();

        try {

            MimeMessageHelper helper =
                    new MimeMessageHelper(message, true);

            helper.setTo("dphuc081003@gmail.com");
            helper.setSubject(subject);
            helper.setText(content, true);

            mailSender.send(message);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public ResponsePasswordReset resetPassword(ResetPasswordRequest request) {
        if(customerRepository.existsByEmail(request.getEmail())){
            String password = UUID.randomUUID().toString().replace("-", "");
            sendPasswordEmail(password);

            Users users = customerRepository.findByEmail(request.getEmail());
            users.setPassword(new BCryptPasswordEncoder().encode(password));
            return customerMapper.toResponsePasswordReset(customerRepository.save(users));
        }
        return null;
    }

    private void sendPasswordEmail(String password) {
        String subject = "Lấy lại mật khẩu";

        String content = "<h3>Đây là mật khẩu mới của bạn: \"" + password + "\" </h3>";

        MimeMessage message = mailSender.createMimeMessage();

        try {

            MimeMessageHelper helper =
                    new MimeMessageHelper(message, true);

            helper.setTo("dphuc081003@gmail.com");
            helper.setSubject(subject);
            helper.setText(content, true);

            mailSender.send(message);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public CustomerResponse getByUsername(String username) {
        Users users = customerRepository.findByEmail(username);
        return customerMapper.toCustomerResposne(users);
    }

    @Override
    public CustomerResponse changeUserPassword(Authentication authentication, ChangePassword request) {
        if(customerRepository.existsByEmail(authentication.getName())){
            Users users = customerRepository.findByEmail(authentication.getName());
            boolean match = passwordEncoder.matches(request.getCurrentPassword(), users.getPassword());
            if(!match){
                throw new RuntimeException("Current password is incorrect");
            }
            if(request.getNewPassword().equals(request.getConfirmPassword())){
                throw new RuntimeException("Passwords do not match");
            }

            // 4. Save new password
            users.setPassword(new BCryptPasswordEncoder().encode(request.getNewPassword()));

            customerRepository.save(users);

            return customerMapper.toCustomerResposne(users);
        }
        return null;
    }

}
