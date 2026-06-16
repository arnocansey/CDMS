package com.cdms.service;

import com.cdms.dto.*;
import com.cdms.entity.*;
import com.cdms.exception.ResourceNotFoundException;
import com.cdms.repository.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class FinancialService {

    private final DonationRepository donationRepository;
    private final TitheRepository titheRepository;
    private final OfferingRepository offeringRepository;
    private final ExpenseRepository expenseRepository;
    private final MemberRepository memberRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;
    private final CashFlowEntryRepository cashFlowEntryRepository;
    private final BudgetRepository budgetRepository;

    public FinancialService(DonationRepository donationRepository, TitheRepository titheRepository,
                           OfferingRepository offeringRepository, ExpenseRepository expenseRepository,
                           MemberRepository memberRepository, UserRepository userRepository,
                           AuditLogService auditLogService, CashFlowEntryRepository cashFlowEntryRepository,
                           BudgetRepository budgetRepository) {
        this.donationRepository = donationRepository;
        this.titheRepository = titheRepository;
        this.offeringRepository = offeringRepository;
        this.expenseRepository = expenseRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
        this.cashFlowEntryRepository = cashFlowEntryRepository;
        this.budgetRepository = budgetRepository;
    }

    public List<DonationDto> getDonations(LocalDate startDate, LocalDate endDate) {
        return donationRepository.findByDonationDateBetween(startDate, endDate).stream()
                .map(this::mapDonationToDto)
                .collect(Collectors.toList());
    }

    public DonationDto createDonation(DonationDto donationDto) {
        Donation donation = new Donation();
        donation.setAmount(donationDto.getAmount());
        donation.setCategory(donationDto.getCategory());
        donation.setDescription(donationDto.getDescription());
        donation.setDonationDate(donationDto.getDonationDate() != null ? donationDto.getDonationDate() : LocalDate.now());
        donation.setPaymentMethod(donationDto.getPaymentMethod());
        donation.setReferenceNumber(donationDto.getReferenceNumber());

        if (donationDto.getMemberId() != null) {
            Member member = memberRepository.findById(donationDto.getMemberId())
                    .orElseThrow(() -> new ResourceNotFoundException("Member", donationDto.getMemberId()));
            donation.setMember(member);
        }

        Donation savedDonation = donationRepository.save(donation);
        
        CashFlowEntry cashFlowEntry = new CashFlowEntry();
        cashFlowEntry.setEntryDate(savedDonation.getDonationDate());
        cashFlowEntry.setEntryType("INCOME");
        cashFlowEntry.setCategory("DONATION");
        cashFlowEntry.setAmount(savedDonation.getAmount());
        cashFlowEntry.setSource("DONATION");
        cashFlowEntry.setSourceId(savedDonation.getId());
        cashFlowEntryRepository.save(cashFlowEntry);
        
        auditLogService.log(getCurrentUserId(), "CREATE", "DONATION", savedDonation.getId(),
                null, String.format("{\"amount\":%s,\"category\":\"%s\"}", savedDonation.getAmount(), savedDonation.getCategory()));
        return mapDonationToDto(savedDonation);
    }

    public List<TitheDto> getTithes(LocalDate startDate, LocalDate endDate) {
        return titheRepository.findByTitheDateBetween(startDate, endDate).stream()
                .map(this::mapTitheToDto)
                .collect(Collectors.toList());
    }

    public TitheDto createTithe(TitheDto titheDto) {
        Member member = memberRepository.findById(titheDto.getMemberId())
                .orElseThrow(() -> new ResourceNotFoundException("Member", titheDto.getMemberId()));

        Tithe tithe = new Tithe();
        tithe.setMember(member);
        tithe.setAmount(titheDto.getAmount());
        tithe.setTitheDate(titheDto.getTitheDate() != null ? titheDto.getTitheDate() : LocalDate.now());
        tithe.setPaymentMethod(titheDto.getPaymentMethod());
        tithe.setReferenceNumber(titheDto.getReferenceNumber());

        Tithe savedTithe = titheRepository.save(tithe);
        
        CashFlowEntry cashFlowEntry = new CashFlowEntry();
        cashFlowEntry.setEntryDate(savedTithe.getTitheDate());
        cashFlowEntry.setEntryType("INCOME");
        cashFlowEntry.setCategory("TITHE");
        cashFlowEntry.setAmount(savedTithe.getAmount());
        cashFlowEntry.setSource("TITHE");
        cashFlowEntry.setSourceId(savedTithe.getId());
        cashFlowEntryRepository.save(cashFlowEntry);
        
        auditLogService.log(getCurrentUserId(), "CREATE", "TITHE", savedTithe.getId(),
                null, String.format("{\"amount\":%s,\"memberId\":%s}", savedTithe.getAmount(), savedTithe.getMember().getId()));
        return mapTitheToDto(savedTithe);
    }

    public List<OfferingDto> getOfferings(LocalDate startDate, LocalDate endDate) {
        return offeringRepository.findByServiceDateBetween(startDate, endDate).stream()
                .map(this::mapOfferingToDto)
                .collect(Collectors.toList());
    }

    public OfferingDto createOffering(OfferingDto offeringDto) {
        Offering offering = new Offering();
        offering.setServiceDate(offeringDto.getServiceDate() != null ? offeringDto.getServiceDate() : LocalDate.now());
        offering.setServiceType(offeringDto.getServiceType());
        offering.setAmount(offeringDto.getAmount());
        offering.setOfferingType(offeringDto.getOfferingType());
        offering.setDescription(offeringDto.getDescription());
        offering.setRecordedBy(offeringDto.getRecordedBy());

        Offering savedOffering = offeringRepository.save(offering);
        
        CashFlowEntry cashFlowEntry = new CashFlowEntry();
        cashFlowEntry.setEntryDate(savedOffering.getServiceDate());
        cashFlowEntry.setEntryType("INCOME");
        cashFlowEntry.setCategory("OFFERING");
        cashFlowEntry.setAmount(savedOffering.getAmount());
        cashFlowEntry.setSource("OFFERING");
        cashFlowEntry.setSourceId(savedOffering.getId());
        cashFlowEntryRepository.save(cashFlowEntry);
        
        auditLogService.log(getCurrentUserId(), "CREATE", "OFFERING", savedOffering.getId(),
                null, String.format("{\"amount\":%s,\"serviceType\":\"%s\"}", savedOffering.getAmount(), savedOffering.getServiceType()));
        return mapOfferingToDto(savedOffering);
    }

    public List<ExpenseDto> getExpenses(LocalDate startDate, LocalDate endDate) {
        return expenseRepository.findByExpenseDateBetween(startDate, endDate).stream()
                .map(this::mapExpenseToDto)
                .collect(Collectors.toList());
    }

    public ExpenseDto createExpense(ExpenseDto expenseDto) {
        Expense expense = new Expense();
        expense.setCategory(expenseDto.getCategory());
        expense.setAmount(expenseDto.getAmount());
        expense.setDescription(expenseDto.getDescription());
        expense.setExpenseDate(expenseDto.getExpenseDate() != null ? expenseDto.getExpenseDate() : LocalDate.now());
        expense.setPaymentMethod(expenseDto.getPaymentMethod());
        expense.setReceiptUrl(expenseDto.getReceiptUrl());
        expense.setApprovedBy(expenseDto.getApprovedBy());
        expense.setReceiptAttached(expenseDto.getReceiptAttached());
        expense.setApprovedByUserId(expenseDto.getApprovedByUserId());

        Expense savedExpense = expenseRepository.save(expense);
        
        CashFlowEntry cashFlowEntry = new CashFlowEntry();
        cashFlowEntry.setEntryDate(savedExpense.getExpenseDate());
        cashFlowEntry.setEntryType("EXPENSE");
        cashFlowEntry.setCategory(savedExpense.getCategory());
        cashFlowEntry.setAmount(savedExpense.getAmount());
        cashFlowEntry.setSource("EXPENSE");
        cashFlowEntry.setSourceId(savedExpense.getId());
        cashFlowEntryRepository.save(cashFlowEntry);
        
        List<Budget> budgets = budgetRepository.findByCategory(savedExpense.getCategory());
        for (Budget budget : budgets) {
            if (budget.getPeriod() != null && isDateInPeriod(savedExpense.getExpenseDate(), budget.getPeriod())) {
                budget.setSpent(budget.getSpent().add(savedExpense.getAmount()));
                budgetRepository.save(budget);
                break;
            }
        }
        
        auditLogService.log(getCurrentUserId(), "CREATE", "EXPENSE", savedExpense.getId(),
                null, String.format("{\"amount\":%s,\"category\":\"%s\"}", savedExpense.getAmount(), savedExpense.getCategory()));
        return mapExpenseToDto(savedExpense);
    }

    public BigDecimal getTotalDonations(LocalDate startDate, LocalDate endDate) {
        return donationRepository.sumByDateRange(startDate, endDate);
    }

    public BigDecimal getTotalTithes(LocalDate startDate, LocalDate endDate) {
        return titheRepository.sumByDateRange(startDate, endDate);
    }

    public BigDecimal getTotalOfferings(LocalDate startDate, LocalDate endDate) {
        return offeringRepository.sumByDateRange(startDate, endDate);
    }

    public BigDecimal getTotalExpenses(LocalDate startDate, LocalDate endDate) {
        return expenseRepository.sumByDateRange(startDate, endDate);
    }

    public BigDecimal getNetBalance(LocalDate startDate, LocalDate endDate) {
        BigDecimal totalIncome = getTotalDonations(startDate, endDate)
                .add(getTotalTithes(startDate, endDate))
                .add(getTotalOfferings(startDate, endDate));
        BigDecimal totalExpenses = getTotalExpenses(startDate, endDate);
        return totalIncome.subtract(totalExpenses);
    }

    private DonationDto mapDonationToDto(Donation donation) {
        DonationDto dto = new DonationDto();
        dto.setId(donation.getId());
        dto.setAmount(donation.getAmount());
        dto.setCategory(donation.getCategory());
        dto.setDescription(donation.getDescription());
        dto.setDonationDate(donation.getDonationDate());
        dto.setPaymentMethod(donation.getPaymentMethod());
        dto.setReferenceNumber(donation.getReferenceNumber());
        if (donation.getMember() != null) {
            dto.setMemberId(donation.getMember().getId());
            dto.setMemberName(donation.getMember().getFirstName() + " " + donation.getMember().getLastName());
        }
        return dto;
    }

    private TitheDto mapTitheToDto(Tithe tithe) {
        TitheDto dto = new TitheDto();
        dto.setId(tithe.getId());
        dto.setMemberId(tithe.getMember().getId());
        dto.setMemberName(tithe.getMember().getFirstName() + " " + tithe.getMember().getLastName());
        dto.setAmount(tithe.getAmount());
        dto.setTitheDate(tithe.getTitheDate());
        dto.setPaymentMethod(tithe.getPaymentMethod());
        dto.setReferenceNumber(tithe.getReferenceNumber());
        return dto;
    }

    private OfferingDto mapOfferingToDto(Offering offering) {
        OfferingDto dto = new OfferingDto();
        dto.setId(offering.getId());
        dto.setServiceDate(offering.getServiceDate());
        dto.setServiceType(offering.getServiceType());
        dto.setAmount(offering.getAmount());
        dto.setOfferingType(offering.getOfferingType());
        dto.setDescription(offering.getDescription());
        dto.setRecordedBy(offering.getRecordedBy());
        return dto;
    }

    private ExpenseDto mapExpenseToDto(Expense expense) {
        ExpenseDto dto = new ExpenseDto();
        dto.setId(expense.getId());
        dto.setCategory(expense.getCategory());
        dto.setAmount(expense.getAmount());
        dto.setDescription(expense.getDescription());
        dto.setExpenseDate(expense.getExpenseDate());
        dto.setPaymentMethod(expense.getPaymentMethod());
        dto.setReceiptUrl(expense.getReceiptUrl());
        dto.setApprovedBy(expense.getApprovedBy());
        dto.setReceiptAttached(expense.getReceiptAttached());
        dto.setApprovedByUserId(expense.getApprovedByUserId());
        return dto;
    }

    public MemberContributionHistoryDto getMemberContributionHistory(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member", memberId));

        List<Tithe> tithes = titheRepository.findByMemberId(memberId);
        List<Donation> donations = donationRepository.findByMemberId(memberId);

        List<MemberContributionHistoryDto.ContributionItem> contributions = new ArrayList<>();

        for (Tithe tithe : tithes) {
            contributions.add(new MemberContributionHistoryDto.ContributionItem(
                    tithe.getId(), "TITHE", tithe.getAmount(), tithe.getTitheDate(), "Tithe contribution"));
        }

        for (Donation donation : donations) {
            contributions.add(new MemberContributionHistoryDto.ContributionItem(
                    donation.getId(), "DONATION", donation.getAmount(), donation.getDonationDate(), donation.getDescription()));
        }

        contributions.sort(Comparator.comparing(MemberContributionHistoryDto.ContributionItem::getDate).reversed());

        BigDecimal totalContributions = contributions.stream()
                .map(MemberContributionHistoryDto.ContributionItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        LocalDate now = LocalDate.now();
        LocalDate oneMonthAgo = now.minusMonths(1);
        LocalDate oneYearAgo = now.minusYears(1);

        BigDecimal monthlyContributions = contributions.stream()
                .filter(c -> c.getDate() != null && !c.getDate().isBefore(oneMonthAgo))
                .map(MemberContributionHistoryDto.ContributionItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal annualContributions = contributions.stream()
                .filter(c -> c.getDate() != null && !c.getDate().isBefore(oneYearAgo))
                .map(MemberContributionHistoryDto.ContributionItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        String frequency = calculateContributionFrequency(contributions);

        MemberContributionHistoryDto dto = new MemberContributionHistoryDto();
        dto.setMemberId(memberId);
        dto.setMemberName(member.getFirstName() + " " + member.getLastName());
        dto.setTotalContributions(totalContributions);
        dto.setMonthlyContributions(monthlyContributions);
        dto.setAnnualContributions(annualContributions);
        dto.setContributionFrequency(frequency);
        dto.setContributions(contributions);

        return dto;
    }

    public List<Map<String, Object>> getTopContributors(int limit) {
        Map<Long, BigDecimal> memberTotals = new HashMap<>();
        Map<Long, String> memberNames = new HashMap<>();

        List<Tithe> allTithes = titheRepository.findAll();
        for (Tithe tithe : allTithes) {
            Long memberId = tithe.getMember().getId();
            memberTotals.merge(memberId, tithe.getAmount(), BigDecimal::add);
            memberNames.putIfAbsent(memberId, tithe.getMember().getFirstName() + " " + tithe.getMember().getLastName());
        }

        List<Donation> allDonations = donationRepository.findAll();
        for (Donation donation : allDonations) {
            if (donation.getMember() != null) {
                Long memberId = donation.getMember().getId();
                memberTotals.merge(memberId, donation.getAmount(), BigDecimal::add);
                memberNames.putIfAbsent(memberId, donation.getMember().getFirstName() + " " + donation.getMember().getLastName());
            }
        }

        return memberTotals.entrySet().stream()
                .sorted(Map.Entry.<Long, BigDecimal>comparingByValue().reversed())
                .limit(limit)
                .map(entry -> {
                    Map<String, Object> contributor = new LinkedHashMap<>();
                    contributor.put("memberId", entry.getKey());
                    contributor.put("memberName", memberNames.get(entry.getKey()));
                    contributor.put("totalContributions", entry.getValue());
                    return contributor;
                })
                .collect(Collectors.toList());
    }

    public Map<String, Object> getContributionSummaryByPeriod(String period) {
        Map<String, Object> summary = new LinkedHashMap<>();
        LocalDate now = LocalDate.now();

        List<LocalDate> dates = new ArrayList<>();
        switch (period.toLowerCase()) {
            case "daily":
                for (int i = 6; i >= 0; i--) {
                    dates.add(now.minusDays(i));
                }
                break;
            case "weekly":
                for (int i = 3; i >= 0; i--) {
                    dates.add(now.minusWeeks(i));
                }
                break;
            case "monthly":
                for (int i = 5; i >= 0; i--) {
                    dates.add(now.minusMonths(i));
                }
                break;
            default:
                throw new IllegalArgumentException("Invalid period: " + period + ". Must be daily, weekly, or monthly");
        }

        List<Map<String, Object>> periodData = new ArrayList<>();

        for (int i = 0; i < dates.size(); i++) {
            LocalDate startDate;
            LocalDate endDate;

            switch (period.toLowerCase()) {
                case "daily":
                    startDate = dates.get(i);
                    endDate = dates.get(i);
                    break;
                case "weekly":
                    startDate = dates.get(i);
                    endDate = startDate.plusWeeks(1).minusDays(1);
                    break;
                case "monthly":
                    startDate = dates.get(i).withDayOfMonth(1);
                    endDate = startDate.plusMonths(1).minusDays(1);
                    break;
                default:
                    throw new IllegalArgumentException("Invalid period");
            }

            BigDecimal tithes = getTotalTithes(startDate, endDate);
            BigDecimal donations = getTotalDonations(startDate, endDate);
            BigDecimal offerings = getTotalOfferings(startDate, endDate);
            BigDecimal total = tithes.add(donations).add(offerings);

            Map<String, Object> periodEntry = new LinkedHashMap<>();
            periodEntry.put("period", startDate.toString() + " to " + endDate.toString());
            periodEntry.put("tithes", tithes);
            periodEntry.put("donations", donations);
            periodEntry.put("offerings", offerings);
            periodEntry.put("total", total);

            periodData.add(periodEntry);
        }

        summary.put("period", period);
        summary.put("data", periodData);
        summary.put("generatedAt", now.toString());

        return summary;
    }

    private String calculateContributionFrequency(List<MemberContributionHistoryDto.ContributionItem> contributions) {
        if (contributions.size() < 2) {
            return "INSUFFICIENT_DATA";
        }

        List<MemberContributionHistoryDto.ContributionItem> sorted = contributions.stream()
                .filter(c -> c.getDate() != null)
                .sorted(Comparator.comparing(MemberContributionHistoryDto.ContributionItem::getDate))
                .collect(Collectors.toList());

        if (sorted.size() < 2) {
            return "INSUFFICIENT_DATA";
        }

        long totalDays = ChronoUnit.DAYS.between(sorted.get(0).getDate(), sorted.get(sorted.size() - 1).getDate());
        if (totalDays == 0) {
            return "SINGLE_DAY";
        }

        double avgDaysBetween = (double) totalDays / (sorted.size() - 1);

        if (avgDaysBetween <= 10) {
            return "WEEKLY";
        } else if (avgDaysBetween <= 20) {
            return "BIWEEKLY";
        } else if (avgDaysBetween <= 40) {
            return "MONTHLY";
        } else if (avgDaysBetween <= 100) {
            return "QUARTERLY";
        } else {
            return "ANNUAL";
        }
    }

    private boolean isDateInPeriod(LocalDate date, String period) {
        if (date == null || period == null) {
            return false;
        }
        
        YearMonth dateMonth = YearMonth.from(date);
        YearMonth now = YearMonth.now();
        
        switch (period.toUpperCase()) {
            case "MONTHLY":
                return dateMonth.equals(now);
            case "QUARTERLY":
                int currentQuarter = (now.getMonthValue() - 1) / 3 + 1;
                int dateQuarter = (dateMonth.getMonthValue() - 1) / 3 + 1;
                return now.getYear() == dateMonth.getYear() && currentQuarter == dateQuarter;
            case "YEARLY":
                return now.getYear() == dateMonth.getYear();
            case "WEEKLY":
                return date.isEqual(LocalDate.now().minusDays(LocalDate.now().getDayOfWeek().getValue() - 1));
            default:
                return false;
        }
    }

    public Map<String, Object> getFinanceSummary() {
        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        LocalDate endOfMonth = now.withDayOfMonth(now.lengthOfMonth());

        BigDecimal totalDonations = donationRepository.findByDonationDateBetween(startOfMonth, endOfMonth).stream()
                .map(Donation::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpenses = expenseRepository.findByExpenseDateBetween(startOfMonth, endOfMonth).stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal netBalance = totalDonations.subtract(totalExpenses);

        return Map.of(
                "totalDonations", totalDonations,
                "totalExpenses", totalExpenses,
                "netBalance", netBalance
        );
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof String) {
            String email = (String) auth.getPrincipal();
            return userRepository.findByEmail(email).map(User::getId).orElse(null);
        }
        return null;
    }
}
