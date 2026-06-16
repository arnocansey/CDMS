package com.cdms.service;

import com.cdms.entity.TwoFactorAuth;
import com.cdms.entity.User;
import com.cdms.exception.BadRequestException;
import com.cdms.exception.ResourceNotFoundException;
import com.cdms.repository.TwoFactorAuthRepository;
import com.cdms.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class TwoFactorAuthService {

    private static final int SECRET_LENGTH = 20;
    private static final int TOTP_DIGITS = 6;
    private static final long TOTP_PERIOD = 30L;
    private static final int TOTP_WINDOW = 1;
    private static final String BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

    private final TwoFactorAuthRepository twoFactorAuthRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public TwoFactorAuthService(TwoFactorAuthRepository twoFactorAuthRepository,
                                 UserRepository userRepository,
                                 PasswordEncoder passwordEncoder) {
        this.twoFactorAuthRepository = twoFactorAuthRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public String generateSecret(Long userId) {
        SecureRandom secureRandom = new SecureRandom();
        byte[] buffer = new byte[SECRET_LENGTH];
        secureRandom.nextBytes(buffer);

        StringBuilder base32 = new StringBuilder();
        for (int i = 0; i < buffer.length; i++) {
            int unsignedByte = buffer[i] & 0xFF;
            base32.append(BASE32_CHARS.charAt((unsignedByte & 0xF8) >> 3));
            base32.append(BASE32_CHARS.charAt((unsignedByte & 0x07) << 2 | ((i + 1 < buffer.length) ? (buffer[i + 1] & 0xFF) >> 6 : 0)));
        }

        String secret = base32.toString().substring(0, 32);

        TwoFactorAuth existing = twoFactorAuthRepository.findByUserId(userId).orElse(null);
        if (existing == null) {
            TwoFactorAuth tfa = new TwoFactorAuth(userId, secret);
            twoFactorAuthRepository.save(tfa);
        } else {
            existing.setSecretKey(secret);
            existing.setEnabled(false);
            twoFactorAuthRepository.save(existing);
        }

        return secret;
    }

    public String getQrCodeUri(String secret, String email) {
        String issuer = "CDMS";
        return "otpauth://totp/" + issuer + ":" + email
                + "?secret=" + secret
                + "&issuer=" + issuer
                + "&algorithm=SHA1"
                + "&digits=" + TOTP_DIGITS
                + "&period=" + TOTP_PERIOD;
    }

    public void enable(Long userId, String code) {
        TwoFactorAuth tfa = twoFactorAuthRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("2FA not set up for this user"));

        if (tfa.isEnabled()) {
            throw new BadRequestException("2FA is already enabled");
        }

        if (!verifyTotpCode(tfa.getSecretKey(), code)) {
            throw new BadRequestException("Invalid verification code");
        }

        tfa.setEnabled(true);
        twoFactorAuthRepository.save(tfa);

        generateBackupCodes(userId);
    }

    public void disable(Long userId, String password) {
        TwoFactorAuth tfa = twoFactorAuthRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("2FA not set up for this user"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BadRequestException("Invalid password");
        }

        tfa.setEnabled(false);
        tfa.setBackupCodes(null);
        twoFactorAuthRepository.save(tfa);
    }

    public boolean verifyCode(Long userId, String code) {
        TwoFactorAuth tfa = twoFactorAuthRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("2FA not set up for this user"));

        if (!tfa.isEnabled()) {
            throw new BadRequestException("2FA is not enabled");
        }

        if (verifyTotpCode(tfa.getSecretKey(), code)) {
            tfa.setLastUsedCode(code);
            twoFactorAuthRepository.save(tfa);
            return true;
        }

        return validateBackupCode(userId, code);
    }

    public List<String> generateBackupCodes(Long userId) {
        TwoFactorAuth tfa = twoFactorAuthRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("2FA not set up for this user"));

        Random random = new SecureRandom();
        List<String> codes = new ArrayList<>();
        List<String> hashedCodes = new ArrayList<>();

        for (int i = 0; i < 8; i++) {
            String code = String.format("%08d", random.nextInt(100000000));
            codes.add(code);
            hashedCodes.add(passwordEncoder.encode(code));
        }

        tfa.setBackupCodes(String.join(",", hashedCodes));
        twoFactorAuthRepository.save(tfa);

        return codes;
    }

    public boolean validateBackupCode(Long userId, String code) {
        TwoFactorAuth tfa = twoFactorAuthRepository.findByUserId(userId).orElse(null);
        if (tfa == null || tfa.getBackupCodes() == null || tfa.getBackupCodes().isEmpty()) {
            return false;
        }

        String[] hashedCodes = tfa.getBackupCodes().split(",");
        for (int i = 0; i < hashedCodes.length; i++) {
            if (passwordEncoder.matches(code, hashedCodes[i])) {
                StringBuilder newCodes = new StringBuilder();
                for (int j = 0; j < hashedCodes.length; j++) {
                    if (j != i) {
                        if (newCodes.length() > 0) newCodes.append(",");
                        newCodes.append(hashedCodes[j]);
                    }
                }
                tfa.setBackupCodes(newCodes.length() > 0 ? newCodes.toString() : null);
                twoFactorAuthRepository.save(tfa);
                return true;
            }
        }
        return false;
    }

    public boolean isSetup(Long userId) {
        Optional<TwoFactorAuth> tfa = twoFactorAuthRepository.findByUserId(userId);
        return tfa.isPresent();
    }

    public TwoFactorAuth getStatus(Long userId) {
        return twoFactorAuthRepository.findByUserId(userId).orElse(null);
    }

    private boolean verifyTotpCode(String secret, String code) {
        long currentTime = System.currentTimeMillis() / 1000L;
        long timeStep = currentTime / TOTP_PERIOD;

        for (long i = -TOTP_WINDOW; i <= TOTP_WINDOW; i++) {
            String generatedCode = generateTotpCode(secret, timeStep + i);
            if (generatedCode.equals(code)) {
                return true;
            }
        }
        return false;
    }

    private String generateTotpCode(String secret, long timeStep) {
        try {
            byte[] decodedSecret = base32Decode(secret);
            Mac mac = Mac.getInstance("HmacSHA1");
            mac.init(new SecretKeySpec(decodedSecret, "HmacSHA1"));

            ByteBuffer buffer = ByteBuffer.allocate(8);
            buffer.putLong(timeStep);
            byte[] hash = mac.doFinal(buffer.array());

            int offset = hash[hash.length - 1] & 0x0F;
            int binary = ((hash[offset] & 0x7F) << 24)
                    | ((hash[offset + 1] & 0xFF) << 16)
                    | ((hash[offset + 2] & 0xFF) << 8)
                    | (hash[offset + 3] & 0xFF);

            int otp = binary % (int) Math.pow(10, TOTP_DIGITS);

            return String.format("%0" + TOTP_DIGITS + "d", otp);
        } catch (Exception e) {
            throw new BadRequestException("Failed to generate TOTP code: " + e.getMessage());
        }
    }

    private byte[] base32Decode(String base32) {
        String cleaned = base32.replaceAll("[= ]", "").toUpperCase();
        int numBytes = cleaned.length() * 5 / 8;
        byte[] result = new byte[numBytes];

        int buffer = 0;
        int bitsLeft = 0;
        int index = 0;

        for (char c : cleaned.toCharArray()) {
            int val = BASE32_CHARS.indexOf(c);
            if (val < 0) continue;

            buffer = (buffer << 5) | val;
            bitsLeft += 5;

            if (bitsLeft >= 8) {
                result[index++] = (byte) (buffer >> (bitsLeft - 8));
                bitsLeft -= 8;
            }
        }

        if (index < numBytes) {
            result[index] = (byte) buffer;
        }

        return result;
    }
}
