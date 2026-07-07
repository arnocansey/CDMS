package com.cdms.service;

import com.cdms.entity.Donation;
import com.cdms.entity.Expense;
import com.cdms.entity.ImportJob;
import com.cdms.entity.Member;
import com.cdms.exception.BadRequestException;
import com.cdms.exception.ResourceNotFoundException;
import com.cdms.repository.DonationRepository;
import com.cdms.repository.ExpenseRepository;
import com.cdms.repository.ImportJobRepository;
import com.cdms.repository.MemberRepository;
import com.cdms.security.TenantContext;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;

@Service
public class CsvImportService {

    private final ImportJobRepository importJobRepository;
    private final MemberRepository memberRepository;
    private final DonationRepository donationRepository;
    private final ExpenseRepository expenseRepository;
    private final ObjectMapper objectMapper;

    public CsvImportService(ImportJobRepository importJobRepository,
                            MemberRepository memberRepository,
                            DonationRepository donationRepository,
                            ExpenseRepository expenseRepository,
                            ObjectMapper objectMapper) {
        this.importJobRepository = importJobRepository;
        this.memberRepository = memberRepository;
        this.donationRepository = donationRepository;
        this.expenseRepository = expenseRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public ImportJob importMembers(Long churchId, MultipartFile file, String createdBy) {
        ImportJob job = new ImportJob();
        job.setChurchId(churchId);
        job.setImportType("MEMBERS");
        job.setStatus("PROCESSING");
        job.setFilename(file.getOriginalFilename());
        job.setCreatedBy(createdBy);
        job = importJobRepository.save(job);

        List<String> errors = new ArrayList<>();
        int totalRows = 0;
        int successRows = 0;
        int errorRows = 0;

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String headerLine = reader.readLine();
            if (headerLine == null) {
                throw new BadRequestException("CSV file is empty");
            }

            String line;
            while ((line = reader.readLine()) != null) {
                totalRows++;
                try {
                    String[] values = parseCsvLine(line);
                    if (values.length < 3) {
                        errors.add("Row " + totalRows + ": Missing required fields (firstName, lastName, email)");
                        errorRows++;
                        continue;
                    }

                    String firstName = values[0].trim();
                    String lastName = values[1].trim();
                    String email = values[2].trim();
                    String phone = values.length > 3 ? values[3].trim() : "";

                    if (firstName.isEmpty() || lastName.isEmpty() || email.isEmpty()) {
                        errors.add("Row " + totalRows + ": firstName, lastName, and email are required");
                        errorRows++;
                        continue;
                    }

                    if (memberRepository.existsByEmailAndChurchId(email, churchId)) {
                        errors.add("Row " + totalRows + ": Duplicate email '" + email + "'");
                        errorRows++;
                        continue;
                    }

                    Member member = new Member();
                    member.setChurchId(churchId);
                    member.setFirstName(firstName);
                    member.setLastName(lastName);
                    member.setEmail(email);
                    member.setPhone(phone);
                    member.setActive(true);
                    memberRepository.save(member);
                    successRows++;
                } catch (Exception e) {
                    errors.add("Row " + totalRows + ": " + e.getMessage());
                    errorRows++;
                }
            }
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Failed to read CSV file: " + e.getMessage());
        }

        job.setTotalRows(totalRows);
        job.setProcessedRows(totalRows);
        job.setSuccessRows(successRows);
        job.setErrorRows(errorRows);
        job.setErrors(serializeErrors(errors));
        job.setStatus("COMPLETED");
        job.setCompletedAt(LocalDateTime.now());

        return importJobRepository.save(job);
    }

    @Transactional
    public ImportJob importDonations(Long churchId, MultipartFile file, String createdBy) {
        ImportJob job = new ImportJob();
        job.setChurchId(churchId);
        job.setImportType("DONATIONS");
        job.setStatus("PROCESSING");
        job.setFilename(file.getOriginalFilename());
        job.setCreatedBy(createdBy);
        job = importJobRepository.save(job);

        List<String> errors = new ArrayList<>();
        int totalRows = 0;
        int successRows = 0;
        int errorRows = 0;

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String headerLine = reader.readLine();
            if (headerLine == null) {
                throw new BadRequestException("CSV file is empty");
            }

            String line;
            while ((line = reader.readLine()) != null) {
                totalRows++;
                try {
                    String[] values = parseCsvLine(line);
                    if (values.length < 4) {
                        errors.add("Row " + totalRows + ": Missing required fields (memberEmail, amount, category, date)");
                        errorRows++;
                        continue;
                    }

                    String memberEmail = values[0].trim();
                    String amountStr = values[1].trim();
                    String category = values[2].trim();
                    String dateStr = values[3].trim();
                    String method = values.length > 4 ? values[4].trim() : null;

                    if (memberEmail.isEmpty() || amountStr.isEmpty() || category.isEmpty() || dateStr.isEmpty()) {
                        errors.add("Row " + totalRows + ": memberEmail, amount, category, and date are required");
                        errorRows++;
                        continue;
                    }

                    Optional<Member> memberOpt = memberRepository.findByEmailAndChurchId(memberEmail, churchId);
                    if (memberOpt.isEmpty()) {
                        errors.add("Row " + totalRows + ": Member not found with email '" + memberEmail + "' in this church");
                        errorRows++;
                        continue;
                    }

                    BigDecimal amount;
                    try {
                        amount = new BigDecimal(amountStr);
                    } catch (NumberFormatException e) {
                        errors.add("Row " + totalRows + ": Invalid amount '" + amountStr + "'");
                        errorRows++;
                        continue;
                    }

                    LocalDate donationDate;
                    try {
                        donationDate = LocalDate.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE);
                    } catch (DateTimeParseException e) {
                        errors.add("Row " + totalRows + ": Invalid date '" + dateStr + "'");
                        errorRows++;
                        continue;
                    }

                    Donation donation = new Donation(amount, category, donationDate);
                    donation.setChurchId(churchId);
                    donation.setMember(memberOpt.get());
                    donation.setPaymentMethod(method);
                    donationRepository.save(donation);
                    successRows++;
                } catch (Exception e) {
                    errors.add("Row " + totalRows + ": " + e.getMessage());
                    errorRows++;
                }
            }
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Failed to read CSV file: " + e.getMessage());
        }

        job.setTotalRows(totalRows);
        job.setProcessedRows(totalRows);
        job.setSuccessRows(successRows);
        job.setErrorRows(errorRows);
        job.setErrors(serializeErrors(errors));
        job.setStatus("COMPLETED");
        job.setCompletedAt(LocalDateTime.now());

        return importJobRepository.save(job);
    }

    @Transactional
    public ImportJob importExpenses(Long churchId, MultipartFile file, String createdBy) {
        ImportJob job = new ImportJob();
        job.setChurchId(churchId);
        job.setImportType("EXPENSES");
        job.setStatus("PROCESSING");
        job.setFilename(file.getOriginalFilename());
        job.setCreatedBy(createdBy);
        job = importJobRepository.save(job);

        List<String> errors = new ArrayList<>();
        int totalRows = 0;
        int successRows = 0;
        int errorRows = 0;

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String headerLine = reader.readLine();
            if (headerLine == null) {
                throw new BadRequestException("CSV file is empty");
            }

            String line;
            while ((line = reader.readLine()) != null) {
                totalRows++;
                try {
                    String[] values = parseCsvLine(line);
                    if (values.length < 3) {
                        errors.add("Row " + totalRows + ": Missing required fields (category, amount, date)");
                        errorRows++;
                        continue;
                    }

                    String category = values[0].trim();
                    String amountStr = values[1].trim();
                    String dateStr = values[2].trim();
                    String description = values.length > 3 ? values[3].trim() : null;

                    if (category.isEmpty() || amountStr.isEmpty() || dateStr.isEmpty()) {
                        errors.add("Row " + totalRows + ": category, amount, and date are required");
                        errorRows++;
                        continue;
                    }

                    BigDecimal amount;
                    try {
                        amount = new BigDecimal(amountStr);
                    } catch (NumberFormatException e) {
                        errors.add("Row " + totalRows + ": Invalid amount '" + amountStr + "'");
                        errorRows++;
                        continue;
                    }

                    LocalDate expenseDate;
                    try {
                        expenseDate = LocalDate.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE);
                    } catch (DateTimeParseException e) {
                        errors.add("Row " + totalRows + ": Invalid date '" + dateStr + "'");
                        errorRows++;
                        continue;
                    }

                    Expense expense = new Expense(category, amount, expenseDate);
                    expense.setChurchId(churchId);
                    expense.setDescription(description);
                    expenseRepository.save(expense);
                    successRows++;
                } catch (Exception e) {
                    errors.add("Row " + totalRows + ": " + e.getMessage());
                    errorRows++;
                }
            }
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Failed to read CSV file: " + e.getMessage());
        }

        job.setTotalRows(totalRows);
        job.setProcessedRows(totalRows);
        job.setSuccessRows(successRows);
        job.setErrorRows(errorRows);
        job.setErrors(serializeErrors(errors));
        job.setStatus("COMPLETED");
        job.setCompletedAt(LocalDateTime.now());

        return importJobRepository.save(job);
    }

    public List<ImportJob> getImportHistory(Long churchId) {
        return importJobRepository.findByChurchId(churchId);
    }

    public List<String> getImportErrors(Long importId) {
        ImportJob job = importJobRepository.findById(importId)
                .orElseThrow(() -> new ResourceNotFoundException("ImportJob", importId));
        Long churchId = TenantContext.getChurchId();
        if (churchId != null && !job.getChurchId().equals(churchId)) {
            throw new ResourceNotFoundException("ImportJob", importId);
        }
        if (job.getErrors() == null) {
            return Collections.emptyList();
        }
        try {
            return Arrays.asList(objectMapper.readValue(job.getErrors(), String[].class));
        } catch (Exception e) {
            return Collections.singletonList(job.getErrors());
        }
    }

    private String[] parseCsvLine(String line) {
        List<String> values = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;

        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '"') {
                if (inQuotes && i + 1 < line.length() && line.charAt(i + 1) == '"') {
                    current.append('"');
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (c == ',' && !inQuotes) {
                values.add(current.toString());
                current = new StringBuilder();
            } else {
                current.append(c);
            }
        }
        values.add(current.toString());

        return values.toArray(new String[0]);
    }

    private String serializeErrors(List<String> errors) {
        if (errors.isEmpty()) return null;
        try {
            return objectMapper.writeValueAsString(errors);
        } catch (Exception e) {
            return errors.toString();
        }
    }
}
